# Tasks: Virtual Mic Translator Implementation

## Phase 1: Foundation (Days 1-3)

### Task 1.1: Create Extension Structure
- [ ] Create new extension directory `virtual-mic/`
- [ ] Set up manifest.json with required permissions
- [ ] Create background.js service worker
- [ ] Create popup.html and popup.js for UI
- [ ] Set up build system (webpack/vite)

**Files to create:**
- `virtual-mic/manifest.json`
- `virtual-mic/background.js`
- `virtual-mic/popup.html`
- `virtual-mic/popup.js`
- `virtual-mic/package.json`

**Dependencies:**
```json
{
  "dependencies": {
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0",
    "copy-webpack-plugin": "^11.0.0"
  }
}
```

### Task 1.2: Implement Audio Capture
- [ ] Create AudioCapture class
- [ ] Request microphone permission
- [ ] Set up AudioContext for processing
- [ ] Test audio capture in isolation

**Test:**
```javascript
// Test microphone access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
console.log('Microphone access granted');
```

### Task 1.3: Implement Speech Recognition
- [ ] Create SpeechRecognizer class
- [ ] Initialize Web Speech API
- [ ] Handle transcription events
- [ ] Test with sample audio

**Test:**
```javascript
// Test speech recognition
const recognition = new webkitSpeechRecognition();
recognition.lang = 'es-ES';
recognition.onresult = (event) => {
  console.log('Transcript:', event.results[0][0].transcript);
};
recognition.start();
```

## Phase 2: Translation Pipeline (Days 4-7)

### Task 2.1: Implement Translation Engine
- [ ] Create TranslationEngine class
- [ ] Integrate with OpenRouter API
- [ ] Handle API responses and errors
- [ ] Add language pair configuration

**Test:**
```javascript
// Test translation
const engine = new TranslationEngine(apiKey);
const translated = await engine.translate('Hello', 'en', 'it');
console.log('Translation:', translated); // Expected: "Ciao"
```

### Task 2.2: Implement Text-to-Speech
- [ ] Create TextToSpeech class
- [ ] Initialize Web Speech Synthesis
- [ ] Handle voice selection
- [ ] Test TTS output

**Test:**
```javascript
// Test TTS
const tts = new TextToSpeech();
await tts.speak('Ciao', 'it-IT');
```

### Task 2.3: Create Translation Pipeline
- [ ] Connect STT → Translation → TTS
- [ ] Handle async flow
- [ ] Add error handling
- [ ] Test end-to-end translation

**Test:**
```javascript
// Test full pipeline
const pipeline = new TranslationPipeline();
pipeline.start('es-ES', 'it-IT');
// Speak in Spanish, expect Italian audio output
```

## Phase 3: Virtual Microphone (Days 8-12)

### Task 3.1: Implement Virtual Mic Injector
- [ ] Create VirtualMicInjector class
- [ ] Use Tab Audio Capture API
- [ ] Inject audio into Meet tab
- [ ] Test audio injection

**Test:**
```javascript
// Test virtual mic
const injector = new VirtualMicInjector();
await injector.injectAudio(audioBuffer, meetTabId);
// Verify audio plays in Meet
```

### Task 3.2: Integrate with Google Meet
- [ ] Detect Meet tab automatically
- [ ] Handle Meet tab lifecycle
- [ ] Sync audio with Meet audio
- [ ] Test in real Meet session

**Test:**
- Join a Meet call
- Speak in Spanish
- Verify other participants hear Italian

### Task 3.3: Add UI Controls
- [ ] Create popup UI for controls
- [ ] Add start/stop buttons
- [ ] Show translation status
- [ ] Add language selection

**UI Components:**
- Language selector (source/target)
- Start/Stop translation button
- Status indicator
- Volume control

## Phase 4: Polish & Testing (Days 13-15)

### Task 4.1: Error Handling
- [ ] Add retry logic for API failures
- [ ] Handle permission denials
- [ ] Add user-friendly error messages
- [ ] Log errors for debugging

### Task 4.2: Performance Optimization
- [ ] Optimize audio processing
- [ ] Reduce latency
- [ ] Cache common translations
- [ ] Profile memory usage

### Task 4.3: Testing
- [ ] Test with multiple language pairs
- [ ] Test in different Meet scenarios
- [ ] Test with background noise
- [ ] Test with multiple participants

### Task 4.4: Documentation
- [ ] Write README with installation instructions
- [ ] Document API key setup
- [ ] Create user guide
- [ ] Add troubleshooting section

## Phase 5: Deployment (Day 16)

### Task 5.1: Build & Package
- [ ] Run webpack build
- [ ] Generate ZIP file
- [ ] Test installation
- [ ] Verify all features work

### Task 5.2: Publish to Chrome Web Store
- [ ] Create developer account ($5)
- [ ] Fill out store listing
- [ ] Upload extension
- [ ] Submit for review

## Acceptance Criteria

- [ ] User can speak in Spanish and others hear Italian
- [ ] Translation latency < 500ms
- [ ] Works in Google Meet with multiple participants
- [ ] No extension required for other participants
- [ ] Clear UI for starting/stopping translation
- [ ] Error handling for all failure scenarios

## Notes

- Start with Spanish → Italian as primary language pair
- Use Web Speech API for STT/TTS (free, no API key needed)
- Use OpenRouter for translation (requires API key)
- Tab Audio Capture requires user interaction to start
