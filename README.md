# PDF Converter

A privacy-first financial statement PDF to Excel/CSV utility built with Next.js App Router and TypeScript.

## What is included

- Local-first digital PDF extraction in the browser.
- Self-hosted server-side PDF to Excel conversion engine.
- Text PDF table extraction with `pdfplumber`.
- OCR fallback for scanned PDFs with Tesseract.
- Editable conversion preview with undo, add row, delete row, CSV export, and XLSX export.
- Privacy receipt after download.
- Crawlable SEO landing pages that route into one shared converter.
- Ad and telemetry adapters that do not accept statement-derived data.
- Docker Compose production runtime.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/converter`.

## Verification

```bash
npm run lint
npm test
npm run build
```

## Docker

```bash
docker compose up --build
```

Open `http://localhost:3000/converter`.

## AdSense

Set these environment variables in production when Google gives you the IDs:

```bash
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-0000000000000000
NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT=0000000000
```

The app only renders ad slots on public content pages. The converter workflow stays free of ad containers and does not pass uploaded files, passwords, extracted rows, or preview edits to advertising code.

## Converter engine

Docker Compose starts two services:

- `pdf-converter`: the Next.js frontend and proxy API.
- `converter-engine`: a Python FastAPI service that converts PDFs to XLSX.

The converter engine uses temporary request directories. Uploaded PDFs and intermediate files are removed when the conversion request finishes. This is not iLovePDF's proprietary engine, but it is a free self-hosted conversion stack with no vendor-side conversion limit.
