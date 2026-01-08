#!/usr/bin/env node

/**
 * Script to fix Node.js module loading errors
 * Clears node_modules, cache, and reinstalls dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Node.js module errors...\n');

// Check Node.js version
console.log('1️⃣ Checking Node.js version...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  console.log(`   Current Node.js version: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (majorVersion > 20) {
    console.log('   ⚠️  WARNING: Node.js version is too new!');
    console.log('   Expo SDK 52 requires Node.js 18.x or 20.x');
    console.log('   Consider downgrading to Node.js 20.x\n');
  } else if (majorVersion >= 18) {
    console.log('   ✓ Node.js version is compatible\n');
  } else {
    console.log('   ⚠️  WARNING: Node.js version is too old!');
    console.log('   Expo SDK 52 requires Node.js 18.x or 20.x\n');
  }
} catch (error) {
  console.log('   ⚠️  Could not check Node.js version\n');
}

// Step 2: Kill any running processes
console.log('2️⃣ Killing processes on ports 8081, 19000, 19001...');
const ports = [8081, 19000, 19001];
ports.forEach(port => {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    if (result.trim()) {
      const lines = result.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) {
          pids.add(pid);
        }
      });
      
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        } catch (error) {
          // Ignore
        }
      });
    }
  } catch (error) {
    // Ignore
  }
});
console.log('   ✓ Done\n');

// Step 3: Remove node_modules
console.log('3️⃣ Removing node_modules...');
try {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('   ✓ Removed node_modules\n');
  } else {
    console.log('   ✓ node_modules already removed\n');
  }
} catch (error) {
  console.log('   ⚠️  Could not remove node_modules (may need manual deletion)\n');
}

// Step 4: Remove lock files
console.log('4️⃣ Removing lock files...');
const lockFiles = ['package-lock.json', 'yarn.lock'];
lockFiles.forEach(lockFile => {
  try {
    const lockPath = path.join(__dirname, '..', lockFile);
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log(`   ✓ Removed ${lockFile}`);
    }
  } catch (error) {
    // Ignore
  }
});
console.log('');

// Step 5: Clear caches
console.log('5️⃣ Clearing caches...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('   ✓ Cleared npm cache');
} catch (error) {
  console.log('   ⚠️  Could not clear npm cache');
}

// Clear Expo cache
try {
  const expoPath = path.join(__dirname, '..', '.expo');
  if (fs.existsSync(expoPath)) {
    fs.rmSync(expoPath, { recursive: true, force: true });
    console.log('   ✓ Cleared Expo cache');
  }
} catch (error) {
  console.log('   ⚠️  Could not clear Expo cache');
}

// Clear Metro cache
const cachePaths = [
  path.join(__dirname, '..', '.metro'),
  path.join(__dirname, '..', 'node_modules', '.cache'),
];

cachePaths.forEach(cachePath => {
  try {
    if (fs.existsSync(cachePath)) {
      fs.rmSync(cachePath, { recursive: true, force: true });
    }
  } catch (error) {
    // Ignore
  }
});
console.log('   ✓ Cleared Metro cache\n');

// Step 6: Reinstall
console.log('6️⃣ Reinstalling dependencies...');
console.log('   This may take a few minutes...\n');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('\n   ✓ Dependencies installed successfully\n');
} catch (error) {
  console.log('\n   ⚠️  Installation had errors, but may still work\n');
}

console.log('✅ Fix completed!\n');
console.log('📝 Next steps:');
console.log('   1. Run: npm run start:clear');
console.log('   2. If still having issues:');
console.log('      - Consider downgrading to Node.js 20.x');
console.log('      - Or use: npx expo start --clear\n');












