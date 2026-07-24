# Google Meet Voice Translator

Un plugin de Google Chrome que traduce la voz de participantes en Google Meet a un idioma específico, utilizando un servidor local Ollama.

## Requisitos

- Google Chrome
- Ollama instalado y corriendo en `192.168.1.121`
- Modelo Whisper disponible en Ollama: `ollama pull whisper`

## Instalación

1. Clona el repositorio o descarga los archivos
2. Abre Chrome y ve a `chrome://extensions/`
3. Habilita "Modo desarrollador" (toggle en la parte superior)
4. Haz clic en "Cargar descomprimido"
5. Selecciona la carpeta `chrome-extension-meet-translate`

## Uso

1. Abre Google Meet
2. Haz clic en el icono del plugin
3. Selecciona el idioma objetivo
4. Selecciona el modelo Ollama (whisper recomendado)
5. Haz clic en "Iniciar Traducción"
6. Permite la captura de audio del tab
7. La traducción aparecerá como un overlay en la parte inferior de la pantalla

## Configuración

- **Modelo Ollama**: whisper, whisper-large-v3, whisper-small
- **Idiomas disponibles**: Español, Inglés, Francés, Alemán, Italiano, Portugués, Japonés, Chino, Coreano, Ruso, Árabe

## Funcionalidad

- Captura audio del tab de Google Meet
- Envía el audio a Ollama para transcripción usando Whisper
- Traduce el texto transcrito al idioma seleccionado
- Muestra la traducción como un overlay en la pantalla

## Notas

- Asegúrate de que Ollama esté corriendo en `192.168.1.121`
- El modelo Whisper debe estar disponible en tu servidor Ollama
- La traducción requiere conexión estable con el servidor Ollama
