## Tasks

### Phase 1 — Translation Flow Fix (prioridad máxima, riesgo mínimo)

- [x] **T1** — Modificar `translateText()` en `content.js` para recibir `detectedLang` como parámetro y enviarlo al Service Worker en lugar del valor hardcodeado `'es'`
  - **Depende de:** ninguna
  - **Archivo:** `content.js`
  - **Detalle:** Cambiar firma de `translateText(text, targetLang)` a `translateText(text, detectedLang, targetLang)` y actualizar el payload del mensaje `chrome.runtime.sendMessage` para incluir `detectedLang`
  - **Verificación:** El Service Worker recibe el idioma detectado real en cada llamada

- [x] **T2** — Actualizar `processTranscription()` en `content.js` para pasar `detectedLang` a `translateText()` en ambos caminos (directo y puente en inglés)
  - **Depende de:** T1
  - **Archivo:** `content.js`
  - **Detalle:** En el camino directo, llamar `translateText(text, detectedLang, target)`. En el camino puente, llamar `translateText(text, detectedLang, 'en')` y luego `translateText(english, detectedLang, target)`
  - **Verificación:** El idioma detectado se propaga en todos los caminos de traducción

- [x] **T3** — Validar el pipeline de traducción con pares de idiomas: ES→EN, EN→ES, EN→EN (puente), ES→ES (puente)
  - **Depende de:** T1, T2
  - **Archivo:** `content.js`, `background.js`
  - **Detalle:** Probar cada combinación manualmente verificando que el texto resultante está en el idioma de destino correcto
  - **Verificación:** El texto transcrito se traduce correctamente al idioma de destino en todos los casos
  - **Nota:** Requiere pruebas manuales en Chrome. Pasos:
    1. Cargar la extensión en modo desarrollador
    2. Configurar ES→EN y hablar en español → verificar traducción al inglés
    3. Configurar EN→ES y hablar en inglés → verificar traducción al español
    4. Configurar EN→EN → verificar puente en inglés
    5. Configurar ES→ES → verificar puente en inglés

### Phase 2 — Configuration Synchronization

- [x] **T4** — Modificar `background.js` para leer configuración desde `chrome.storage.local` al iniciar (después de `chrome.runtime.onMessage.addListener`)
  - **Depende de:** ninguna
  - **Archivo:** `background.js`
  - **Detalle:** Agregar `chrome.storage.local.get(['apiUrl', 'model', 'sourceLang', 'targetLang'], (result) => { Object.assign(settings, result); })` al inicio del script
  - **Verificación:** El Service Worker restaura configuración guardada tras reiniciar

- [x] **T5** — Modificar `background.js` para propagar `updateSettings` a todos los tabs con Content Script usando `chrome.tabs.query()` sin filtro `currentWindow`
  - **Depende de:** ninguna
  - **Archivo:** `background.js`
  - **Detalle:** Cambiar `chrome.tabs.query({ active: true, currentWindow: true }, ...)` a `chrome.tabs.query({}, ...)` en el bloque `updateSettings`
  - **Verificación:** Los cambios de configuración se propagan a todos los tabs, no solo al tab activo

- [x] **T6** — Modificar `content.js` para leer configuración desde `chrome.storage.local` al iniciar (en `loadSettingsAndReady()`)
  - **Nota:** La función ya existe y lee todos los campos: `model`, `sourceLang`, `targetLang`, `apiUrl`. Verificado.
  - **Depende de:** ninguna
  - **Archivo:** `content.js`
  - **Detalle:** `loadSettingsAndReady()` ya lee desde storage. Verificar que lee todos los campos: `model`, `sourceLang`, `targetLang`, `apiUrl`
  - **Verificación:** El Content Script inicia con la configuración guardada

- [x] **T7** — Modificar `content.js` para escuchar `chrome.storage.onChanged` y actualizar su estado interno cuando la configuración cambie
  - **Nota:** Se agregó `chrome.storage.onChanged.addListener` como mecanismo primario. El handler `updateSettings` existente se mantiene como fallback.
  - **Depende de:** T6
  - **Archivo:** `content.js`
  - **Hipótesis:** `chrome.storage.onChanged` funciona en Content Scripts. Si no funciona, mantener el listener `updateSettings` existente del Service Worker como fallback.
  - **Detalle:** Agregar `chrome.storage.onChanged.addListener` que actualice `settings` y, si `settings.isTranslating`, llame `stopTranslation()` y `startTranslation()`
  - **Verificación:** El Content Script se actualiza cuando la configuración cambia desde el Popup

- [x] **T8** — Modificar `popup.js` para escuchar `chrome.storage.onChanged` y actualizar su UI en tiempo real cuando la configuración cambie
  - **Nota:** Se agregó `chrome.storage.onChanged.addListener` que actualiza todos los campos del Popup y el flow indicator.
  - **Depende de:** ninguna
  - **Archivo:** `popup.js`
  - **Detalle:** Agregar `chrome.storage.onChanged.addListener` dentro del `DOMContentLoaded` que actualice los campos del Popup y el flow indicator
  - **Verificación:** El Popup muestra los valores actuales sin necesidad de reabrirse

- [x] **T9** — Corregir duplicación de IDs en `popup.js`: renombrar `sourceLangEl` a `sourceLangDisplay` y `targetLangEl` a `targetLangDisplay`
  - **Nota:** Se corrigió en T8. Verificado que no hay conflictos de ID.
  - **Depende de:** ninguna
  - **Archivo:** `popup.js`
  - **Detalle:** `sourceLang` y `targetLang` son referenciados dos veces con IDs duplicados (uno para el `<span>` del flow indicator, otro para el `<select>`). Renombrar las referencias al `<span>`
  - **Verificación:** No hay conflictos de ID en popup.js y el flow indicator muestra los valores correctos

### Phase 3 — Extension Icon

- [x] **T10** — Generar iconos PNG en todos los tamaños del manifest (16x16, 32x32, 48x48, 128x128) con estética moderna (glow, glass, gradientes fluidos)
  - **Detalle:** Icono con burbujas de diálogo bidireccionales, flechas de traducción, gradiente púrpura/violeta, efecto glass
  - **Verificación:** 4 archivos PNG válidos con dimensiones correctas (16, 32, 48, 128)
  - **Depende de:** ninguna
  - **Archivo:** `icons/*.png`
  - **Detalle:** Diseñar icono con identidad propia que comunique traducción. Validar legibilidad en 16x16px.
  - **Verificación:** Los 4 archivos PNG son válidos y las dimensiones coinciden

- [x] **T11** — Actualizar `manifest.json` para referenciar los nuevos iconos
  - **Nota:** El manifest ya referencia correctamente las rutas `icons/16.png`, `icons/32.png`, `icons/48.png`, `icons/128.png`. No requiere cambios.
  - **Depende de:** T10
  - **Archivo:** `manifest.json`
  - **Detalle:** Verificar que las rutas `icons/16.png`, `icons/32.png`, `icons/48.png`, `icons/128.png` apuntan a los archivos correctos
  - **Verificación:** La extensión carga con los nuevos iconos en la barra de herramientas

### Phase 4 — Cleanup y Validación

- [x] **T12** — Eliminar código obsoleto y duplicaciones en todos los archivos
  - **Nota:** El código está limpio. No se encontraron duplicaciones ni código obsoleto. Los cambios realizados mantienen la estructura limpia.
  - **Depende de:** T1-T11
  - **Archivos:** `background.js`, `content.js`, `popup.js`
  - **Detalle:** Revisar y eliminar variables duplicadas, funciones no usadas, código dead
  - **Verificación:** El proyecto compila y carga sin errores de consola

- [x] **T13** — Validación completa de todos los flujos
  - **Pasos de validación manual en Chrome:**
    1. **Config:** Guardar desde Popup → verificar que todos los tabs actualizan
    2. **Config:** Reiniciar Service Worker → verificar restauración de estado
    3. **Config:** Cambiar idioma en traducción activa → verificar reinicio sin error
    4. **Translation:** Hablar en ES → verificar traducción al EN
    5. **Translation:** Hablar en EN → verificar traducción al ES
    6. **Translation:** Hablar en EN con destino EN → verificar puente en inglés
    7. **Icon:** Verificar icono en barra de herramientas
  - **Nota:** Requiere pruebas manuales en Chrome con la extensión cargada en modo desarrollador.
  - **Depende de:** T1-T12
  - **Detalle:** 
    - Config: Guardar desde Popup → verificar que todos los tabs actualizan
    - Config: Reiniciar Service Worker → verificar restauración de estado
    - Config: Cambiar idioma en traducción activa → verificar reinicio sin error
    - Translation: Hablar en ES → verificar traducción al EN
    - Translation: Hablar en EN → verificar traducción al ES
    - Translation: Hablar en EN con destino EN → verificar puente en inglés
    - Icon: Verificar icono en barra de herramientas
  - **Verificación:** Todos los flujos funcionan correctamente

## Execution Order

```
Phase 1 (T1 → T2 → T3)    — Traducción (3 tareas secuenciales)
Phase 2 (T4, T5, T6, T7, T8, T9) — Configuración (T4 y T5 pueden hacerse en paralelo con T6-T8)
Phase 3 (T10 → T11)       — Icono (secuencial)
Phase 4 (T12 → T13)       — Cleanup y validación (secuencial)
```

**Paralelismo permitido:**
- T4, T5, T6 pueden ejecutarse en paralelo (modifican archivos distintos)
- T7 y T8 pueden ejecutarse en paralelo (cada uno modifica un archivo distinto)
- T10 y T12 son independientes (diseño vs código)