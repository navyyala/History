# ZGPM_HISTORY — CMMS Maintenance History (PO_HISTORY)

Freestyle SAPUI5 application migrated from SAP WebIDE to VS Code / SAP Business Application Studio using UI5 Tooling.

## Prerequisites

- Node.js 18+
- `npm install`

## Run

```bash
npm run start-local   # dev server, proxies OData to GWD via destination
npm run start-gwq     # dev server, proxies OData to GWQ (test system)
```

## Build

```bash
npm run build
```

## Deploy

```bash
npm run deploy         # build + fiori deploy to GWD (ui5-deploy.yaml)
```

## Structure

```
webapp/
  Component.js        Async UIComponent, manifest-driven
  manifest.json        App descriptor: routing, models, data sources
  view/                Main (root), Master, Details + fragment/
  controller/          Main, Master, Details controllers (AMD)
  util/                CSVGenerator, FileGenerator, exportService, messages, stockOutputHelper
  model/               metadata.xml (local OData metadata reference)
  i18n/                Resource bundles (en, fr, de, es, pt)
  test/                flpSandbox.html, unit (QUnit), integration (OPA5)
```

## OData Service

`ZGPM_ORDER_HISTORY_SRV` — `/sap/opu/odata/sap/ZGPM_ORDER_HISTORY_SRV/`

## Known Limitations

- The app uses both a v1 (default, unnamed) and a v2 (`orderitem`) OData model against
  the same service, inherited from the original WebIDE implementation. Retained as-is
  per migration scope; consolidation to a single v2 model is a recommended follow-up.
- `sap.ca.ui` (message box / amount format helpers) and Cordova/Kapsel hybrid code
  (barcode scanner, filesystem export) are retained per migration instructions.
  Validate their availability/behavior on the target 1.71.84 runtime and hybrid
  container before go-live.
- Legacy SAP WebIDE artifacts at the project root (`Component.js`, `index.html`,
  `neo-app.json`, `flp-config.json`, `resources.json`, `.project.json`,
  `.user.project.json`, `.che/`, `Component-preload.js`, `localIndex.html`,
  `extended_runnable_file.html`) were left untouched (not deleted) and are superseded
  by the `webapp/` structure above. They can be removed in a follow-up cleanup once
  the new structure is validated.
