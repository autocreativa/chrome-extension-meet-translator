# Spec: Virtual Microphone Translator

## Overview

This spec defines the requirements for implementing a virtual microphone translator that allows a single user to translate their speech in real-time for Google Meet participants, even if those participants don't have the extension installed.

## Functional Requirements

### FR-01: Audio Capture
**Description**: The extension must capture the user's microphone audio for processing.

**Acceptance Criteria**:
- Extension requests microphone permission on first use
- Audio is captured at 16kHz sample rate
- Audio is processed in 100ms chunks
- Echo cancellation and noise suppression are enabled

**Test Scenario**:
1. User installs extension
2. Extension requests microphone permission
3. User grants permission
4. Extension captures audio successfully

### FR-02: Speech Recognition
**Description**: The extension must convert speech audio to text using speech recognition.

**Acceptance Criteria**:
- Uses Web Speech API (webkitSpeechRecognition)
- Supports continuous recognition
- Returns interim and final results
- Handles recognition errors gracefully

**Test Scenario**:
1. User speaks in Spanish
2. Extension converts speech to text
3. Text is passed to translation engine

### FR-03: Translation
**Description**: The extension must translate text between languages using OpenRouter API.

**Acceptance Criteria**:
- Uses OpenRouter API with model `inclusionai/ling-3.0-flash:free`
- Supports at least 5 languages (ES, EN, IT, FR, DE)
- Returns translation within 200ms
- Handles API errors with retry logic

**Test Scenario**:
1. Input: "Hola, ¿cómo estás?" (Spanish)
2. Output: "Hello, how are you?" (English)
3. Verify translation accuracy

### FR-04: Text-to-Speech
**Description**: The extension must convert translated text to audio using TTS.

**Acceptance Criteria**:
- Uses Web Speech Synthesis API
- Supports multiple voices per language
- Generates audio at natural speech rate
- Handles TTS errors gracefully

**Test Scenario**:
1. Input: "Hello, how are you?" (English text)
2. Output: Audio playing in English
3. Verify audio clarity and naturalness

### FR-05: Virtual Microphone Injection
**Description**: The extension must inject translated audio into Google Meet as a virtual microphone.

**Acceptance Criteria**:
- Uses Chrome Tab Audio Capture API
- Injects audio into active Meet tab
- Syncs audio with Meet audio stream
- Handles Meet tab lifecycle (open/close)

**Test Scenario**:
1. User opens Google Meet
2. Extension detects Meet tab
3. User speaks in Spanish
4. Other participants hear Italian audio

### FR-06: User Interface
**Description**: The extension must provide a UI for controlling translation.

**Acceptance Criteria**:
- Popup shows translation status
- User can select source and target languages
- Start/Stop button controls translation
- Volume slider adjusts output volume
- Error messages are user-friendly

**Test Scenario**:
1. User opens popup
2. Selects Spanish → Italian
3. Clicks Start
4. Verifies status shows "Translating"

## Non-Functional Requirements

### NFR-01: Latency
**Description**: Total translation latency must be less than 500ms.

**Measurement**:
- Speech recognition: < 100ms
- Translation: < 200ms
- TTS generation: < 200ms
- **Total**: < 500ms

**Test Scenario**:
1. User speaks a phrase
2. Measure time until audio plays
3. Verify < 500ms

### NFR-02: Language Support
**Description**: Extension must support at least 5 languages.

**Supported Languages**:
- Spanish (es-ES)
- English (en-US)
- Italian (it-IT)
- French (fr-FR)
- German (de-DE)

**Test Scenario**:
1. Test all language pairs
2. Verify translations are accurate
3. Verify TTS works for all languages

### NFR-03: Browser Compatibility
**Description**: Extension must work with Chrome 90+.

**Test Scenario**:
1. Install extension on Chrome 90
2. Verify all features work
3. Test on Chrome 120 (latest)

### NFR-04: Resource Usage
**Description**: Extension must have minimal CPU and memory overhead.

**Limits**:
- CPU: < 5% during translation
- Memory: < 50MB during translation
- Network: < 100KB per minute

**Test Scenario**:
1. Run extension for 10 minutes
2. Measure CPU and memory usage
3. Verify within limits

## API Specifications

### OpenRouter API

**Endpoint**: `POST https://openrouter.ai/api/v1/chat/completions`

**Request**:
```json
{
  "model": "inclusionai/ling-3.0-flash:free",
  "messages": [
    {
      "role": "system",
      "content": "You are a translator. Translate the following text from es to it. Return only the translation, no explanations."
    },
    {
      "role": "user",
      "content": "Hola, ¿cómo estás?"
    }
  ],
  "max_tokens": 500
}
```

**Response**:
```json
{
  "choices": [
    {
      "message": {
        "content": "Ciao, come stai?"
      }
    }
  ]
}
```

### Chrome Tab Audio Capture API

**Permission**: `tabCapture`

**Usage**:
```javascript
const stream = await chrome.tabCapture.getMediaStreamId({
  targetTabId: meetTabId,
  audio: true
});
```

## Error Handling

### Error Codes

| Code | Description | Handling |
|------|-------------|----------|
| `MIC_ACCESS_DENIED` | Microphone permission denied | Show permission request UI |
| `TAB_NOT_FOUND` | Meet tab not detected | Prompt user to open Meet |
| `TRANSLATION_FAILED` | Translation API error | Retry with backoff, show error |
| `TTS_FAILED` | TTS generation error | Use fallback TTS, log error |
| `INJECTION_FAILED` | Audio injection error | Show error, suggest restart |

### Retry Logic

- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)
- Log all retries for debugging

## Security

### API Key Storage
- Store in Chrome Storage API (encrypted)
- Never log or expose API key
- Require user to input API key on first use

### Audio Data
- Process audio locally
- Don't store audio recordings
- Don't transmit audio to external servers (only text)

### Permissions
- Request only necessary permissions
- Explain why each permission is needed
- Allow user to revoke permissions

## Performance Optimization

### Batching
- Batch short audio segments (< 100ms) for better STT accuracy
- Process batches in parallel

### Caching
- Cache common translations (e.g., "hello", "thank you")
- Use LRU cache with 1000 entries

### Streaming
- Process audio in real-time chunks
- Don't wait for complete sentences

### Lazy Loading
- Load TTS voices on demand
- Pre-load common language voices
