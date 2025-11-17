const fs = require('fs');
const path = require('path');

/**
 * Build configuration
 */
const config = {
  sourceDir: './app/server',
  outputDir: './dist',
  includeDev: process.argv.includes('--dev'),
  preserveDirs: ['libraries', 'utilities'] // Preserve these directories in dist
};

/**
 * Recursively remove a directory
 * @param {string} dirPath - Path to directory
 */
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        removeDir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

/**
 * Recursively create directory
 * @param {string} dirPath - Path to directory
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Check if file is a test file
 * @param {string} fileName - Name of the file
 * @returns {boolean} True if test file
 */
function isTestFile(fileName) {
  return fileName.includes('.test.') ||
         fileName.includes('.spec.') ||
         fileName.endsWith('_test.js') ||
         fileName.endsWith('_spec.js');
}

/**
 * Copy files from source to destination
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {string} [relativePath=''] - Relative path from source root
 */
function copyFiles(srcDir, destDir, relativePath = '') {
  const files = fs.readdirSync(srcDir);

  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      ensureDir(destPath);
      copyFiles(srcPath, destPath, path.join(relativePath, file));
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      // Skip test files unless in dev mode (only for .js files)
      if (file.endsWith('.js') && isTestFile(file) && !config.includeDev) {
        console.log(`⊘ Skipped test file: ${path.join(relativePath, file)}`);
        return;
      }

      // Copy the file
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied: ${path.join(relativePath, file)}`);
    }
  });
}

/**
 * Main build function
 */
function build() {
  console.log('============================================================');
  console.log('Google Apps Script Build');
  console.log('============================================================');
  console.log(`Mode: ${config.includeDev ? 'Development (includes tests)' : 'Production (excludes tests)'}`);
  console.log('============================================================\n');

  // Clean dist directory but preserve specific folders and appsscript.json
  console.log('📦 Cleaning dist directory...');
  if (fs.existsSync(config.outputDir)) {
    const preserveFiles = ['appsscript.json'];
    const preservePaths = [...config.preserveDirs, ...preserveFiles];

    fs.readdirSync(config.outputDir).forEach(item => {
      if (!preservePaths.includes(item)) {
        const itemPath = path.join(config.outputDir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          removeDir(itemPath);
        } else {
          fs.unlinkSync(itemPath);
        }
      }
    });
  } else {
    ensureDir(config.outputDir);
  }
  console.log('✓ Cleaned dist directory\n');

  // Copy files from app/server to dist
  console.log('📋 Copying files...');
  copyFiles(config.sourceDir, config.outputDir);
  console.log('\n✓ Files copied\n');

  // Preserve special directories
  config.preserveDirs.forEach(dir => {
    const dirPath = path.join(config.outputDir, dir);
    ensureDir(dirPath);
  });

  console.log('============================================================');
  console.log('✅ Build complete!');
  console.log('============================================================\n');

  // Summary
  const files = fs.readdirSync(config.outputDir).filter(f => {
    const fPath = path.join(config.outputDir, f);
    return fs.statSync(fPath).isFile() && f.endsWith('.js');
  });
  console.log(`Built ${files.length} JavaScript file(s)`);
  console.log(`Output directory: ${config.outputDir}`);
  console.log();
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
