#!/usr/bin/env node

/**
 * Script to kill a process using a specific port on Windows
 * Usage: node scripts/kill-port.js <port>
 */

const { execSync } = require('child_process');
const port = process.argv[2];

if (!port) {
  console.error('Usage: node scripts/kill-port.js <port>');
  console.error('Example: node scripts/kill-port.js 3000');
  process.exit(1);
}

try {
  console.log(`Checking for processes using port ${port}...`);
  
  // Find the process ID (PID) using the port
  const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
  
  if (result.trim()) {
    // Extract PID from the output (last column)
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
      console.log(`Found process(es) with PID(s): ${Array.from(pids).join(', ')}`);
      
      // Kill each process
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
          console.log(`Successfully killed process on port ${port} (PID: ${pid})`);
        } catch (error) {
          console.error(`Error killing process ${pid}:`, error.message);
        }
      });
    } else {
      console.log(`No process found using port ${port}`);
    }
  } else {
    console.log(`No process found using port ${port}`);
  }
} catch (error) {
  if (error.status === 1) {
    // netstat returns 1 when no matches found
    console.log(`No process found using port ${port}`);
  } else {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

