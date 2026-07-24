# config-sync Specification

## Purpose
TBD - created by archiving change fix-extension-issues. Update Purpose after archive.
## Requirements
### Requirement: Configuration persistence on startup

El sistema SHALL persistir todas las configuraciones del usuario en almacenamiento persistente del navegador. Cada componente del extension (Popup, Service Worker, Content Script) DEBE leer la configuración desde almacenamiento al iniciar su contexto.

#### Scenario: Popup reads configuration on load
- **WHEN** el Popup se abre por primera vez o se reabre después de cerrarse
- **THEN** los campos de idioma de origen, idioma de destino, URL del API y modelo reflejan los valores guardados previamente

#### Scenario: Service Worker reads configuration on startup
- **WHEN** el Service Worker se inicia (incluyendo tras ser suspendido y reanudado)
- **THEN** su estado interno de configuración se restaura desde almacenamiento persistente

#### Scenario: Content Script reads configuration on load
- **WHEN** el Content Script se inyecta en un tab de Google Meet
- **THEN** su estado interno de configuración se restaura desde almacenamiento persistente

### Requirement: Configuration propagation to all components

El sistema SHALL propagar cambios de configuración a todos los componentes activos inmediatamente después de que el usuario los guarde.

#### Scenario: User saves configuration from Popup
- **WHEN** el usuario modifica idioma de origen, idioma de destino o URL del API y presiona "Guardar"
- **THEN** el almacenamiento persistente se actualiza y los cambios se propagan al Service Worker y a todos los Content Scripts activos

#### Scenario: Configuration propagates to active translation session
- **WHEN** el usuario modifica la configuración mientras la traducción está activa
- **THEN** el Content Script reanicia su reconocimiento de voz con los nuevos parámetros de idioma sin interrumpir la sesión

#### Scenario: Configuration propagates to all tabs
- **WHEN** el usuario modifica la configuración desde un tab
- **THEN** todos los tabs con Content Script cargado reciben los nuevos valores de configuración

### Requirement: Single source of truth

El sistema SHALL mantener una única fuente de verdad para la configuración. No debe existir estado en memoria que contradiga el almacenamiento persistente.

#### Scenario: Popup displays current configuration
- **WHEN** el usuario abre el Popup en cualquier momento
- **THEN** los campos muestran los valores actuales del almacenamiento persistente, no valores en memoria desactualizados

#### Scenario: Configuration is consistent across components
- **WHEN** el Service Worker y el Content Script tienen configuraciones activas
- **THEN** sus valores coinciden con los del almacenamiento persistente en todo momento

#### Scenario: No stale state after service worker restart
- **WHEN** el Service Worker es suspendido y reanudado
- **THEN** su configuración restaurada desde almacenamiento coincide con la última configuración guardada

### Requirement: Configuration UI feedback

El sistema SHALL proporcionar retroalimentación visual al usuario cuando se guarda la configuración.

#### Scenario: Save operation completes successfully
- **WHEN** el usuario presiona "Guardar" y la configuración se persistió correctamente
- **THEN** el sistema muestra un indicador visual de confirmación y cierra el panel de configuración

#### Scenario: Save operation fails
- **WHEN** el usuario presiona "Guardar" pero el almacenamiento falla
- **THEN** el sistema muestra un mensaje de error al usuario

