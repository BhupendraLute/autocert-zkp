/**
 * AutoCert-ZKP: Cryptographic Toolchain & Ceremony Pipeline
 * Compiles Circom arithmetic circuits to R1CS/WASM and generates Groth16 BN128 keys.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const CIRCUITS_DIR = path.join(ROOT_DIR, 'circuits');
const PUBLIC_ZK_DIR = path.join(ROOT_DIR, 'public', 'zk');
const TOOLS_DIR = path.join(ROOT_DIR, 'tools');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resolveCircomBinary() {
  const localWindowsCircom = path.join(TOOLS_DIR, 'circom.exe');
  if (fs.existsSync(localWindowsCircom)) {
    return `"${localWindowsCircom}"`;
  }

  try {
    execSync('circom --version', { stdio: 'ignore' });
    return 'circom';
  } catch {
    // Circom not in PATH
  }

  if (process.platform === 'win32') {
    ensureDir(TOOLS_DIR);
    console.log('[setup-zk] Downloading standalone circom-windows-amd64.exe (v2.2.3)...');
    execSync(
      `powershell -Command "Invoke-WebRequest -Uri 'https://github.com/iden3/circom/releases/download/v2.2.3/circom-windows-amd64.exe' -OutFile '${localWindowsCircom}'"`,
      { stdio: 'inherit' }
    );
    return `"${localWindowsCircom}"`;
  }

  throw new Error(
    'Circom binary not found. Please install circom or place circom binary in tools/.'
  );
}

async function runCeremony() {
  console.log('===========================================================');
  console.log('   AutoCert-ZKP: Phase 2 Cryptographic Setup & Ceremony    ');
  console.log('===========================================================\n');

  ensureDir(PUBLIC_ZK_DIR);

  const circomBin = resolveCircomBinary();
  console.log(`[1/5] Compiling arithmetic circuit using ${circomBin}...`);

  const circuitPath = path.join(CIRCUITS_DIR, 'academic_verifier.circom');
  const nodeModulesDir = path.join(ROOT_DIR, 'node_modules');

  const compileCmd = `${circomBin} "${circuitPath}" --r1cs --wasm --sym -o "${PUBLIC_ZK_DIR}" -l "${nodeModulesDir}"`;
  execSync(compileCmd, { stdio: 'inherit', cwd: ROOT_DIR });

  // Ensure academic_verifier.wasm is copied directly to public/zk/
  const nestedWasm = path.join(PUBLIC_ZK_DIR, 'academic_verifier_js', 'academic_verifier.wasm');
  const targetWasm = path.join(PUBLIC_ZK_DIR, 'academic_verifier.wasm');
  if (fs.existsSync(nestedWasm) && !fs.existsSync(targetWasm)) {
    fs.copyFileSync(nestedWasm, targetWasm);
    console.log('[setup-zk] Mirrored academic_verifier.wasm to public/zk/');
  }

  const ptauPrepared = path.join(PUBLIC_ZK_DIR, 'pot12_prepared.ptau');
  if (!fs.existsSync(ptauPrepared)) {
    console.log('\n[2/5] Initializing Powers of Tau ceremony (BN128, 2^12)...');
    const ptau0 = path.join(PUBLIC_ZK_DIR, 'pot12_0000.ptau');
    const ptauFinal = path.join(PUBLIC_ZK_DIR, 'pot12_final.ptau');

    execSync(`npx snarkjs powersoftau new bn128 12 "${ptau0}" -v`, { stdio: 'inherit' });
    execSync(
      `npx snarkjs powersoftau contribute "${ptau0}" "${ptauFinal}" --name="AutoCert Ceremony" -v -e="AutoCert2026AvishkarEntropy"`,
      { stdio: 'inherit' }
    );

    console.log('\n[3/5] Preparing Phase 2 for Groth16...');
    execSync(`npx snarkjs powersoftau prepare phase2 "${ptauFinal}" "${ptauPrepared}" -v`, {
      stdio: 'inherit',
    });
  } else {
    console.log('\n[2/5] Reusing existing pot12_prepared.ptau.');
  }

  console.log('\n[4/5] Executing Groth16 circuit-specific setup...');
  const r1csPath = path.join(PUBLIC_ZK_DIR, 'academic_verifier.r1cs');
  const zkey0 = path.join(PUBLIC_ZK_DIR, 'circuit_0000.zkey');
  const zkeyFinal = path.join(PUBLIC_ZK_DIR, 'circuit_final.zkey');
  const vKeyPath = path.join(PUBLIC_ZK_DIR, 'verification_key.json');

  execSync(`npx snarkjs groth16 setup "${r1csPath}" "${ptauPrepared}" "${zkey0}"`, {
    stdio: 'inherit',
  });

  execSync(
    `npx snarkjs zkey contribute "${zkey0}" "${zkeyFinal}" --name="AutoCert Ceremony" -v -e="AutoCert2026AvishkarEntropyZKey"`,
    { stdio: 'inherit' }
  );

  console.log('\n[5/5] Exporting Groth16 verification key...');
  execSync(`npx snarkjs zkey export verificationkey "${zkeyFinal}" "${vKeyPath}"`, {
    stdio: 'inherit',
  });

  console.log('\n[setup-zk] Circuit constraint summary:');
  execSync(`npx snarkjs r1cs info "${r1csPath}"`, { stdio: 'inherit' });

  console.log('\nArtifacts successfully generated:');
  console.log(` - WASM Witness Binary : ${targetWasm}`);
  console.log(` - Proving Key (.zkey) : ${zkeyFinal}`);
  console.log(` - Verification Key   : ${vKeyPath}`);
  console.log('\nCryptographic setup complete!\n');

  process.exit(0);
}

runCeremony().catch((err) => {
  console.error('[setup-zk] Error executing cryptographic ceremony:', err);
  process.exit(1);
});
