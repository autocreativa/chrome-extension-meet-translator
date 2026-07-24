## Why

La extensión de Chrome presenta tres problemas funcionales que impiden su correcto uso:

1. **Configuración inconsistente:** Cuando el usuario modifica el idioma de origen o destino desde el panel de Configuración dentro del Popup, los cambios no se reflejan en el flujo de traducción activo. El Content Script no recibe actualizaciones y el Popup no muestra el estado actualizado al reabrirse, generando confusión en el usuario.

2. **Traducción rota:** Cuando el usuario inicia la traducción y habla en un idioma, el texto reconocido se muestra en el idioma original en lugar de traducirse al idioma de destino configurado. El usuario percibe la extensión como no funcional ya que el resultado es idéntico a la entrada.

3. **Icono sin identidad:** El icono actual no transmite la función de traducción y no refleja una apariencia profesional o moderna, dificultando su reconocimiento en la barra de herramientas de Chrome.

## What Changes

- Corregir la sincronización de configuración entre Popup, Background y Content Script para que los cambios se propaguen inmediatamente a todos los componentes.
- Garantizar que el Popup muestre siempre los idiomas de origen y destino actuales, incluso al reabrirse después de cerrar.
- Corregir el flujo de traducción para que el texto reconocido se traduzca siempre al idioma de destino configurado.
- Revisar el flujo completo desde reconocimiento de voz hasta síntesis de voz para asegurar que siempre se utilizan correctamente los idiomas configurados.
- Rediseñar el icono con estética moderna (glow suave, estilo glass, gradientes fluidos) que comunique la función de traducción.
- Eliminar duplicaciones y mejoras de mantenibilidad detectadas en el análisis.

## Capabilities

### Modified Capabilities

- configuration-sync: Sincronización de configuración entre Popup, Background y Content Script usando `chrome.storage` como fuente de verdad con propagación de cambios en tiempo real.
- translation-flow: Corrección del pipeline de traducción para usar el idioma de origen detectado y el idioma de destino configurado correctamente.
- extension-icon: Rediseño del icono de la barra de herramientas con identidad visual moderna y reconocible.

## Impact

Se espera modificar:

- `popup.html` / `popup.js` — Popup UI y lógica
- `background.js` — Service Worker y mensajería
- `content.js` — Content Script y flujo de traducción
- `manifest.json` — Iconos y tamaños
- `icons/` — Recursos gráficos

No se modifica el comportamiento funcional fuera de las correcciones descritas.