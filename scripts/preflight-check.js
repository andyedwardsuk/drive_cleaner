#!/usr/bin/env node

/**
 * Drive Cleaner — Marketplace & Production Pre-Flight Verification Script
 * Validates version consistency, OAuth scope purity, legal documentation,
 * marketplace graphical assets, and build artifact integrity.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
}

let checksPassed = 0
let checksFailed = 0

function logHeader(title) {
  console.log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`)
}

function pass(msg) {
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${msg}`)
  checksPassed++
}

function fail(msg) {
  console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${msg}`)
  checksFailed++
}

function warn(msg) {
  console.log(`  ${colors.yellow}⚠ WARN:${colors.reset} ${msg}`)
}

// -------------------------------------------------------------
// 1. Version Consistency Checks
// -------------------------------------------------------------
logHeader('1. Version Consistency & Pinned Version (v1.0.0)')

try {
  const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'))
  if (rootPkg.version === '1.0.0') {
    pass(`Root package.json version is pinned to ${colors.bold}${rootPkg.version}${colors.reset}`)
  } else {
    fail(`Root package.json version is ${rootPkg.version} (expected 1.0.0)`)
  }
} catch (e) {
  fail(`Failed to read root package.json: ${e.message}`)
}

try {
  const clientPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'app/client/package.json'), 'utf8'))
  if (clientPkg.version === '1.0.0') {
    pass(`Client package.json version is pinned to ${colors.bold}${clientPkg.version}${colors.reset}`)
  } else {
    fail(`Client package.json version is ${clientPkg.version} (expected 1.0.0)`)
  }
} catch (e) {
  fail(`Failed to read client package.json: ${e.message}`)
}

try {
  const versionJs = fs.readFileSync(path.join(ROOT_DIR, 'app/client/src/version.js'), 'utf8')
  if (versionJs.includes("export const APP_VERSION = '1.0.0'")) {
    pass(`app/client/src/version.js exports APP_VERSION = ${colors.bold}'1.0.0'${colors.reset}`)
  } else {
    fail(`app/client/src/version.js does not match APP_VERSION = '1.0.0'`)
  }
} catch (e) {
  fail(`Failed to read app/client/src/version.js: ${e.message}`)
}

// -------------------------------------------------------------
// 2. OAuth Scope & GAS Manifest Purity
// -------------------------------------------------------------
logHeader('2. OAuth Scope & Manifest Purity (app/server/appsscript.json)')

try {
  const manifestPath = path.join(ROOT_DIR, 'app/server/appsscript.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  
  const expectedScopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/userinfo.email'
  ]

  const scopes = manifest.oauthScopes || []
  const hasDrive = scopes.includes('https://www.googleapis.com/auth/drive')
  const hasEmail = scopes.includes('https://www.googleapis.com/auth/userinfo.email')
  const hasExtra = scopes.filter(s => !expectedScopes.includes(s))

  if (hasDrive && hasEmail && hasExtra.length === 0) {
    pass(`Strict OAuth Scopes verified: strictly limited to 'drive' & 'userinfo.email' (${scopes.length} scopes)`)
  } else {
    fail(`Scope mismatch! Current: ${JSON.stringify(scopes)}, unexpected: ${JSON.stringify(hasExtra)}`)
  }

  if (manifest.webapp?.executeAs === 'USER_ACCESSING') {
    pass(`Multi-tenant configuration confirmed: webapp.executeAs === 'USER_ACCESSING'`)
  } else {
    fail(`webapp.executeAs is '${manifest.webapp?.executeAs}' (expected 'USER_ACCESSING')`)
  }

  if (manifest.webapp?.access === 'ANYONE') {
    pass(`Marketplace access verified: webapp.access === 'ANYONE'`)
  } else {
    fail(`webapp.access is '${manifest.webapp?.access}' (expected 'ANYONE')`)
  }
} catch (e) {
  fail(`Failed to parse app/server/appsscript.json: ${e.message}`)
}

// -------------------------------------------------------------
// 3. Legal & Marketplace Documentation
// -------------------------------------------------------------
logHeader('3. Legal & Marketplace Documentation Verification')

const docsToCheck = [
  { file: 'docs/marketplace/OAUTH_VERIFICATION_MANIFESTO.md', minSize: 1000, desc: 'OAuth Verification Manifesto' },
  { file: 'docs/marketplace/STORE_LISTING_METADATA.md', minSize: 1000, desc: 'Store Listing Metadata' },
  { file: 'docs/PRIVACY_POLICY.md', minSize: 1000, desc: 'Production Privacy Policy' },
  { file: 'docs/TERMS_OF_SERVICE.md', minSize: 1000, desc: 'Production Terms of Service' },
]

for (const doc of docsToCheck) {
  const fullPath = path.join(ROOT_DIR, doc.file)
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath)
    if (stat.size >= doc.minSize) {
      pass(`${doc.desc} exists: ${doc.file} (${(stat.size / 1024).toFixed(1)} KB)`)
    } else {
      fail(`${doc.desc} is too small: ${stat.size} bytes (min: ${doc.minSize} bytes)`)
    }
  } else {
    fail(`Missing document: ${doc.file}`)
  }
}

// -------------------------------------------------------------
// 4. Marketplace Graphical Assets
// -------------------------------------------------------------
logHeader('4. Google Workspace Marketplace Graphical Assets')

const assetsToCheck = [
  { file: 'assets/marketplace/app_icon_128x128.png', desc: 'App Icon (128x128)' },
  { file: 'assets/marketplace/store_card_banner_440x280.png', desc: 'Card Banner (440x280)' },
  { file: 'assets/marketplace/promo_hero_920x680.png', desc: 'Promo Hero (920x680)' },
  { file: 'assets/marketplace/screenshot_smart_scan_1280x800.png', desc: 'Screenshot 1 - Smart Scan (1280x800)' },
  { file: 'assets/marketplace/screenshot_storage_analytics_1280x800.png', desc: 'Screenshot 2 - Storage Analytics (1280x800)' },
  { file: 'assets/marketplace/screenshot_rot_clutter_1280x800.png', desc: 'Screenshot 3 - ROT Clutter (1280x800)' },
]

for (const asset of assetsToCheck) {
  const fullPath = path.join(ROOT_DIR, asset.file)
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath)
    pass(`${asset.desc} verified: ${asset.file} (${(stat.size / 1024).toFixed(1)} KB)`)
  } else {
    fail(`Missing asset: ${asset.file}`)
  }
}

// -------------------------------------------------------------
// 5. Build Artifact Integrity
// -------------------------------------------------------------
logHeader('5. Compiled Distribution Build Integrity (dist/index.html)')

const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html')
if (fs.existsSync(distHtmlPath)) {
  const stat = fs.statSync(distHtmlPath)
  if (stat.size > 500 * 1024) {
    pass(`Compiled singlefile React app exists: dist/index.html (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`)
  } else {
    warn(`dist/index.html is relatively small: ${(stat.size / 1024).toFixed(1)} KB`)
  }

  const content = fs.readFileSync(distHtmlPath, 'utf8')
  if (content.includes('APP_VERSION') || content.includes('1.0.0')) {
    pass(`dist/index.html contains references to version 1.0.0`)
  } else {
    warn(`Could not find version 1.0.0 string in dist/index.html`)
  }
} else {
  warn(`dist/index.html does not exist yet. Run 'npm run build' to generate.`)
}

// -------------------------------------------------------------
// Summary & Exit
// -------------------------------------------------------------
console.log(`\n${colors.bold}----------------------------------------${colors.reset}`)
console.log(`${colors.bold}Pre-Flight Health Check Summary:${colors.reset}`)
console.log(`  Passed: ${colors.green}${checksPassed}${colors.reset}`)
console.log(`  Failed: ${checksFailed > 0 ? colors.red : colors.gray}${checksFailed}${colors.reset}`)

if (checksFailed === 0) {
  console.log(`\n${colors.bold}${colors.green}🚀 ALL PRE-FLIGHT VERIFICATIONS PASSED! READY FOR SUBMISSION.${colors.reset}\n`)
  process.exit(0)
} else {
  console.error(`\n${colors.bold}${colors.red}❌ PRE-FLIGHT CHECKS FAILED: Resolve the issues above before submitting.${colors.reset}\n`)
  process.exit(1)
}
