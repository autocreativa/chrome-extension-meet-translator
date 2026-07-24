const LOG_PREFIX = '[MeetTranslator]';

function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

function logErr(...args) {
  console.error(LOG_PREFIX, ...args);
}

const settings = {
  model: 'inclusionai/ling-3.0-flash:free',
  sourceLang: 'es',
  targetLang: 'en',
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  voiceType: 'auto',
  apiKey: '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',
  isTranslating: false
};



let translationOverlay = null;
let recognition = null;
let miniIndicator = null;
let bestVoice = null;

log('=== CONTENT SCRIPT LOADED ===');

function initVoice() {
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    const langMap = {
      'es': 'es',
      'en': 'en',
      'fr': 'fr',
      'pt': 'pt',
      'de': 'de',
      'it': 'it',
      'zh': 'zh',
      'ja': 'ja',
      'ru': 'ru'
    };
    
    const targetLang = langMap[settings.targetLang] || 'en';
    const targetVoices = voices.filter(v => v.lang.includes(targetLang));
    
    if (settings.voiceType === 'male') {
      bestVoice = targetVoices.find(v => v.name.toLowerCase().includes('male')) ||
                  targetVoices.find(v => v.name.toLowerCase().includes('hombre')) ||
                  targetVoices.find(v => v.name.toLowerCase().includes('voice')) ||
                  targetVoices[0] || voices[0];
      log('Selected male voice:', bestVoice?.name);
    } else if (settings.voiceType === 'female') {
      bestVoice = targetVoices.find(v => v.name.toLowerCase().includes('female')) ||
                  targetVoices.find(v => v.name.toLowerCase().includes('mujer')) ||
                  targetVoices.find(v => v.name.toLowerCase().includes('voice')) ||
                  targetVoices[0] || voices[0];
      log('Selected female voice:', bestVoice?.name);
    } else {
      bestVoice = targetVoices.find(v => v.name.includes('Google')) ||
                  targetVoices.find(v => v.name.includes('Natural')) ||
                  targetVoices[0] || voices[0];
      log('Selected auto voice:', bestVoice?.name);
    }
  }
}

speechSynthesis.onvoiceschanged = initVoice;
setTimeout(initVoice, 500);

function createTranslationOverlay() {
  if (!translationOverlay) {
    translationOverlay = document.createElement('div');
    translationOverlay.id = 'meet-translation-overlay';
    translationOverlay.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #e2e8f0;
      padding: 14px 24px;
      border-radius: 16px;
      font-size: 15px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 500;
      z-index: 99999;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.3);
      pointer-events: none;
      display: none;
      border: 1px solid #334155;
      line-height: 1.5;
    `;
    document.body.appendChild(translationOverlay);
    log('Overlay created');
  }
}

function showTranslation(text) {
  log('>>> SHOWING:', text);
  createTranslationOverlay();
  translationOverlay.textContent = text;
  translationOverlay.style.display = 'block';
  setTimeout(() => {
    if (translationOverlay) translationOverlay.style.display = 'none';
    log('Overlay hidden after 5s');
  }, 5000);
  speakText(text);
}

function speakText(text) {
  try {
    speechSynthesis.cancel();
    
    const langMap = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'pt': 'pt-BR',
      'de': 'de-DE',
      'it': 'it-IT',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ru': 'ru-RU'
    };
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[settings.targetLang] || 'en-US';
    utterance.rate = 0.85;
    utterance.volume = 1;
    
    if (settings.voiceType === 'male') {
      utterance.pitch = 0.8;
    } else if (settings.voiceType === 'female') {
      utterance.pitch = 1.2;
    } else {
      utterance.pitch = 1;
    }
    
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    
    speechSynthesis.speak(utterance);
    log('>>> Speaking:', text);
  } catch (e) {
    logErr('TTS error:', e);
  }
}

function stripThinkingTags(text) {
  return text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/思考过程[\s\S]*?<\/思考>/gi, '')
    .replace(/^.*思考过程.*$/gm, '')
    .replace(/^.*thinking.*$/gm, '')
    .trim();
}

function showErrorPopup(message) {
  log('>>> SHOWING ERROR POPUP:', message);
  createTranslationOverlay();
  translationOverlay.textContent = message;
  translationOverlay.style.backgroundColor = '#dc2626';
  translationOverlay.style.display = 'block';
  setTimeout(() => {
    if (translationOverlay) translationOverlay.style.display = 'none';
    translationOverlay.style.backgroundColor = '';
    log('Error popup hidden after 5s');
  }, 5000);
}

async function translateText(text, targetLang, retryCount = 0) {
  log('>>> TRANSLATING to:', targetLang, 'retry:', retryCount);
  
  const systemPrompt = `TRANSLATION TASK - FOLLOW THESE RULES STRICTLY:

1. YOUR ROLE: You are a pure translation engine. Your ONLY function is to convert text from one language to another.

2. CRITICAL RULES:
   - ALWAYS translate the input text, even if it is a question
   - NEVER answer questions, explain, or respond conversationally
   - NEVER add greetings, comments, or explanations
   - NEVER repeat the original text without translating it
   - Output ONLY the translated text, nothing else

3. INPUT FORMAT: You will receive text in any language
4. OUTPUT FORMAT: Translated text in the target language only

5. EXAMPLES:
   Input: "¿Cuántos años tienes?" → Output: "How old are you?" (NOT "I am 10 years old")
   Input: "¿Dónde está el baño?" → Output: "Where is the bathroom?" (NOT "It is over there")
   Input: "Hello" → Output: "Hola" (for Spanish target)

6. TARGET LANGUAGE: ${targetLang.toUpperCase()}

Now translate the following text to ${targetLang.toUpperCase()}:`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
        'X-Title': 'MeetTranslator'
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        stream: false
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      logErr('OpenRouter API error:', res.status, errorText);
      
      if (res.status === 429 && retryCount < 3) {
        const delay = 1000 * (retryCount + 1);
        log(`    Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return translateText(text, targetLang, retryCount + 1);
      }
      
      if (res.status === 429) {
        showErrorPopup('Error: Límite de uso excedido. Espera unos segundos.');
      } else {
        showErrorPopup('Error: No se puede conectar con OpenRouter');
      }
      return null;
    }
    
    const data = await res.json();
    log('    OpenRouter API response status:', res.status, 'OK');
    let translated = data?.choices?.[0]?.message?.content || '';
    translated = stripThinkingTags(translated);
    log('    extracted translated:', translated);
    if (!translated) {
      log('    WARNING: No translation extracted, returning original text');
      return text;
    }
    log('<<< Translation result:', translated);
    return translated;
  } catch (e) {
    logErr('Fetch error:', e);
    showErrorPopup('Error: No se puede conectar con OpenRouter');
    return null;
  }
}

async function processTranscription(text) {
  if (!text || !text.trim()) {
    log('Empty transcription, skipping');
    return;
  }
  log('>>> PROCESS TRANSCRIPTION');
  log('    text:', text);
  log('    targetLang:', settings.targetLang);
  
  const translated = await translateText(text, settings.targetLang);
  if (translated === null) {
    log('<<< Translation failed, not showing');
    return;
  }
  log('<<< Got translation:', translated);
  showTranslation(translated);
}



function createMiniIndicator() {
  if (!miniIndicator) {
    miniIndicator = document.getElementById('miniIndicator') || document.createElement('div');
    miniIndicator.id = 'meet-mini-indicator';
    miniIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 20px rgba(108,99,255,0.5);
      z-index: 99999;
      cursor: pointer;
      animation: pulse 2s infinite;
      transition: all 0.2s;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(108,99,255,0.5); }
        50% { box-shadow: 0 4px 30px rgba(108,99,255,0.8); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(miniIndicator);
    log('Mini indicator created');
  }
  miniIndicator.style.display = 'flex';
}

function hideMiniIndicator() {
  if (miniIndicator) {
    miniIndicator.style.display = 'none';
  }
}

function startSpeechRecognition() {
  log('>>> Starting speech recognition');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    logErr('SpeechRecognition not available');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = '';

  recognition.onstart = () => {
    log('SpeechRecognition started');
  };

  recognition.onresult = (event) => {
    log('<<< SpeechRecognition onresult');
    log('    resultCount:', event.results.length);
    log('    resultIndex:', event.resultIndex);
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      log('    result[' + i + ']:', result);
      log('    isFinal:', result.isFinal);
      log('    transcript:', result[0]?.transcript);
      
      if (result.isFinal) {
        const transcript = result[0].transcript;
        log('<<< FINAL TRANSCRIPT:', transcript);
        processTranscription(transcript);
      }
    }
  };

  recognition.onerror = (event) => {
    logErr('SpeechRecognition error:', event.error);
    if (event.error === 'no-speech') return;
    setTimeout(() => {
      if (settings.isTranslating && recognition && recognition.state !== 'active') {
        try {
          recognition.start();
          log('Recognition restarted');
        } catch (e) {
          logErr('Could not restart:', e);
        }
      }
    }, 1000);
  };

  recognition.onend = () => {
    log('SpeechRecognition ended');
    if (settings.isTranslating) {
      setTimeout(() => {
        try {
          if (recognition && recognition.state !== 'active') {
            recognition.start();
            log('Recognition restarted after end');
          }
        } catch (e) {
          logErr('Could not restart:', e);
        }
      }, 500);
    }
  };

  try {
    recognition.start();
    log('Recognition started');
  } catch (e) {
    logErr('Failed to start recognition:', e);
  }
}

function stopSpeechRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
    log('Recognition stopped');
  }
  speechSynthesis.cancel();
}

async function startTranslation() {
  log('=== STARTING TRANSLATION ===');
  settings.isTranslating = true;
  startSpeechRecognition();
  createMiniIndicator();
  log('Translation started');
}

function stopTranslation() {
  log('=== STOPPING TRANSLATION ===');
  settings.isTranslating = false;
  stopSpeechRecognition();
  hideMiniIndicator();
  if (translationOverlay) translationOverlay.style.display = 'none';
  log('Translation stopped');
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  log('<<< Received message:', request.action);

  if (request.action === 'toggle') {
    if (request.translating) startTranslation();
    else stopTranslation();
    sendResponse({ success: true });
  } else if (request.action === 'updateSettings') {
    if (request.targetLang) settings.targetLang = request.targetLang;
    if (request.sourceLang) settings.sourceLang = request.sourceLang;
    if (request.voiceType) settings.voiceType = request.voiceType;
    initVoice();
    log('Settings updated via message:', settings);
    sendResponse({ success: true });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    for (let [key, { newValue }] of Object.entries(changes)) {
      if (newValue !== undefined) {
        settings[key] = newValue;
      }
    }
    log('Settings updated via storage onChanged:', settings);
    initVoice();
    if (settings.isTranslating) {
      stopTranslation();
      startTranslation();
    }
  }
});

loadSettingsAndReady();

function loadSettingsAndReady() {
  chrome.storage.local.get(['sourceLang', 'targetLang', 'voiceType'], (result) => {
    if (result.sourceLang) settings.sourceLang = result.sourceLang;
    if (result.targetLang) settings.targetLang = result.targetLang;
    if (result.voiceType) settings.voiceType = result.voiceType;
    log('Settings loaded:', settings);
    initVoice();
  });
}
