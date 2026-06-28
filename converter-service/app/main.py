from __future__ import annotations

import re
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Iterable
from uuid import uuid4

import pandas as pd
import pdfplumber
import pytesseract
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pdf2image import convert_from_path

MAX_UPLOAD_BYTES = 25 * 1024 * 1024

app = FastAPI(title="PDF Converter Engine")


def assert_pdf(name: str, content: bytes) -> None:
    if not name.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")
    if len(content) == 0 or len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="PDF is outside the current size safeguard.")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="File is not a valid PDF.")


def normalize_cell(value: object) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def unique_headers(headers: Iterable[object], width: int) -> list[str]:
    seen: dict[str, int] = {}
    output: list[str] = []
    for index, header in enumerate(headers):
        base = normalize_cell(header) or f"Column {index + 1}"
        count = seen.get(base, 0)
        seen[base] = count + 1
        output.append(base if count == 0 else f"{base} {count + 1}")

    while len(output) < width:
        output.append(f"Column {len(output) + 1}")
    return output[:width]


def rows_to_dataframe(rows: list[list[str]]) -> pd.DataFrame | None:
    meaningful_rows = [row for row in rows if sum(1 for cell in row if cell) >= 2]
    if len(meaningful_rows) < 2:
        return None

    width = max(len(row) for row in meaningful_rows)
    if width < 2:
        return None

    padded = [row + [""] * (width - len(row)) for row in meaningful_rows]
    headers = unique_headers(padded[0], width)
    body = padded[1:]
    if not body:
        return None
    return pd.DataFrame(body, columns=headers)


def split_words_into_cells(words: list[dict[str, object]]) -> list[str]:
    if not words:
        return []

    sorted_words = sorted(words, key=lambda word: float(word["x0"]))
    split_gap = 16.0

    cells: list[str] = []
    current_parts = [str(sorted_words[0]["text"])]
    previous = sorted_words[0]
    for word in sorted_words[1:]:
        gap = float(word["x0"]) - float(previous["x1"])
        if gap >= split_gap:
            cells.append(normalize_cell(" ".join(current_parts)))
            current_parts = [str(word["text"])]
        else:
            current_parts.append(str(word["text"]))
        previous = word

    cells.append(normalize_cell(" ".join(current_parts)))
    return [cell for cell in cells if cell]


def extract_positioned_text_table(page: pdfplumber.page.Page) -> pd.DataFrame | None:
    words = page.extract_words(
        keep_blank_chars=False,
        use_text_flow=False,
        x_tolerance=2,
        y_tolerance=3,
    )
    if not words:
        return None

    lines: list[list[dict[str, object]]] = []
    for word in sorted(words, key=lambda item: (float(item["top"]), float(item["x0"]))):
        if not lines or abs(float(word["top"]) - float(lines[-1][0]["top"])) > 3:
            lines.append([word])
        else:
            lines[-1].append(word)

    rows = [split_words_into_cells(line) for line in lines]
    return rows_to_dataframe(rows)


def extract_pdf_tables(path: Path, password: str | None) -> list[pd.DataFrame]:
    dataframes: list[pd.DataFrame] = []
    with pdfplumber.open(path, password=password or None) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables(
                {
                    "vertical_strategy": "lines",
                    "horizontal_strategy": "lines",
                    "intersection_tolerance": 5,
                    "snap_tolerance": 3,
                    "join_tolerance": 3,
                }
            )

            if not tables:
                positioned_table = extract_positioned_text_table(page)
                if positioned_table is not None:
                    dataframes.append(positioned_table)
                continue

            for table in tables:
                rows = [[normalize_cell(cell) for cell in row] for row in table if any(normalize_cell(cell) for cell in row)]
                if not rows:
                    continue
                dataframe = rows_to_dataframe(rows)
                if dataframe is not None:
                    dataframes.append(dataframe)
    return dataframes


def ocr_pdf_pages(path: Path) -> list[pd.DataFrame]:
    dataframes: list[pd.DataFrame] = []
    images = convert_from_path(path, dpi=220, fmt="png")
    for page_index, image in enumerate(images, start=1):
        text = pytesseract.image_to_string(image)
        rows = [
            [normalize_cell(cell) for cell in re.split(r"\s{2,}", line.strip()) if normalize_cell(cell)]
            for line in text.splitlines()
            if line.strip()
        ]
        dataframe = rows_to_dataframe(rows)
        if dataframe is not None:
            dataframes.append(dataframe)
    return dataframes


def align_statement_tables(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    canonical_columns = list(dataframes[0].columns)
    aligned = [dataframes[0]]

    for dataframe in dataframes[1:]:
        current_columns = list(dataframe.columns)
        overlap = len(set(canonical_columns).intersection(current_columns))
        if overlap >= max(1, min(len(canonical_columns), len(current_columns)) // 2):
            aligned.append(dataframe)
            continue

        recovered_header_row: list[str] = []
        recovered_values: set[str] = set()
        for column in current_columns:
            match = re.match(r"^(.+) \d+$", str(column))
            value = match.group(1) if match and match.group(1) in recovered_values else str(column)
            recovered_header_row.append(value)
            recovered_values.add(value)

        renamed = pd.DataFrame([recovered_header_row] + dataframe.to_numpy().tolist(), columns=current_columns)
        column_map = {
            column: canonical_columns[index]
            for index, column in enumerate(current_columns)
            if index < len(canonical_columns)
        }
        renamed = renamed.rename(columns=column_map)
        aligned.append(renamed)

    return aligned


def build_workbook(dataframes: list[pd.DataFrame]) -> bytes:
    if not dataframes:
        raise HTTPException(status_code=422, detail="No extractable table or OCR text was found.")

    statement = pd.concat(align_statement_tables(dataframes), ignore_index=True, sort=False).fillna("")
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        statement.to_excel(writer, sheet_name="Statement", index=False)
    output.seek(0)
    return output.read()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/convert")
async def convert_pdf(file: UploadFile = File(...), password: str = Form("")) -> StreamingResponse:
    content = await file.read()
    assert_pdf(file.filename or "statement.pdf", content)

    with tempfile.TemporaryDirectory(prefix="pdf-converter-") as temp_dir:
        temp_path = Path(temp_dir) / f"{uuid4()}.pdf"
        temp_path.write_bytes(content)

        try:
            dataframes = extract_pdf_tables(temp_path, password.strip() or None)
        except Exception as exc:
            message = str(exc).lower()
            if "password" in message:
                raise HTTPException(status_code=401, detail="The PDF password is missing or incorrect.") from exc
            raise HTTPException(status_code=422, detail="The PDF could not be parsed as a digital document.") from exc

        if not dataframes:
            dataframes = ocr_pdf_pages(temp_path)

        workbook = build_workbook(dataframes)

    headers = {
        "Content-Disposition": 'attachment; filename="statement-conversion.xlsx"',
        "X-Processing-Mode": "server",
        "X-Cleanup-State": "completed",
    }
    return StreamingResponse(
        BytesIO(workbook),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )
