# drive_cleaner

Google Apps Script project written in JavaScript with JSDoc type annotations.

## Project Type
- **Script Type**: standalone
- **Script ID**: `1qkpaDFbdqq3OlpMCEdOUk68nr3svvVk3mmhhmHykRIbvaBUimsx2uN-G`

## Project Structure

```
drive_cleaner/
├── app/                    # Source code
│   ├── server/            # Server-side Apps Script code (*.js)
│   │   ├── index.js       # Main entry point functions
│   │   ├── listAllFilesAndFolders.js
│   │   └── webpage.html   # HTML files for web apps
│   ├── client/            # Client-side code (future use)
│   ├── docs/              # Documentation files
│   └── test/              # Test files and utilities
│
├── dist/                   # Build output (deployed to Apps Script)
│   ├── appsscript.json    # Apps Script manifest
│   ├── *.js               # Copied JavaScript files
│   ├── libraries/         # Reserved for library code
│   └── utilities/         # Reserved for utility functions
│
├── scripts/                # Build and deployment scripts
├── specs/                  # Test specifications
├── build.js               # Build script
├── jsconfig.json          # JSDoc/IDE configuration
├── .eslintrc.json         # ESLint configuration
└── package.json           # Dependencies and scripts
```

## Build Process

The build script (`build.js`) copies files from `app/server/` to `dist/`:

**What Gets Built:**
- All `.js` files from `app/server/` (and subdirectories)
- All `.html` files from `app/server/` (for web apps and sidebars)
- Directory structure is preserved
- JSDoc comments are preserved in copied files

**Production Build** (`pnpm run build`):
- Excludes test files: `*.test.js`, `*.spec.js`, `*_test.js`, `*_spec.js`
- Includes all HTML files

**Development Build** (`pnpm run build:dev`):
- Includes all files (including test files)

**Note:** Only files in `app/server/` are built to `dist/`. Files in `app/client/`, `app/docs/`, or `app/test/` are not included in the build.

## Development

### Build and Deploy
```bash
pnpm run build       # Build for production (excludes test files)
pnpm run build:dev   # Build for development (includes test files)
pnpm run push        # Build and push to Apps Script
pnpm run push:dev    # Build with tests and push to Apps Script
pnpm run push:watch  # Watch mode for continuous deployment
```

### Other Commands
```bash
pnpm run pull        # Pull latest code from Apps Script
pnpm run open        # Open script in Apps Script editor
pnpm run logs        # View execution logs
pnpm run lint        # Lint JavaScript files
pnpm run lint:fix    # Lint and auto-fix issues
```

## Configuration
- **Runtime**: V8
- **Target**: ES2020
- **Time zone**: Europe/London
- **Type checking**: JSDoc annotations with jsconfig.json

## Test Files
Test files are automatically excluded from production builds:
- `*.test.js` - Test files
- `*.spec.js` - Specification files
- `*_test.js` - Test files (underscore notation)
- `*_spec.js` - Specification files (underscore notation)

Use `pnpm run build:dev` to include test files in the build.

## Getting Started
1. Write JavaScript with JSDoc annotations in `app/server/`
2. Run `pnpm run push` to build and deploy
3. Test your functions in the Apps Script editor or run them from the UI

---
*Generated with Claude Code*
