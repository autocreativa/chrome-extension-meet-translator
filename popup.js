document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const statusDetail = document.getElementById('statusDetail');
  const settingsBtn = document.getElementById('settingsBtn');
  const configPanel = document.getElementById('configPanel');
  const mainPanel = document.getElementById('mainPanel');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const miniIndicator = document.getElementById('miniIndicator');
  const sourceLangDisplay = document.getElementById('sourceLangDisplay');
  const targetLangDisplay = document.getElementById('targetLangDisplay');
  
  const sourceLangSelect = document.getElementById('sourceLang');
  const targetLangSelect = document.getElementById('targetLang');
  const voiceTypeSelect = document.getElementById('voiceType');
  
  const langNames = {
    'es': 'Español',
    'en': 'English',
    'fr': 'Français',
    'de': 'Deutsch',
    'pt': 'Português',
    'it': 'Italiano',
    'zh': '中文',
    'ja': '日本語',
    'ru': 'Русский',
    'auto': 'Auto-detectado'
  };
  
  let isTranslating = false;

  toggleBtn.addEventListener('click', () => {
    isTranslating = !isTranslating;
    
    if (isTranslating) {
      toggleBtn.textContent = 'Detener Traducción';
      toggleBtn.classList.add('active');
      statusIcon.className = 'status-icon active';
      statusIcon.textContent = '🎙️';
      statusText.textContent = 'Traduciendo...';
      statusDetail.textContent = 'Escuchando y traduciendo en tiempo real';
      miniIndicator.classList.remove('hidden');
      
      chrome.tabs.query({ active: true, url: 'https://meet.google.com/*' }, (tabs) => {
        if (tabs && tabs[0]) {
          chrome.runtime.sendMessage({ action: 'toggle', translating: true });
        } else {
          statusText.textContent = 'Error';
          statusDetail.textContent = 'Abre Google Meet primero';
          statusIcon.textContent = '⚠️';
          isTranslating = false;
          toggleBtn.textContent = 'Iniciar Traducción';
          toggleBtn.classList.remove('active');
          miniIndicator.classList.add('hidden');
        }
      });
    } else {
      toggleBtn.textContent = 'Iniciar Traducción';
      toggleBtn.classList.remove('active');
      statusIcon.className = 'status-icon idle';
      statusIcon.textContent = '⏸️';
      statusText.textContent = 'Listo para traducir';
      statusDetail.textContent = 'Abre Google Meet primero';
      miniIndicator.classList.add('hidden');
      chrome.runtime.sendMessage({ action: 'toggle', translating: false });
    }
  });

  settingsBtn.addEventListener('click', () => {
    configPanel.classList.add('visible');
    mainPanel.style.display = 'none';
  });

  cancelBtn.addEventListener('click', () => {
    configPanel.classList.remove('visible');
    mainPanel.style.display = 'flex';
  });

  saveBtn.addEventListener('click', () => {
    const currentSettings = {
      sourceLang: sourceLangSelect.value || 'es',
      targetLang: targetLangSelect.value || 'en',
      voiceType: voiceTypeSelect.value || 'auto'
    };
    
    console.log('[Popup] Saving settings:', currentSettings);
    
    const messageSettings = {
      action: 'updateSettings',
      ...currentSettings
    };
    
    chrome.runtime.sendMessage(messageSettings, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Popup] Message error:', chrome.runtime.lastError);
      } else {
        console.log('[Popup] Message sent successfully');
      }
    });
    
    chrome.storage.local.set(currentSettings, () => {
      console.log('[Popup] Storage saved');
      updateFlowIndicator();
      configPanel.classList.remove('visible');
      mainPanel.style.display = 'flex';
    });
  });

  function updateFlowIndicator() {
    sourceLangDisplay.textContent = langNames[sourceLangSelect.value] || sourceLangSelect.value || 'Auto-detectado';
    targetLangDisplay.textContent = langNames[targetLangSelect.value] || targetLangSelect.value || 'English';
  }

  chrome.storage.local.get(['sourceLang', 'targetLang', 'voiceType'], (result) => {
    if (result.sourceLang) sourceLangSelect.value = result.sourceLang;
    if (result.targetLang) targetLangSelect.value = result.targetLang;
    if (result.voiceType) voiceTypeSelect.value = result.voiceType;
    
    updateFlowIndicator();
  });
  
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      for (let [key, { newValue }] of Object.entries(changes)) {
        if (newValue !== undefined) {
          if (key === 'sourceLang') sourceLangSelect.value = newValue;
          if (key === 'targetLang') targetLangSelect.value = newValue;
          if (key === 'voiceType') voiceTypeSelect.value = newValue;
        }
      }
      updateFlowIndicator();
    }
  });
});
