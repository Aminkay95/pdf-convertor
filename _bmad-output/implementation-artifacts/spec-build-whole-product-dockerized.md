---
title: 'Build Dockerized V1 PDF Converter Product'
type: 'feature'
created: '2026-06-28'
status: 'done'
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/_bmad-output/project-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/prds/prd-pdf-converter-2026-06-28/prd.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-pdf-converter-2026-06-28/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** The project currently contains planning artifacts but no runnable product. Turing wants the complete v1 financial statement PDF-to-Excel utility built and runnable through Docker Compose.

**Approach:** Scaffold a Next.js App Router + TypeScript application following the architecture spine: public SEO/trust pages share one converter entry, browser session state owns statement-derived data, and server-side OCR exists only behind an explicit consent/job boundary. Implement a production-minded MVP with local digital PDF extraction, sample/demo data, editable preview, CSV/XLSX export, privacy receipt, basic OCR job API stub, tests, and Docker Compose.

## Boundaries & Constraints

**Always:** Preserve privacy claims exactly: digital PDFs should be processed locally where possible; server OCR must require explicit consent; passwords, extracted rows, edited preview data, and statement contents must not be sent to ads or analytics. Keep source-derived columns in the preview/export model. Use user-safe errors, technical intake safeguards, accessible controls, and crawlable SEO content. The app must run locally with `docker compose up --build`.

**Ask First:** Before integrating a paid or external OCR provider, persistent cloud object storage, production analytics, Google AdSense account IDs, legal/privacy final copy, or deployment-provider-specific infrastructure.

**Never:** Do not add accounts, subscriptions, batch conversion, bank-login imports, financial advice, long-term document storage, or a broad bookkeeping product. Do not make universal accuracy or "we never upload anything" claims. Do not implement SEO doorway pages or place ads inside upload, password, OCR consent, preview editing, or download controls.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Digital statement | User uploads a valid text PDF | UI labels local processing, extracts a preview table, allows edits, downloads CSV/XLSX from edited preview, and shows local privacy receipt | If extraction fails, show a safe message and keep the file out of server APIs |
| Scanned statement | User uploads image-like PDF | UI explains OCR needs server processing and waits for explicit consent before calling OCR API | Cancel keeps data local and shows no server processing occurred |
| Password-protected PDF | PDF cannot be opened without password | UI prompts for password, states it is not stored, and retries local processing | Wrong password gives a safe retry message without leaking parser internals |
| Unsupported/extreme file | Non-PDF, malformed PDF, or file above technical safeguard | Intake rejects before expensive processing | Show actionable safe error; no stack trace |
| Demo path | User opens sample statement | Demo preview loads without real upload and supports edit/export/receipt behavior | Demo data stays clearly labeled sample data |

</frozen-after-approval>

## Code Map

- `package.json` -- New Next.js app scripts, dependencies, and test commands.
- `app/` -- App Router pages, metadata, converter route, SEO pages, API route handlers, sitemap, and robots.
- `src/domain/conversion/` -- Conversion session model, commands, ports, errors, fixtures, and privacy receipt data.
- `src/adapters/browser-pdf/` -- Browser PDF detection/extraction adapter around `pdfjs-dist`.
- `src/adapters/export/` -- CSV and XLSX writers that consume the reviewed preview.
- `src/adapters/ocr-server/` -- Consent-based OCR job client and server-side stub adapter.
- `src/adapters/telemetry/` -- Aggregate no-sensitive-data telemetry port implementation.
- `src/adapters/ads/` -- Public-shell ad placeholder with hard boundaries away from sensitive flow.
- `src/components/converter/` -- Upload, password prompt, OCR consent, preview editor, export controls, and privacy receipt UI.
- `src/content/seo/` -- Distinct landing/help page content for the PRD page map.
- `tests/` -- Unit and integration coverage for domain commands, export output, edge cases, and API boundaries.
- `Dockerfile`, `docker-compose.yml`, `.dockerignore` -- Containerized production runtime and compose wiring.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `tsconfig.json`, `next.config.ts`, lint/test config files -- Scaffold the app with TypeScript, Next.js App Router, CSS, test tooling, and dependency versions compatible with the architecture spine.
- [x] `src/domain/conversion/` -- Implement typed preview/session commands for intake, mode detection result handling, edits, row operations, undo, exports, receipt inputs, and safe error classes.
- [x] `src/adapters/browser-pdf/` -- Implement PDF file validation, text extraction, scanned/password/failure detection, and conservative table row inference for digital PDFs.
- [x] `src/adapters/export/` -- Implement CSV and XLSX export from current preview columns/rows with generic filenames.
- [x] `app/converter`, `src/components/converter/` -- Build the full interactive converter workflow with sample demo, accessible controls, processing mode labels, OCR consent, editable preview, confidence highlighting, export buttons, and privacy receipt.
- [x] `app/api/ocr-jobs/`, `src/adapters/ocr-server/` -- Build a consent-only OCR job boundary that validates uploads, returns a safe stub/demo OCR result, schedules/records under-30-minute cleanup state, and never stores durable preview state.
- [x] `app/(public)/`, `src/content/seo/`, `app/sitemap.ts`, `app/robots.ts` -- Implement the main page, required SEO landing pages, trust/help content, metadata, canonical URLs, sitemap, and robots.
- [x] `src/adapters/ads/`, `src/adapters/telemetry/` -- Add ad and telemetry adapters that cannot receive statement-derived data and render only in public/content shells.
- [x] `tests/` -- Cover the I/O matrix, preview editing/export behavior, privacy receipt variants, OCR consent boundary, and no-sensitive-data telemetry/ads constraints.
- [x] `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `README.md` -- Dockerize the app and document local dev plus production compose usage.

**Acceptance Criteria:**
- Given a fresh checkout, when `docker compose up --build` is run, then the product starts and the converter is reachable in a browser.
- Given a digital PDF, when conversion succeeds, then preview/export happens locally and the receipt does not claim server upload.
- Given a scanned PDF, when OCR is required, then no OCR API call occurs before explicit consent.
- Given edited preview rows, when CSV or XLSX is downloaded, then the downloaded file reflects those edits and uses source-derived columns.
- Given public SEO pages, when rendered without client interaction, then each page has distinct crawlable copy, title, meta description, canonical URL, and a route into the shared converter.

## Spec Change Log

## Design Notes

The OCR backend should be a real consent/job boundary but not a paid provider integration yet. The stub result should make the flow testable and replaceable without changing the domain/UI contract.

## Verification

**Commands:**
- `npm install` -- expected: dependencies install successfully.
- `npm run lint` -- expected: no lint errors.
- `npm test` -- expected: all unit/integration tests pass.
- `npm run build` -- expected: production Next.js build succeeds.
- `docker compose up --build` -- expected: app serves the converter successfully from the configured port.

## Suggested Review Order

**Converter Workflow**

- Start here to see the product flow and privacy boundary.
  [`ConverterClient.tsx:40`](../../src/components/converter/ConverterClient.tsx#L40)

- Async upload guard prevents stale conversions overwriting newer previews.
  [`ConverterClient.tsx:58`](../../src/components/converter/ConverterClient.tsx#L58)

- OCR consent is the only server-processing trigger.
  [`ConverterClient.tsx:112`](../../src/components/converter/ConverterClient.tsx#L112)

- Column mapping keeps source labels reviewable before export.
  [`ConverterClient.tsx:322`](../../src/components/converter/ConverterClient.tsx#L322)

**Conversion Domain**

- Session commands keep preview edits as the source of truth.
  [`session.ts:15`](../../src/domain/conversion/session.ts#L15)

- Column rename command supports lightweight mapping adjustments.
  [`session.ts:106`](../../src/domain/conversion/session.ts#L106)

- Receipt copy distinguishes local, server, pending, and failed cleanup.
  [`session.ts:152`](../../src/domain/conversion/session.ts#L152)

**PDF And OCR Boundaries**

- Browser PDF adapter validates intake before local extraction.
  [`pdfExtractor.ts:119`](../../src/adapters/browser-pdf/pdfExtractor.ts#L119)

- Source-column detection avoids forcing one statement schema.
  [`pdfExtractor.ts:42`](../../src/adapters/browser-pdf/pdfExtractor.ts#L42)

- OCR endpoint prechecks size, consent, rate, type, and PDF header.
  [`route.ts:12`](../../app/api/ocr-jobs/route.ts#L12)

- Temporary cleanup records expire instead of growing forever.
  [`route.ts:60`](../../app/api/ocr-jobs/route.ts#L60)

**Exports**

- CSV export neutralizes spreadsheet formulas before download.
  [`csv.ts:3`](../../src/adapters/export/csv.ts#L3)

- XLSX export uses internal XML/ZIP generation without vulnerable dependency.
  [`xlsx.ts:159`](../../src/adapters/export/xlsx.ts#L159)

- Excel column references support more than twenty-six columns.
  [`xlsx.ts:22`](../../src/adapters/export/xlsx.ts#L22)

**SEO And Runtime**

- Public landing page content stays distinct and routes to one converter.
  [`pages.ts:13`](../../src/content/seo/pages.ts#L13)

- Site URL is environment-driven for canonical, sitemap, and robots output.
  [`site.ts:1`](../../src/content/site.ts#L1)

- Docker Compose defines the production container entrypoint.
  [`docker-compose.yml:1`](../../docker-compose.yml#L1)

**Verification**

- Domain tests cover edits, receipts, and column mapping.
  [`conversion-session.test.ts:1`](../../tests/conversion-session.test.ts#L1)

- Export tests cover CSV output and formula neutralization.
  [`export.test.ts:1`](../../tests/export.test.ts#L1)
