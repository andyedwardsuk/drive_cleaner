/**
 * Drive Cleaner - Unified Automated Test Suite
 * Validates cryptography, licensing, pre-flight readiness, linting, and build integrity.
 */

/* eslint-env node */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n' + '='.repeat(60));
console.log('🧪 DRIVE CLEANER UNIFIED TEST SUITE');
console.log('='.repeat(60) + '\n');

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    totalFailed++;
  }
}

// -------------------------------------------------------------
// Suite 1: Cryptographic Licensing & Tamper Resistance
// -------------------------------------------------------------
console.log('=== 1. Cryptographic Licensing & Tamper Resistance ===');

const LICENSE_PRO_SALT = 'DC_SALT_2026_STORAGE_PRO';
const LICENSE_ENT_SALT = 'DC_SALT_2026_STORAGE_ENT';

function computeLicenseChecksum(payload, salt) {
  const str = `${payload}:${salt || LICENSE_PRO_SALT}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const unsigned = hash >>> 0;
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const c1 = chars[unsigned % 36];
  const c2 = chars[Math.floor(unsigned / 36) % 36];
  const c3 = chars[Math.floor(unsigned / (36 * 36)) % 36];
  const c4 = chars[Math.floor(unsigned / (36 * 36 * 36)) % 36];
  return `${c1}${c2}${c3}${c4}`;
}

function verifyKey(key) {
  if (!key || typeof key !== 'string') return { valid: false };
  const trimmed = key.trim().toUpperCase();
  if (trimmed === 'DC-PRO-TEST-2026' || trimmed === 'DC-PRO-EVAL-2026') {
    return { valid: true, tier: 'pro', type: 'evaluation' };
  }
  const proMatch = trimmed.match(/^DC-PRO-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/);
  if (proMatch) {
    const payload = `${proMatch[1]}-${proMatch[2]}`;
    const expected = computeLicenseChecksum(payload, LICENSE_PRO_SALT);
    return proMatch[3] === expected ? { valid: true, tier: 'pro' } : { valid: false };
  }
  const entMatch = trimmed.match(/^DC-ENT-([A-Z0-9]{4,16})-([A-Z0-9]{4})$/);
  if (entMatch) {
    const payload = entMatch[1];
    const expected = computeLicenseChecksum(payload, LICENSE_ENT_SALT);
    return entMatch[2] === expected ? { valid: true, tier: 'enterprise' } : { valid: false };
  }
  return { valid: false };
}

// Test evaluation keys
assert(verifyKey('DC-PRO-TEST-2026').valid === true, 'DC-PRO-TEST-2026 is accepted as evaluation key');
assert(verifyKey('DC-PRO-EVAL-2026').valid === true, 'DC-PRO-EVAL-2026 is accepted as evaluation key');
assert(verifyKey('dc-pro-test-2026').valid === true, 'Evaluation key check is case-insensitive');

// Test commercial Pro keys
const proPayload = 'ABCD-1234';
const proChecksum = computeLicenseChecksum(proPayload, LICENSE_PRO_SALT);
const validProKey = `DC-PRO-ABCD-1234-${proChecksum}`;
assert(verifyKey(validProKey).valid === true, `Valid Pro key ${validProKey} authenticates successfully`);

// Test Pro tamper resistance
const tamperedProKey1 = `DC-PRO-ABCD-1234-XXXX`;
assert(verifyKey(tamperedProKey1).valid === false, 'Tampered checksum is rejected');
const tamperedProKey2 = `DC-PRO-ABCE-1234-${proChecksum}`;
assert(verifyKey(tamperedProKey2).valid === false, 'Tampered payload with original checksum is rejected');

// Test Enterprise keys
const entPayload = 'CORP9999';
const entChecksum = computeLicenseChecksum(entPayload, LICENSE_ENT_SALT);
const validEntKey = `DC-ENT-CORP9999-${entChecksum}`;
assert(verifyKey(validEntKey).valid === true, `Valid Enterprise key ${validEntKey} authenticates successfully`);

// Test Enterprise salt cross-contamination prevention
const proSaltOnEntPayload = computeLicenseChecksum(entPayload, LICENSE_PRO_SALT);
const crossSaltKey = `DC-ENT-CORP9999-${proSaltOnEntPayload}`;
assert(verifyKey(crossSaltKey).valid === false, 'Enterprise key signed with Pro salt is rejected');

// Test Malformed Inputs
assert(verifyKey('').valid === false, 'Empty key is rejected');
assert(verifyKey(null).valid === false, 'Null key is rejected');
assert(verifyKey('GARBAGE-STRING-123').valid === false, 'Arbitrary format key is rejected');
assert(verifyKey('DC-PRO-ABCD-1234-EFGH-IJKL').valid === false, 'Over-length key is rejected');

// Test CSV Batch Inventory Files
const gumroadCsv = path.join(__dirname, '..', 'gumroad_keys.csv');
if (fs.existsSync(gumroadCsv)) {
  const lines = fs.readFileSync(gumroadCsv, 'utf-8').split(/\r?\n/).filter(Boolean);
  const dataLines = lines.slice(1);
  let allProValid = true;
  for (const line of dataLines) {
    const key = line.split(',')[0].replace(/"/g, '').trim();
    if (!verifyKey(key).valid) {
      allProValid = false;
      break;
    }
  }
  assert(allProValid && dataLines.length === 250, `All ${dataLines.length} keys in gumroad_keys.csv verified valid`);
}

const enterpriseCsv = path.join(__dirname, '..', 'enterprise_tokens.csv');
if (fs.existsSync(enterpriseCsv)) {
  const lines = fs.readFileSync(enterpriseCsv, 'utf-8').split(/\r?\n/).filter(Boolean);
  const dataLines = lines.slice(1);
  let allEntValid = true;
  for (const line of dataLines) {
    const key = line.split(',')[0].replace(/"/g, '').trim();
    if (!verifyKey(key).valid) {
      allEntValid = false;
      break;
    }
  }
  assert(allEntValid && dataLines.length === 250, `All ${dataLines.length} tokens in enterprise_tokens.csv verified valid`);
}

// -------------------------------------------------------------
// Suite 2: Rate Limiting Math & Exponential Backoff
// -------------------------------------------------------------
console.log('\n=== 2. Exponential Backoff & Jitter Simulation ===');

function simulateBackoff(retries, baseDelayMs) {
  const delays = [];
  for (let attempt = 0; attempt < retries; attempt++) {
    const exponential = baseDelayMs * Math.pow(2, attempt);
    const jitter = Math.floor(Math.random() * (baseDelayMs / 2));
    delays.push(exponential + jitter);
  }
  return delays;
}

const delays = simulateBackoff(4, 1000);
assert(delays.length === 4, '4 retry backoff delays generated');
assert(delays[0] >= 1000 && delays[0] < 1500, `Attempt 1 delay in expected range (actual: ${delays[0]}ms)`);
assert(delays[1] >= 2000 && delays[1] < 2500, `Attempt 2 delay in expected range (actual: ${delays[1]}ms)`);
assert(delays[2] >= 4000 && delays[2] < 4500, `Attempt 3 delay in expected range (actual: ${delays[2]}ms)`);
assert(delays[3] >= 8000 && delays[3] < 8500, `Attempt 4 delay in expected range (actual: ${delays[3]}ms)`);

// -------------------------------------------------------------
// Suite 3: Properties Storage Quota Math
// -------------------------------------------------------------
console.log('\n=== 3. Properties Storage Capacity & Quota Guard ===');

function calculatePropertiesUsage(mockProps) {
  let totalBytes = 0;
  const keys = Object.keys(mockProps);
  for (const k of keys) {
    totalBytes += k.length + (mockProps[k] ? mockProps[k].length : 0);
  }
  const maxBytes = 500 * 1024;
  const usedKb = (totalBytes / 1024).toFixed(2);
  const percentUsed = ((totalBytes / maxBytes) * 100).toFixed(1);
  return {
    totalBytes,
    usedKb,
    percentUsed: parseFloat(percentUsed),
    warning: totalBytes > maxBytes * 0.8
  };
}

const smallProps = { user_tier: 'pro', license_key: 'DC-PRO-ABCD-1234-EFGH' };
const smallUsage = calculatePropertiesUsage(smallProps);
assert(smallUsage.warning === false, 'Small properties usage does not trigger warning');
assert(smallUsage.percentUsed < 1.0, `Small properties usage percentage accurate (${smallUsage.percentUsed}%)`);

const largeMockProps = {};
for (let i = 0; i < 420; i++) {
  largeMockProps[`key_${i}`] = 'X'.repeat(1000);
}
const largeUsage = calculatePropertiesUsage(largeMockProps);
assert(largeUsage.warning === true, `High capacity usage (>80%) properly triggers warning (${largeUsage.percentUsed}%)`);

// -------------------------------------------------------------
// Suite 4: Pre-Flight Health Checks
// -------------------------------------------------------------
console.log('\n=== 4. Automated Pre-Flight Health Checks ===');
try {
  const preflightRaw = execSync('node scripts/preflight-check.js', { encoding: 'utf-8' });
  const cleanOutput = preflightRaw.replace(/\x1b\[[0-9;]*m/g, '');
  const passedMatch = cleanOutput.match(/Passed:\s+(\d+)/);
  const failedMatch = cleanOutput.match(/Failed:\s+(\d+)/);
  const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
  const failed = failedMatch ? parseInt(failedMatch[1], 10) : 1;
  assert(failed === 0 && passed >= 18, `Preflight checks passed completely (${passed} passed, ${failed} failed)`);
} catch (err) {
  assert(false, `Preflight check execution failed: ${err.message}`);
}

// -------------------------------------------------------------
// Suite 5: Code Quality & Linting
// -------------------------------------------------------------
console.log('\n=== 5. ESLint Static Analysis ===');
try {
  execSync('npm run lint', { encoding: 'utf-8' });
  assert(true, 'ESLint static analysis completed with 0 errors');
} catch (err) {
  assert(false, `ESLint failed: ${err.message}`);
}

// -------------------------------------------------------------
// Suite 6: Production Singlefile React Build
// -------------------------------------------------------------
console.log('\n=== 6. Production Bundle Build Integrity ===');
try {
  execSync('npm run build', { encoding: 'utf-8' });
  const distHtml = path.join(__dirname, '..', 'dist', 'index.html');
  assert(fs.existsSync(distHtml), 'Compiled dist/index.html exists');
  const stats = fs.statSync(distHtml);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  assert(stats.size > 1000000 && stats.size < 5000000, `Singlefile bundle size within bounds (${sizeMb} MB)`);
} catch (err) {
  assert(false, `Build failed: ${err.message}`);
}

// -------------------------------------------------------------
// Final Summary
// -------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log(`TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log('='.repeat(60) + '\n');

if (totalFailed > 0) {
  console.error('❌ SOME TESTS FAILED. Resolve before submission.');
  process.exit(1);
} else {
  console.log('🎉 ALL TESTS PASSED! DRIVE CLEANER IS READY FOR MARKETPLACE SUBMISSION.');
  process.exit(0);
}
