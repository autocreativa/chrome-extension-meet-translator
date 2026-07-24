const LOG_PREFIX = '[MeetTranslator]';

function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

function logErr(...args) {
  console.error(LOG_PREFIX, ...args);
}

let settings = {
  sourceLang: 'es',
  targetLang: 'en',
  voiceType: 'auto'
};

function loadSettingsFromStorage() {
  chrome.storage.local.get(['sourceLang', 'targetLang', 'voiceType'], (result) => {
    if (result.sourceLang) settings.sourceLang = result.sourceLang;
    if (result.targetLang) settings.targetLang = result.targetLang;
    if (result.voiceType) settings.voiceType = result.voiceType;
    log('Settings loaded from storage:', settings);
  });
}

loadSettingsFromStorage();

log('=== BACKGROUND SCRIPT LOADED ===');



chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  log('<<< MSG RECEIVED:', JSON.stringify(request));

  if (request.action === 'toggle') {
    chrome.tabs.query({ active: true, url: 'https://meet.google.com/*' }, (tabs) => {
      if (tabs && tabs[0]) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggle',
            translating: request.translating
          });
          log('Toggle sent to Meet tab');
        } catch (e) {
          logErr('Toggle error:', e.message);
        }
      } else {
        logErr('No Meet tab found. Please open Google Meet first.');
      }
    });
    sendResponse({ success: true });
    return true;
  } else if (request.action === 'updateSettings') {
    if (request.sourceLang) settings.sourceLang = request.sourceLang;
    if (request.targetLang) settings.targetLang = request.targetLang;
    if (request.voiceType) settings.voiceType = request.voiceType;
    log('Settings updated:', settings);
    
    chrome.tabs.query({ url: 'https://meet.google.com/*' }, (tabs) => {
      for (let tab of tabs) {
        if (tab.id) {
          try {
            chrome.tabs.sendMessage(tab.id, { action: 'updateSettings', sourceLang: request.sourceLang, targetLang: request.targetLang, voiceType: request.voiceType });
          } catch (e) {
            log('Send error:', e.message);
          }
        }
      }
      log('>>> Settings forwarded to meet tabs:', tabs.length);
    });
    
    sendResponse({ ok: true });
    return true;
  }
});

log('Background ready');
