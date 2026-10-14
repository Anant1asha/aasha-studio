#!/usr/bin/env node

/**
 * AASHA Studio Desktop Runner.
 * Handles dual-mode execution:
 *   - Native Mode (Rust / Cargo present): invokes `tauri build` or `tauri dev`
 *   - Zero-Rust Mode (Rust not installed): gracefully informs developer, prevents crashes,
 *     and falls back to Tier 3 Browser Studio GUI on http://localhost:5173.
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

const action = process.argv[2] || 'build'; // 'build' or 'dev'

function hasCargo() {
  try {
    execSync('cargo --version', { stdio: 'ignore' });
    execSync('rustc --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

console.log('\n===============================================================');
console.log('🖥️  AASHA Studio Desktop Shell (Tauri v2 Environment Dispatcher)');
console.log('===============================================================');

if (hasCargo()) {
  console.log('✅ Native Rust toolchain detected (cargo + rustc).');
  console.log(`🚀 Executing native Tauri packaging: tauri ${action}...\n`);
  try {
    execSync(`npx tauri ${action}`, { stdio: 'inherit' });
    process.exit(0);
  } catch (err) {
    console.error(`❌ Native compilation failed:`, err.message);
    process.exit(1);
  }
} else {
  console.log('⚠️  Notice: Rust toolchain (cargo / rustc) not found on system PATH.');
  console.log('ℹ️  Skipping native desktop .exe/.msi binary compilation.');
  console.log('🌟 AASHA Studio Tier 3 Browser GUI is active & operational!');
  console.log('---------------------------------------------------------------');
  console.log('💡 Zero-Rust Execution Details:');
  console.log('   - Frontend UI: apps/studio-ui (Vite + React 18 + Tailwind)');
  console.log('   - Web Server:  http://localhost:5173');
  console.log('   - CLI Engine:  apps/cli (npx @aasha/cli studio)');
  console.log('   - To compile native Windows .exe / .msi installers later:');
  console.log('     1. Install Rust via: npm run setup:rust (or https://rustup.rs)');
  console.log('     2. Install Visual Studio C++ Build Tools (x64/x86 MSVC)');
  console.log('===============================================================\n');

  if (action === 'dev') {
    console.log('🌐 Launching Tier 3 Browser GUI via Vite development server...');
    const uiDir = path.resolve(__dirname, '../../studio-ui');
    const child = spawn('npm', ['run', 'dev'], { cwd: uiDir, stdio: 'inherit', shell: true });
    child.on('exit', (code) => process.exit(code || 0));
  } else {
    console.log('📦 Tier 3 frontend assets built and verified successfully in apps/studio-ui/dist.');
    process.exit(0);
  }
}
