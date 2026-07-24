const fs = require('fs');
const path = require('path');

const EXTENSION_DIR = '/Users/triton/chrome-extension-meet-translate';

function testExtensionStructure() {
  console.log('Testing extension structure...');
  
  const requiredFiles = [
    'manifest.json',
    'popup.html',
    'popup.js',
    'background.js',
    'content.js'
  ];
  
  let allPresent = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(EXTENSION_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${file} exists`);
    } else {
      console.log(`✗ ${file} missing`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('✓ All required files present\n');
  } else {
    console.log('✗ Some files missing\n');
    process.exit(1);
  }
}

function validateManifest() {
  console.log('Validating manifest.json...');
  
  const manifestPath = path.join(EXTENSION_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  const checks = [
    { field: 'manifest_version', expected: 3 },
    { field: 'name', required: true },
    { field: 'version', required: true },
    { field: 'description', required: true },
    { field: 'permissions', required: true },
    { field: 'action', required: true },
    { field: 'content_scripts', required: true },
    { field: 'background', required: true }
  ];
  
  let allValid = true;
  
  for (const check of checks) {
    if (check.expected) {
      if (manifest[check.field] === check.expected) {
        console.log(`✓ ${check.field} = ${check.expected}`);
      } else {
        console.log(`✗ ${check.field} should be ${check.expected}`);
        allValid = false;
      }
    } else if (check.required) {
      if (manifest[check.field]) {
        console.log(`✓ ${check.field} present`);
      } else {
        console.log(`✗ ${check.field} is required`);
        allValid = false;
      }
    }
  }
  
  if (allValid) {
    console.log('✓ Manifest is valid\n');
  } else {
    console.log('✗ Manifest has errors\n');
    process.exit(1);
  }
}

function validateContentScript() {
  console.log('Validating content.js...');
  
  const contentPath = path.join(EXTENSION_DIR, 'content.js');
  const content = fs.readFileSync(contentPath, 'utf8');
  
  const requiredFunctions = [
    'createTranslationOverlay',
    'startSpeechRecognition',
    'translateText',
    'showTranslation',
    'speakText',
    'startTranslation',
    'stopTranslation'
  ];
  
  let allPresent = true;
  
  for (const func of requiredFunctions) {
    if (content.includes(`function ${func}`)) {
      console.log(`✓ ${func} function present`);
    } else {
      console.log(`✗ ${func} function missing`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('✓ Content script is complete\n');
  } else {
    console.log('✗ Content script is incomplete\n');
    process.exit(1);
  }
}

function validatePopup() {
  console.log('Validating popup.html...');
  
  const popupPath = path.join(EXTENSION_DIR, 'popup.html');
  const popup = fs.readFileSync(popupPath, 'utf8');
  
  const requiredContent = [
    'settingsBtn',
    'apiUrl',
    'model',
    'language'
  ];
  
  let allPresent = true;
  
  for (const item of requiredContent) {
    if (popup.includes(item)) {
      console.log(`✓ ${item} present`);
    } else {
      console.log(`✗ ${item} missing`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('✓ Popup is complete\n');
  } else {
    console.log('✗ Popup is incomplete\n');
    process.exit(1);
  }
}

async function runTests() {
  console.log('=== Google Meet Voice Translator Tests ===\n');
  
  testExtensionStructure();
  validateManifest();
  validateContentScript();
  validatePopup();
  
  console.log('=== All tests passed ===');
  console.log('\nNew features:');
  console.log('- Speech synthesis for translated text');
  console.log('- Language selector in settings');
  console.log('- Configurable AI service URL');
  console.log('- Faster model: qwen2.5:0.5b');
  console.log('\nNext steps:');
  console.log('1. Recargar la extensión en chrome://extensions');
  console.log('2. Presionar ⚙️ para configurar URL, modelo e idioma');
  console.log('3. Iniciar traducción');
}

runTests();
