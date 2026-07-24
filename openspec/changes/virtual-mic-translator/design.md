# Design: Virtual Mic Translator

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CHROME EXTENSION                            │
│                                                                   │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐     │
│  │ Audio       │    │ Translation  │    │ Virtual Mic     │     │
│  │ Capture     │───→│ Engine       │───→│ Injector        │     │
│  │             │    │              │    │                 │     │
│  │ - Microphone│    │ - STT        │    │ - TTS           │     │
│  │ - Tab Audio │    │ - Translate  │    │ - Audio Output  │     │
│  └─────────────┘    └──────────────┘    └─────────────────┘     │
│                           ↓                                       │
│                    ┌──────────────┐                               │
│                    │ OpenRouter   │                               │
│                    │ API          │                               │
│                    └──────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │   GOOGLE MEET    │
                    │   (Virtual Mic)  │
                    └──────────────────┘
```

## Component Design

### 1. Audio Capture Module

**Purpose**: Capture user's microphone audio for processing

**Implementation**:
```javascript
class AudioCapture {
  async start() {
    // Request microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    
    this.source.connect(this.analyser);
    this.isCapturing = true;
  }
  
  async stop() {
    this.isCapturing = false;
    this.source.disconnect();
  }
}
```

**Permissions needed**: `microphone`, `activeTab`

### 2. Speech-to-Text (STT) Module

**Purpose**: Convert speech audio to text

**Implementation**:
```javascript
class SpeechRecognizer {
  constructor() {
    this.recognition = null;
    this.isListening = false;
  }
  
  async start(language = 'es-ES') {
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition;
    
    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      this.onTranscript(transcript);
    };
    
    this.recognition.start();
    this.isListening = true;
  }
  
  stop() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
```

**Fallback**: Use external STT API (Google Cloud, AWS Transcribe) for better accuracy

### 3. Translation Module

**Purpose**: Translate text between languages

**Implementation**:
```javascript
class TranslationEngine {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  }
  
  async translate(text, sourceLang, targetLang) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'inclusionai/ling-3.0-flash:free',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Translate the following text from ${sourceLang} to ${targetLang}. Return only the translation, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 500
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
}
```

### 4. Text-to-Speech (TTS) Module

**Purpose**: Convert translated text to audio

**Implementation**:
```javascript
class TextToSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
  }
  
  async speak(text, language = 'it-IT') {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      
      this.synth.speak(utterance);
    });
  }
  
  // Alternative: Use AudioContext for better control
  async speakWithAudioContext(text, language) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    // Capture audio output
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    
    // Note: SpeechSynthesis doesn't directly support AudioContext
    // Alternative: Use external TTS API
    return this.synth.speak(utterance);
  }
}
```

**Alternative**: Use external TTS API (Google Cloud TTS, Azure TTS) for higher quality

### 5. Virtual Microphone Injector

**Purpose**: Inject translated audio into Google Meet tab

**Implementation**:
```javascript
class VirtualMicInjector {
  constructor() {
    this.audioContext = null;
    this.meetTabId = null;
  }
  
  async injectAudio(audioBuffer, meetTabId) {
    this.meetTabId = meetTabId;
    
    // Create audio context for playback
    this.audioContext = new AudioContext();
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Route to Meet tab via Tab Audio Capture
    // Note: This requires chrome.tabCapture API
    const stream = await chrome.tabCapture.getMediaStreamId({
      targetTabId: meetTabId,
      audio: true
    });
    
    source.connect(this.audioContext.destination);
    source.start();
  }
  
  async stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
```

**Permissions needed**: `tabCapture`, `activeTab`

## Data Flow Sequence

```
1. User speaks
   ↓
2. AudioCapture captures microphone audio
   ↓
3. SpeechRecognizer converts speech to text
   ↓
4. TranslationEngine translates text
   ↓
5. TextToSpeech generates audio
   ↓
6. VirtualMicInjector injects audio into Meet tab
   ↓
7. Other participants hear translated audio
```

## Error Handling

### Audio Capture Failures
- Request user to grant microphone permission
- Fallback to tab audio capture if available

### Translation Failures
- Retry with exponential backoff
- Use cached translations for common phrases
- Fallback to basic translation service

### TTS Failures
- Use system TTS as fallback
- Log errors for debugging
- Continue processing other audio

### Meet Tab Not Found
- Prompt user to open Google Meet
- Auto-detect Meet tab if available

## Security Considerations

1. **API Key Storage**: Use Chrome Storage API (encrypted)
2. **Audio Data**: Process locally, don't store audio
3. **Permissions**: Request only necessary permissions
4. **Data Transmission**: Encrypt API calls with HTTPS

## Performance Optimization

1. **Batching**: Batch short audio segments for better STT accuracy
2. **Caching**: Cache common translations
3. **Streaming**: Process audio in real-time chunks
4. **Lazy Loading**: Load TTS voices on demand
