#!/usr/bin/env node

/**
 * Script to fix Metro Bundler issues
 * Kills port 8081, clears cache, and provides troubleshooting steps
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Metro Bundler issues...\n');

// Step 1: Kill port 8081
console.log('1️⃣ Killing processes on port 8081...');
try {
  const result = execSync(`netstat -ano | findstr :8081`, { encoding: 'utf-8' });
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
    
    if (pids.size > 0) {
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`   ✓ Killed process PID: ${pid}`);
        } catch (error) {
          // Ignore errors
        }
      });
    }
  } else {
    console.log('   ✓ No process found on port 8081');
  }
} catch (error) {
  console.log('   ✓ No process found on port 8081');
}

// Step 2: Clear Metro cache
console.log('\n2️⃣ Clearing Metro cache...');
const cachePaths = [
  path.join(__dirname, '..', '.metro'),
  path.join(__dirname, '..', 'node_modules', '.cache'),
  path.join(process.env.TEMP || process.env.TMP || '', '.metro'),
];

cachePaths.forEach(cachePath => {
  try {
    if (fs.existsSync(cachePath)) {
      fs.rmSync(cachePath, { recursive: true, force: true });
      console.log(`   ✓ Cleared: ${cachePath}`);
    }
  } catch (error) {
    // Ignore errors
  }
});

// Step 3: Clear watchman cache (if available)
console.log('\n3️⃣ Clearing Watchman cache...');
try {
  execSync('watchman watch-del-all', { stdio: 'ignore' });
  console.log('   ✓ Cleared Watchman cache');
} catch (error) {
  console.log('   ⚠ Watchman not installed (optional)');
}

// Step 4: Clear npm cache
console.log('\n4️⃣ Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('   ✓ Cleared npm cache');
} catch (error) {
  console.log('   ⚠ Could not clear npm cache');
}

console.log('\n✅ Metro Bundler fix completed!');
console.log('\n📝 Next steps:');
console.log('   1. Run: npm run reset:metro');
console.log('   2. If still having issues, try:');
console.log('      - npm install');
console.log('      - npx expo start --clear');
console.log('   3. Check firewall/antivirus settings');
console.log('   4. Ensure Node.js version is compatible (16-20)\n');

