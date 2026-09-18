# Drive Cleaner - Documentation Index

**Project:** Drive Cleaner  
**Version:** 3.6.4 (Enterprise Edition)  
**Last Updated:** 2026-09-18  

👉 **For the main product overview and architecture guide, see the [Root README](../README.md).**

---

## 📚 Technical Documentation Map

### 1. Architecture & Design
- **[Main Project README](../README.md)** — Comprehensive suite overview, 5-hub architecture, design system, and roadmap.
- **[Smart Scan Architecture](./smart-scan-architecture.md)** — Scan engine, multi-category pipelines, and data flow.
- **[Smart Scan Developer Guide](./smart-scan-guide.md)** — Backend API reference and analyzer implementation details.
- **[Smart Scan Quick Reference](./smart-scan-quick-reference.md)** — Cheat sheet with code snippets and return payloads.

### 2. Hub Guides & Specifications
- **Dashboard & Quota Telemetry**: Live Drive quota breakdown, folder browsing, and zero-shift explorer.
- **Cleanup Center (8 Tools)**:
  - Smart Scan (`scanEngine.js`, `analyzers.js`)
  - Duplicates Finder (`analyzers.js`)
  - Large Files & Stagnant Old Files
  - Empty Items & Temp Artifacts
  - 4K Media & Photo Burst Clustering (`mediaOptimizer.js`)
  - Cloud Trash Lifecycle & Permanent Purge (`trashGovernanceManager.js`)
- **Organisation Studio (5 Tools)**:
  - Smart Folder Reorganizer (`folderReorganizer.js`)
  - Shared Drives Hygiene (`sharedDrivesManager.js`)
  - Google Drive Labels & Taxonomy (`labelsManager.js`)
  - My Folders Scoping
  - Storage Analytics & Growth Telemetry
- **Security & Governance (4 Tools)**:
  - Sharing Permissions & External Access Audit (`securityAuditManager.js`)
  - Data ROT Analysis & Psychological Clutter Index (`rotAnalyzer.js`)
  - Native Google Workspace Files Hub (`workspaceAnalyzer.js`)
  - Cloud Carbon Footprint & Green Impact (`carbonAnalyzer.js`)
- **Operations & Automation (6 Tools)**:
  - Smart Auto-Archive Engine (`_DriveCleaner_Archive`)
  - Rule & Bulk Engine (`bulk-actions`)
  - Kanban Review Pipeline (`kanban-labels`)
  - 24/7 Time-Driven Automation Triggers & HTML Digests (`triggerManager.js`)
  - Incremental Sync Engine (`syncManager.js`)
  - Daily Impact Tracker & Gamification (`daily-impact`)

---

## 🎯 Implementation Status Matrix

| Component | Status | Backend Service | Client Route |
| :--- | :---: | :--- | :--- |
| **Dashboard** | ✅ Production | `listAllFilesAndFolders.js` | `#/dashboard` |
| **Smart Scan** | ✅ Production | `smartScan/scanEngine.js` | `#/clean?tab=smart-scan` |
| **Duplicates Finder** | ✅ Production | `smartScan/analyzers.js` | `#/clean?tab=duplicates` |
| **4K & Burst Media** | ✅ Production | `utilities/mediaOptimizer.js` | `#/clean?tab=media-optimizer` |
| **Trash Governance** | ✅ Production | `utilities/trashGovernanceManager.js` | `#/clean?tab=trash-governance` |
| **Folder Reorganizer** | ✅ Production | `utilities/folderReorganizer.js` | `#/organise?tab=reorganize` |
| **Shared Drives** | ✅ Production | `utilities/sharedDrivesManager.js` | `#/organise?tab=shared-drives` |
| **Drive Labels** | ✅ Production | `utilities/labelsManager.js` | `#/organise?tab=labels` |
| **Security Audit** | ✅ Production | `utilities/securityAuditManager.js` | `#/security?tab=security-audit` |
| **Data ROT Analysis** | ✅ Production | `smartScan/rotAnalyzer.js` | `#/security?tab=rot` |
| **Carbon Footprint** | ✅ Production | `smartScan/carbonAnalyzer.js` | `#/security?tab=carbon` |
| **Automation Triggers** | ✅ Production | `utilities/triggerManager.js` | `#/operations?tab=triggers` |
| **Incremental Sync** | ✅ Production | `utilities/syncManager.js` | `#/operations?tab=sync` |
| **Web Awesome Suite** | ✅ Production | `<wa-switch>`, `<wa-skeleton>`, etc. | Application-wide |
| **Zero Layout Shift** | ✅ Production | `<wa-skeleton>`, `TableSkeleton` | All 23 views |

---

## 🚀 Deployment Specifications

- **Platform**: Google Apps Script V8 Engine
- **Drive API**: Advanced Google Drive Service API v2
- **Build Output**: `./dist/index.html` (Inlined React SPA via `vite-plugin-singlefile`)
- **Active Deployment URL**: [Google Apps Script Web App](https://script.google.com/macros/s/AKfycbyMGwEbepgATR-CRv_jvyqHTNA302vqVKNtEQdGR4lL8cSBrsgtT4Cyy8RnhYnivTg3jg/exec)
