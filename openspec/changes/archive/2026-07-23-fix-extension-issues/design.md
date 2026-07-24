## Context

La extensión es una aplicación Chrome Manifest V3 con tres contextos de ejecución:

- **Popup**: página UI del usuario con panel de configuración embebido.
- **Background Service Worker**: proceso de extensión que gestiona mensajería y traducción.
- **Content Script**: ejecutado en cada tab de Google Meet con acceso a APIs del navegador (Speech Recognition, Speech Synthesis).

**Problema 1 — Configuración no sincronizada:**
Cada componente mantiene su propia copia de configuración en memoria. El Popup persiste en `chrome.storage.local`, pero el Service Worker y el Content Script no leen desde storage al iniciar. No hay mecanismo para propagar cambios cuando el usuario actualiza la configuración.

**Problema 2 — Traducción rota:**
El Content Script detecta el idioma del texto transcrito pero envía un valor hardcodeado al Service Worker en lugar del valor detectado. El Service Worker usa este valor para determinar si aplica el camino de traducción directa o el puente en inglés. El valor incorrecto hace que el texto se devuelva sin traducir.

**Problema 3 — Icono sin identidad:**
Los archivos PNG existentes son mínimamente funcionales y no comunican la función de traducción.

**Restricciones:**
- No modificar comportamiento funcional fuera de las correcciones.
- Mantener compatibilidad con endpoints Ollama locales y servidores remotos.
- Respetar el ciclo de vida del Service Worker (terminación tras 30s inactividad, pérdida de variables globales).

## Goals / Non-Goals

**Goals:**
- Propagación inmediata de cambios de configuración a todos los componentes.
- Corrección del pipeline de traducción para usar el idioma detectado real.
- Rediseño del icono con estética moderna.

**Non-Goals:**
- Nuevas funcionalidades.
- Cambios en el API de traducción.
- Modificación de la UI más allá de la sincronización.

## Decisions

### Decision 1: Patrón de propagación de configuración

**Elección:** `chrome.storage.local` como almacén persistente. El Popup escribe y lee desde storage. El Service Worker y el Content Script leen desde storage al iniciar y escuchan `chrome.storage.onChanged` para propagar cambios.

**Ciclo de vida del Service Worker:**
- El Service Worker de Chrome MV3 puede ser suspendido y destruido por el navegador después de un período de inactividad.
- Todo el estado mantenido únicamente en memoria se pierde cuando esto ocurre.
- La restauración del estado debe realizarse leyendo desde `chrome.storage.local` al reinicializar el Service Worker.
- Esta es la razón por la que `chrome.storage.local` constituye la única fuente de verdad para la configuración.

**Hipótesis (debe verificarse durante implementación):**
- `chrome.storage.onChanged` funciona en Content Scripts. La documentación oficial no especifica si este evento está disponible en el contexto de content script. Si no funciona, se debe usar el canal de mensajería existente (`chrome.runtime.onMessage`) como fallback.

**Rationale:**
- `chrome.storage.local` persiste entre reinicios del Service Worker, resolviendo la pérdida de configuración por terminación del proceso.
- `chrome.storage.onChanged` proporciona propagación en tiempo real sin mensajería explícita entre componentes.

**Rationale para el canal alternativo:**
- La documentación oficial de Chrome indica que `chrome.runtime.sendMessage()` **no puede** enviar mensajes a Content Scripts. Se debe usar `chrome.tabs.sendMessage()` o `chrome.tabs.connect()` para comunicar con Content Scripts.
- El Service Worker actúa como relay: recibe cambios del Popup, persiste en storage, y reenvía a todos los tabs con Content Scripts cargados mediante `chrome.tabs.query()` + `chrome.tabs.sendMessage()`.

### Decision 2: Independencia de configuración del pipeline de traducción

**Elección:** El Content Script debe enviar el idioma detectado real al Service Worker en cada petición de traducción. El Service Worker debe confiar en el valor recibido del Content Script para determinar el camino de traducción.

**Nota sobre el ciclo de vida del Service Worker:**
- El Service Worker puede ser suspendido y destruido por Chrome tras inactividad, perdiendo todo estado en memoria.
- La restauración del estado se realiza leyendo desde `chrome.storage.local` al reinicializar.
- Cada petición de traducción es independiente: el Service Worker recibe todos los parámetros necesarios en el payload y no depende de estado previo.

**Rationale:**
- El problema raíz es que el valor hardcodeado se envía en el payload del mensaje, no en el Service Worker. Corregir el payload es el cambio mínimo y más seguro.
- El Service Worker ya tiene la lógica de traducción directa y puente en inglés. No requiere cambios estructurales.

### Decision 3: Formato y tamaños del icono

**Elección:** PNG en los tamaños existentes del manifest (16, 32, 48, 128).

**Rationale:**
- El manifest MV3 usa PNG para iconos. SVG no es soportado como valor de `"icons"` en el manifest.
- Los tamaños existentes son los mínimos requeridos por Chrome.

**Hipótesis (debe validarse con diseño):**
- La forma y paleta de colores deben ser reconocibles a 16x16px. Se debe validar en los 4 tamaños.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `chrome.storage.onChanged` no disponible en Content Scripts | Fallback al canal existente `chrome.runtime.onMessage` del Service Worker. Este canal está documentado y funciona. |
| Service Worker suspendido durante traducción activa | Al reiniciar, el Service Worker restaura configuración desde `chrome.storage.local`. Las peticiones encoladas se procesan al reanudarse. |
| Múltiples tabs con Content Scripts activos | `chrome.tabs.query()` sin filtro `currentWindow` alcanza todos los tabs. El Service Worker envía `updateSettings` a cada tab. |
| Race condition: Popup guarda y Service Worker no ha cargado | `chrome.storage.local.set()` es síncrono. El listener `onChanged` del Popup se dispara inmediatamente. El Service Worker recibe `updateSettings` vía `chrome.runtime.onMessage` y actualiza su estado. |
| Icono no reconocible en tamaños pequeños | Diseñar con formas simples y alto contraste. Validar en los 4 tamaños del manifest. |

## Migration Plan

**Fase 1 — Corrección del pipeline de traducción:**
Corregir el payload de la petición de traducción en el Content Script para enviar el idioma detectado real. El Service Worker usa el valor recibido sin modificaciones.

**Fase 2 — Sincronización de configuración:**
- Popup: persistir en `chrome.storage.local` y escuchar `chrome.storage.onChanged` para actualizar UI.
- Service Worker: leer desde `chrome.storage.local` al iniciar y escuchar `chrome.storage.onChanged`.
- Content Script: leer desde `chrome.storage.local` al iniciar. Escuchar `chrome.storage.onChanged` si está disponible, o usar el canal existente `chrome.runtime.onMessage` del Service Worker como alternativa.
- Service Worker: reenviar `updateSettings` a todos los tabs con Content Scripts cargados.

**Fase 3 — Rediseño del icono:**
Generar PNGs en los tamaños del manifest con la nueva identidad visual.

## Open Questions

1. ¿Se requiere soportar múltiples ventanas del navegador con configuraciones diferentes?
2. ¿Debe el Popup mostrar feedback visual al guardar?