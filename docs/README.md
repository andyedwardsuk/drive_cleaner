# Drive Cleaner - Documentation Index

**Project:** Drive Cleaner
**Version:** 1.1.0
**Last Updated:** 2025-11-18

---

## Quick Navigation

### 📚 Feature Documentation

#### Smart Scan
- **[Developer Guide](./smart-scan-guide.md)** - Comprehensive API reference, usage examples, integration guide
- **[Quick Reference](./smart-scan-quick-reference.md)** - 1-page summary with code snippets
- **[Architecture](./smart-scan-architecture.md)** - Visual diagrams, data flow, component relationships

#### Enhanced Metadata
- Status: ✅ Complete (Issue #1)
- Implementation: `dist/utilities/formatters.js`, `dist/utilities/metadataParser.js`
- Integration: `driveApiHelpers.js`, `listAllFilesAndFolders.js`

---

### 📋 Planning & Build Notes

#### Smart Scan
- **[Feature Plan](./feature-plans/smart-scan-plan.md)** - Implementation plan, architecture design
- **[Build Notes](./build-notes/smart-scan-build.md)** - Implementation approach, decisions made
- **[Test Report](./test-reports/smart-scan-test.md)** - Quality checks, JSDoc assessment

---

### 🎯 Feature Status

| Feature | Status | Documentation | Issue |
|---------|--------|---------------|-------|
| Enhanced Metadata | ✅ Complete | Inline JSDoc | [#1](https://github.com/andyedwardsuk/drive_cleaner/issues/1) |
| Smart Scan | ✅ Complete | [Guide](./smart-scan-guide.md) | [#2](https://github.com/andyedwardsuk/drive_cleaner/issues/2) |
| Large Files View | 🔨 Planned | TBD | [#3](https://github.com/andyedwardsuk/drive_cleaner/issues/3) |
| Kanban Labels | 🔨 Planned | TBD | [#4](https://github.com/andyedwardsuk/drive_cleaner/issues/4) |
| Storage Analytics | 🔨 Planned | TBD | [#7](https://github.com/andyedwardsuk/drive_cleaner/issues/7) |

---

### 🚀 Quick Start

**For Developers:**
1. Read: [Smart Scan Quick Reference](./smart-scan-quick-reference.md)
2. Implement: [Smart Scan Developer Guide](./smart-scan-guide.md)
3. Understand: [Smart Scan Architecture](./smart-scan-architecture.md)

**For Testing:**
- Web App URL: `https://script.google.com/macros/s/{deploymentId}/exec`
- Script Editor: `https://script.google.com/d/{scriptId}/edit`

---

### 📁 Documentation Structure

```
docs/
├── README.md (this file)               # Documentation index
├── smart-scan-guide.md                 # Smart Scan: Developer guide
├── smart-scan-quick-reference.md       # Smart Scan: 1-page summary
├── smart-scan-architecture.md          # Smart Scan: Diagrams & flows
│
├── feature-plans/
│   └── smart-scan-plan.md              # Implementation plan
│
├── build-notes/
│   └── smart-scan-build.md             # Build decisions
│
└── test-reports/
    └── smart-scan-test.md              # Test results
```

---

### 🔧 Project Files

**Backend (Google Apps Script):**
```
dist/
├── driveApiHelpers.js                  # Drive API integration
├── listAllFilesAndFolders.js           # File listing
├── webApp.js                           # Web app entry point
│
├── smartScan/
│   ├── scanEngine.js                   # Smart Scan orchestration
│   ├── analyzers.js                    # 5 analyzer functions
│   └── recommendations.js              # Recommendation generator
│
└── utilities/
    ├── formatters.js                   # File size, date formatting
    ├── metadataParser.js               # Metadata transformation
    └── cacheManager.js                 # Caching utilities
```

**Frontend (React):**
```
app/client/src/
├── views/
│   ├── DashboardView.jsx               # Main dashboard
│   ├── SmartScanView.jsx               # Smart Scan interface
│   └── ...                             # Other views
│
├── components/
│   ├── FileTable.jsx                   # File listing table
│   └── ...                             # Other components
│
└── hooks/
    ├── useSmartScan.js                 # Smart Scan hook (to be created)
    └── ...                             # Other hooks
```

---

### 📖 Learning Path

1. **New to Project?**
   - Start: [ROADMAP.md](../ROADMAP.md)
   - Then: [Smart Scan Quick Reference](./smart-scan-quick-reference.md)

2. **Implementing Features?**
   - Read: [Smart Scan Developer Guide](./smart-scan-guide.md)
   - Reference: [Smart Scan Architecture](./smart-scan-architecture.md)

3. **Understanding Architecture?**
   - View: [Smart Scan Architecture](./smart-scan-architecture.md)
   - Dive: [Build Notes](./build-notes/smart-scan-build.md)

---

### 🤝 Contributing

When adding new features:
1. Create feature plan in `feature-plans/`
2. Document build notes in `build-notes/`
3. Write test report in `test-reports/`
4. Create comprehensive guide (like Smart Scan)
5. Update this index

---

### 📝 Documentation Standards

Following project conventions:
- ✅ Single guide per feature (comprehensive)
- ✅ 1-page quick reference
- ✅ Visual diagrams/flowcharts
- ✅ UK English spelling
- ✅ Consolidated (no multiple scattered docs)

---

**Last Updated:** 2025-11-18
**Maintainer:** Andy Edwards
