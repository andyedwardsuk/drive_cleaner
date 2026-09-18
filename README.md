# 🚀 Drive Cleaner

<div align="center">

![Drive Cleaner Banner](https://raw.githubusercontent.com/andyedwardsuk/drive_cleaner/main/first_load_dashboard.png)

### **The 2026 Enterprise Workspace Storage Intelligence & Hygiene Suite**
*Autonomous, privacy-first storage optimization, security governance, and carbon accounting built directly into Google Drive.*

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-V8%20Engine-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Awesome Pro](https://img.shields.io/badge/Web%20Awesome-Pro%203.13-FF6B6B?style=for-the-badge&logo=webcomponents&logoColor=white)](https://awesome.me/)
[![Font Awesome Pro](https://img.shields.io/badge/Font%20Awesome-Pro%20Duotone-538DD7?style=for-the-badge&logo=fontawesome&logoColor=white)](https://fontawesome.com/)
[![Version](https://img.shields.io/badge/Version-3.6.4-10B981?style=for-the-badge)](https://github.com/andyedwardsuk/drive_cleaner)
[![Layout Stability](https://img.shields.io/badge/CLS-0.00%20Zero%20Shift-success?style=for-the-badge)](https://web.dev/cls/)

[Live Web App Deployment](https://script.google.com/macros/s/AKfycbyMGwEbepgATR-CRv_jvyqHTNA302vqVKNtEQdGR4lL8cSBrsgtT4Cyy8RnhYnivTg3jg/exec) • [Key Features](#-core-capabilities--5-hub-architecture) • [Design System](#-design-system--ui-architecture) • [Roadmap](#-product-roadmap) • [Setup & Development](#-getting-started)

</div>

---

## 🌟 Overview

**Drive Cleaner** is a comprehensive, production-grade cloud storage governance suite designed for modern Google Workspace organizations and power users. Engineered to operate natively within Google Apps Script with zero external servers, it delivers deep visibility, automated hygiene, compliance auditing, media optimization, and environmental impact telemetry.

### 🛡️ Privacy & Security Guarantee
- **100% In-Tenant**: Runs strictly inside your own Google Cloud and Google Apps Script execution boundary.
- **Zero Third-Party Servers**: No telemetry, tokens, or file metadata ever leave Google's secure infrastructure.
- **Audited Advanced APIs**: Utilizes Google Drive API v2, `ScriptApp` time triggers, and Google Drive Changes API.

---

## 🏛️ Core Capabilities & 5-Hub Architecture

Drive Cleaner is structured into **5 dedicated Hubs** encompassing **23 specialized forensic tools**:

```
Drive Cleaner Suite (v3.6.4)
├── 📊 1. Dashboard Hub (/dashboard)
├── 🧹 2. Cleanup Center (/clean) [8 Tools]
├── 🗂️ 3. Organisation Studio (/organise) [5 Tools]
├── 🛡️ 4. Security & Governance (/security) [4 Tools]
└── ⚙️ 5. Operations & Automation (/operations) [6 Tools]
```

---

### 📊 1. Dashboard Hub (`/dashboard`)
*Central command telemetry and live folder inspection.*
- **Drive Storage Telemetry**: Real-time quota gauge breaking down Workspace docs (42%), Photos & 4K media (28%), Stale ROT data (18%), and Pending Trash (12%).
- **Interactive Folder Browser**: Visual Google Drive Picker modal or direct URL/Folder ID input.
- **Zero-Shift File Explorer**: Persistent, sorted file table with live search, CSV/JSON export, quick file preview, and inline batch triage.

---

### 🧹 2. Cleanup Center (`/clean`)
*Comprehensive space reclamation across 8 specialized cleaner utilities.*

| Tab | Tool | Font Awesome Icon | Description |
| :--- | :--- | :---: | :--- |
| `?tab=smart-scan` | **Smart Scan** | `<faBolt>` | Parallel multi-analyzer engine evaluating storage across 8 dimensions. |
| `?tab=duplicates` | **Duplicates Finder** | `<faCopy>` | MD5 checksum verification and exact name clustering to eliminate duplicate files. |
| `?tab=large-files` | **Large Files** | `<faHardDrive>` | Detects files exceeding configurable thresholds (> 100 MB default). |
| `?tab=old-files` | **Old & Inactive Files** | `<faClockRotateLeft>` | Stagnant files unviewed or untouched for 365+ days. |
| `?tab=empty-items` | **Empty Items** | `<faFolderOpen>` | Zero-byte orphan files and hollow folder trees consuming directory space. |
| `?tab=temp-files` | **Temporary Files** | `<faFileSlash>` | Residual `.tmp`, `.bak`, autosave stubs, and cache artifacts. |
| `?tab=media-optimizer` | **4K & Burst Optimizer** | `<faFilm>` | High-bitrate video analysis (> 35 Mbps) and burst photo grouping with automated "Best Shot" selection. |
| `?tab=trash-governance` | **Trash Governance** | `<faTrashCanCheck>` | 30-day decay lifecycle management, selective restoration, and irreversible permanent purge. |

---

### 🗂️ 3. Organisation Studio (`/organise`)
*Taxonomy architects and structural hygiene for personal and team drives.*

| Tab | Tool | Font Awesome Icon | Description |
| :--- | :--- | :---: | :--- |
| `?tab=reorganize` | **Folder Reorganizer** | `<faFolderTree>` | Visual tree architect diagnosing deep nesting (> 6 levels) and suggesting optimized layouts. |
| `?tab=shared-drives` | **Shared Drives Hub** | `<faUsersRectangle>` | Team Drive inventory, orphaned file detection, inactive member audits, and storage quotas. |
| `?tab=labels` | **Drive Labels & Tags** | `<faTags>` | Enterprise label taxonomy manager for tagging files by compliance, retention, or client. |
| `?tab=my-folders` | **My Folders Scoping** | `<faFolderBookmark>` | Bookmark priority project folders for targeted recurring maintenance. |
| `?tab=storage-analytics` | **Storage Analytics** | `<faChartPie>` | Interactive category breakdown charts, size distributions, and historical growth telemetry. |

---

### 🛡️ 4. Security & Governance (`/security`)
*Permissions auditing, clutter scoring, and sustainability metrics.*

| Tab | Tool | Font Awesome Icon | Description |
| :--- | :--- | :---: | :--- |
| `?tab=security-audit` | **Security Exposure Audit** | `<faShieldKeyhole>` | Scans for risky `anyoneWithLink` files, external domain sharing, and 1-click permission stripping. |
| `?tab=rot` | **Data ROT Analysis** | `<faFireFlameCurved>` | Redundant, Obsolete, and Trivial classification with psychological digital hoarding scoring. |
| `?tab=google-workspace` | **Workspace Native Files** | `<faFileLines>` | Audit Google Docs, Sheets, Slides, Forms, and Drawings inactive for 6+ months. |
| `?tab=carbon` | **Cloud Carbon Footprint** | `<faLeaf>` | Calculates kWh electricity consumption, annual CO₂e emissions, and tangible real-world equivalents. |

---

### ⚙️ 5. Operations & Automation (`/operations`)
*Rule engines, scheduled background jobs, and gamified compliance.*

| Tab | Tool | Font Awesome Icon | Description |
| :--- | :--- | :---: | :--- |
| `?tab=auto-archive` | **Smart Auto-Archive** | `<faBoxArchive>` | Reversibly relocates aged project files into `_DriveCleaner_Archive/{YYYY}` with 1-click restore. |
| `?tab=bulk-actions` | **Rule & Bulk Engine** | `<faBoltLightning>` | Multi-condition rule filtering with staged preview and batch execution. |
| `?tab=kanban` | **Kanban Triage Pipeline** | `<faTableColumns>` | 4-column drag-and-drop workflow (*Review*, *Keep*, *Archive*, *Pending Trash*). |
| `?tab=triggers` | **Automation Triggers** | `<faCalendarClock>` | 24/7 time-driven Google Apps Script triggers for background audits and weekly HTML digest emails. |
| `?tab=sync` | **Incremental Sync** | `<faRotate>` | Google Drive Changes API token engine synchronizing only newly modified files. |
| `?tab=daily-impact` | **Daily Impact & Streaks** | `<faSparkles>` | Gamified cleanup challenges, streak tracking, level progression, and eco badges. |

---

## 🎨 Design System & UI Architecture

Drive Cleaner's user interface is crafted to feel like an ultra-modern 2026 spatial application:

```
UI Technology Foundation
├── 🔲 Web Awesome Pro (@awesome.me/webawesome)
│   ├── <wa-switch>      Accessible toggle switches
│   ├── <wa-callout>     Specular alert containers with icon slots
│   ├── <wa-card>        Elevated glassmorphic surfaces
│   ├── <wa-drawer>      Off-canvas inspection panes
│   └── <wa-skeleton>    Zero-CLS sheen loading states
│
├── 🎨 Font Awesome Pro Duotone (@fortawesome/pro-duotone-svg-icons)
│   ├── Standardized uniform stroke weights across all hubs
│   └── Harmonized dual-tone primary/secondary color palettes
│
├── ⚡ TanStack Router & Zero-Shift Architecture
│   ├── Hash-based history (`createHashHistory`) preventing 404s in GAS
│   └── Persistent table bounding boxes with TableSkeleton rows
│
└── ⌨️ Command Palette (⌘K / Ctrl+K)
    └── Global fuzzy search for instant tool jumping and quick actions
```

### Zero Cumulative Layout Shift (0.00 CLS)
Every table, card grid, and audit inspector stays permanently mounted during asynchronous fetches. Top indeterminate gradient shimmer lines and Web Awesome `<wa-skeleton effect="sheen">` placeholders match the exact bounding dimensions of real data, ensuring content never jumps or flashes.

---

## 🛠️ Technology Stack

### Frontend Architecture
- **Framework**: [React 18.3](https://reactjs.org/) + [Vite 6.0](https://vitejs.dev/) Single-File Bundle (`vite-plugin-singlefile`)
- **Web Components**: [Web Awesome Pro 3.13](https://awesome.me/webawesome)
- **Vector Icons**: [Font Awesome Pro Duotone 7.3](https://fontawesome.com/) + [Lucide React](https://lucide.dev/)
- **Routing**: [TanStack Router 1.136](https://tanstack.com/router) (Hash-Based History for Google Apps Script Web Apps)
- **Styling**: [TailwindCSS 3.4](https://tailwindcss.com/) with specular glassmorphic tokens, ambient glow effects, and modern dark theme
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)

### Backend Architecture (Google Apps Script)
- **Runtime**: Google Apps Script modern **V8 Runtime**
- **Drive API**: Google Drive Advanced API v2 Service
- **Storage & Caching**:
  - `CacheService`: High-speed memory caching for scan summaries and quota telemetry
  - `PropertiesService`: User and Script properties for persistent configuration and sync tokens
- **Automation**: `ScriptApp.newTrigger()` for silent scheduled scans and Gmail HTML reports

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher
- PNPM (`npm install -g pnpm`)
- Google Clasp CLI (`npm install -g @google/clasp`)
- A Google Cloud Platform project with Drive API enabled

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:andyedwardsuk/drive_cleaner.git
   cd drive_cleaner
   ```

2. **Install project dependencies**:
   ```bash
   # Install root dependencies
   pnpm install

   # Install frontend dependencies
   cd app/client
   pnpm install
   cd ../..
   ```

3. **Log in to Google Apps Script via Clasp**:
   ```bash
   npx clasp login
   ```

4. **Start local development server**:
   ```bash
   cd app/client
   pnpm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📦 Building & Deploying

Drive Cleaner uses a custom single-command build workflow that compiles the React client into an inlined Google Apps Script HTML file and packages backend server files into `./dist`:

```bash
# 1. Compile React client and copy server files into ./dist
node build.js

# 2. Force push files to Google Apps Script
npx clasp push --force

# 3. Deploy a new production version
npx clasp deploy -i <DEPLOYMENT_ID> -d "v3.6.4 Production Release"
```

---

## 🗺️ Product Roadmap

```
Roadmap Timeline
├── ✅ Phase 1: Smart Scan & Core Analyzers (v1.0 - v1.4)
├── ✅ Phase 2: Operations, Kanban & Automation (v2.0 - v2.4)
├── ✅ Phase 3: Shared Drives, Labels & Permissions (v2.5 - v2.9)
├── ✅ Phase 4: Incremental Sync & Trash Governance (v3.0 - v3.3)
├── ✅ Phase 5: 5-Hub Architecture, Web Awesome & Zero CLS (v3.4 - v3.6) [CURRENT]
├── ⏳ Phase 6: Multi-Tenant Delegation & Cold Storage Offloader (v3.7 - v3.9) [PLANNED]
└── 🔮 Phase 7: Gemini AI Multimodal Semantic Deduplication (v4.0+) [FUTURE]
```

### ✅ Completed Milestones (v1.0 – v3.6.4)
- [x] **Smart Scan Engine**: 8 comprehensive scan dimensions.
- [x] **Data ROT & Clutter Scoring**: Psychology-backed clutter index.
- [x] **Cloud Carbon Estimator**: Electricity (kWh) & CO₂e savings calculations.
- [x] **24/7 Automation Triggers**: Hands-free background audits and weekly HTML digest emails.
- [x] **Photo Burst & 4K Media Optimizer**: Bitrate analysis and best-shot burst selection.
- [x] **Trash Governance**: 30-day decay lifecycle, safety countdowns, and permanent purging.
- [x] **Incremental Sync Engine**: Drive Changes API delta syncing.
- [x] **5-Hub Spatial Architecture**: Unified navigation across Clean, Organise, Security, and Operations.
- [x] **Global ⌘K Command Palette**: Fast keyboard navigation.
- [x] **Web Awesome Pro & Font Awesome Pro Duotone Integration**: Modern web component suite.
- [x] **Zero Cumulative Layout Shift (0 CLS)**: `WaSkeleton` and persistent table frames across all 23 views.
- [x] **Seamless Hash Routing**: Complete elimination of Google Apps Script 404s.

### ⏳ Phase 6: Near-Term Roadmap (v3.7 – v3.9)
- [ ] **Multi-Workspace & Account Delegation**: Instant switching between personal and organizational Google Workspace accounts.
- [ ] **Google Cloud Storage (GCS) Coldline Offloader**: 1-click migration of cold archives from Google Drive into ultra-cheap GCS Archive/Coldline buckets.
- [ ] **Custom Cleaning Rule Presets**: Export and import shareable `.json` rule recipes (e.g. "Tax Season Purge", "Video Production Wrap-up").
- [ ] **Compliance & Retention Policy Enforcement**: Automated legal hold tagging and GDPR data retention scheduling.

### 🔮 Phase 7: Long-Term Vision (v4.0+)
- [ ] **Gemini Multimodal AI Deduplication**: Semantic document matching and visually identical image clustering beyond MD5 file hashes.
- [ ] **Automated Document Summarization**: AI executive summaries generated prior to file deletion or archival.
- [ ] **Drive Cleaner Headless CLI & GitHub Action**: Run organization-wide hygiene compliance audits in CI/CD workflows.

---

## 📄 License & Privacy Standards

Drive Cleaner is distributed under the **MIT License**.

> **Data Privacy Commitment**: Drive Cleaner is 100% self-hosted within your Google account. It does not communicate with any external analytics, tracking, or telemetry servers. All data processing and file operations occur exclusively through official Google Workspace APIs.
