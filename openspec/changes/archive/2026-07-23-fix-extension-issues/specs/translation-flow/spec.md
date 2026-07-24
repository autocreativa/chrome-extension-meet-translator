## ADDED Requirements

### Requirement: Correct language detection forwarding

El sistema SHALL enviar el idioma detectado real del texto transcrito al Service Worker en cada petición de traducción. No debe existir valor hardcodeado para el idioma de origen.

#### Scenario: Translation from Spanish to English
- **WHEN** el usuario habla en español y el idioma de destino es inglés
- **THEN** el Content Script envía el idioma detectado ('es') al Service Worker junto con el texto transcrito
- **THEN** el Service Worker traduce el texto al inglés y devuelve el resultado

#### Scenario: Translation from English to Spanish
- **WHEN** el usuario habla en inglés y el idioma de destino es español
- **THEN** el Content Script envía el idioma detectado ('en') al Service Worker junto con el texto transcrito
- **THEN** el Service Worker traduce el texto al español y devuelve el resultado

#### Scenario: Translation to same language (English bridge)
- **WHEN** el idioma detectado es igual al idioma de destino configurado
- **THEN** el sistema aplica el camino de traducción puente en inglés (traduce texto a inglés, luego de inglés a destino)
- **THEN** el Service Worker recibe el idioma detectado real para determinar el camino correcto

### Requirement: Translation pipeline integrity

El sistema SHALL garantizar que el flujo completo desde reconocimiento de voz hasta síntesis de voz procese correctamente el texto traducido.

#### Scenario: Complete translation flow
- **WHEN** el usuario inicia traducción y habla en el idioma de origen
- **THEN** el Speech Recognition captura el texto transcrito
- **THEN** el sistema detecta el idioma del texto transcrito
- **THEN** el sistema envía el texto y el idioma detectado al Service Worker
- **THEN** el Service Worker devuelve el texto traducido al idioma de destino
- **THEN** el sistema muestra la traducción en pantalla
- **THEN** el sistema reproduce la traducción con síntesis de voz en el idioma de destino

#### Scenario: Translation result displayed to user
- **WHEN** el Service Worker devuelve el texto traducido
- **THEN** el texto se muestra en un overlay visible durante 5 segundos
- **THEN** el texto se reproduce con síntesis de voz en el idioma de destino configurado

#### Scenario: Translation fails gracefully
- **WHEN** el Service Worker no puede traducir el texto (API error)
- **THEN** el sistema devuelve el texto original sin traducir
- **THEN** el sistema muestra el texto original al usuario

### Requirement: Language parameter propagation

El sistema SHALL garantizar que los parámetros de idioma lleguen correctamente al Service Worker y se usen para generar la petición de traducción.

#### Scenario: Service Worker receives correct parameters
- **WHEN** el Content Script envía una petición de traducción
- **THEN** el Service Worker recibe el texto, el idioma de origen detectado, el idioma de destino configurado, el modelo y la URL del API
- **THEN** el Service Worker genera la petición al API de traducción con los parámetros correctos

#### Scenario: English bridge uses correct source language
- **WHEN** el idioma detectado es igual al idioma de destino
- **THEN** el Service Worker traduce el texto original a inglés primero
- **THEN** el Service Worker traduce el resultado en inglés al idioma de destino
- **THEN** el idioma de destino se usa correctamente en ambos pasos del puente

## Success Cases

- Traducción correcta de español a inglés
- Traducción correcta de inglés a español
- Traducción correcta de español a español (puente en inglés)
- Traducción correcta de inglés a inglés (puente en inglés)
- Visualización del resultado al usuario
- Síntesis de voz en el idioma de destino

## Edge Cases

- Texto transcrito en idioma no soportado
- API de traducción no disponible
- Texto transcrito vacío
- Idioma detectado no coincide con ningún patrón
- Service Worker suspendido durante petición de traducción

## Acceptance Criteria

1. El idioma detectado se envía al Service Worker en cada petición, nunca hardcodeado
2. El Service Worker usa el idioma de destino configurado para generar la petición
3. El camino de traducción puente en inglés se activa solo cuando el idioma detectado == idioma de destino
4. El resultado de traducción se muestra al usuario en el idioma de destino
5. La síntesis de voz usa el idioma de destino configurado
6. Si la traducción falla, se muestra el texto original sin error al usuario
