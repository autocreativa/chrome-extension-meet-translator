# Proposal: Virtual Mic Translator for Google Meet

## Overview

Implement a virtual microphone system that allows a single user with the extension to translate their speech in real-time for Google Meet participants, even if those participants don't have the extension installed.

## Problem Statement

Currently, the extension requires all participants to have it installed for bidirectional translation. This creates friction for users who want to translate their speech without requiring others to install additional software.

## Solution

Create a virtual microphone that:
1. Captures the user's speech via microphone
2. Translates the speech in real-time
3. Outputs the translated audio to a virtual microphone
4. Google Meet receives the virtual microphone as if it were a real microphone

## Key Features

- **Real-time translation**: Spanish → Italian/English/etc.
- **Virtual microphone output**: Injects translated audio into Google Meet
- **No client-side installation required**: Other participants use Google Meet normally
- **Low latency**: Optimized for natural conversation flow

## Technical Approach

### Core Components

1. **Audio Capture**: Use Chrome Tab Audio Capture API to capture microphone input
2. **Speech Recognition**: Web Speech API or external service for speech-to-text
3. **Translation**: OpenRouter API for translation
4. **Text-to-Speech**: Web Speech API or external TTS service
5. **Virtual Microphone**: Chrome Extension Audio Capture API to inject audio into Meet tab

### Data Flow

```
User speaks (Spanish)
    ↓
[Microphone Capture]
    ↓
[Speech Recognition] → "Hola, ¿cómo estás?"
    ↓
[Translation API] → "Hello, how are you?"
    ↓
[Text-to-Speech] → Audio file (Italian)
    ↓
[Virtual Microphone] → Google Meet
    ↓
Other participants hear: "Ciao, come stai?"
```

## Requirements

### Functional Requirements

- [ ] FR-01: Extension captures user's microphone audio
- [ ] FR-02: Extension translates speech in real-time
- [ ] FR-03: Extension generates TTS audio in target language
- [ ] FR-04: Extension injects audio into Google Meet as virtual microphone
- [ ] FR-05: Users can select source and target languages
- [ ] FR-06: Extension provides UI to control translation (start/stop)
- [ ] FR-07: Extension handles audio latency and sync

### Non-Functional Requirements

- [ ] NFR-01: Latency < 500ms for natural conversation
- [ ] NFR-02: Support for at least 5 languages (ES, EN, IT, FR, DE)
- [ ] NFR-03: Works with Chrome 90+
- [ ] NFR-04: Minimal CPU/memory overhead

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Chrome blocks audio injection | High | Use Tab Audio Capture API (allowed) |
| High latency | Medium | Optimize TTS and translation pipeline |
| Audio quality issues | Medium | Use high-quality TTS voices |
| Permission restrictions | Medium | Clear permission explanations in UI |

## Success Metrics

- Translation latency < 500ms
- User satisfaction score > 4/5
- Successful audio injection in 95%+ of Meet sessions
- Support for 5+ languages

## Timeline

Estimated: 2-3 weeks for MVP

## Dependencies

- Chrome Extension Audio Capture API
- Web Speech API (Speech Recognition + TTS)
- OpenRouter API (translation)
- Google Meet Tab Audio Capture permission
