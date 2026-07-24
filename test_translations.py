#!/usr/bin/env python3
import subprocess
import json
import time

# Subconjunto representativo
TEXTS = [
    "Hola, ¿cómo estás?",
    "El reporte está listo para revisión.",
    "¿Podrías repetir eso, por favor?"
]

LANGS = {
    "it": "Italiano",
    "fr": "Français",
    "de": "Deutsch"
}

SYSTEM_PROMPT = """TRANSLATION TASK - FOLLOW THESE RULES STRICTLY:

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

6. TARGET LANGUAGE: {lang}

Now translate the following text to {lang}:"""

def translate(text, lang):
    prompt = SYSTEM_PROMPT.format(lang=lang.upper())
    payload = {
        "model": "qwen3:1.7b",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": text}
        ],
        "stream": False
    }
    
    result = subprocess.run(
        ["curl", "-s", "-X", "POST", "http://localhost:11434/api/chat",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(payload)],
        capture_output=True, text=True, timeout=30
    )
    
    try:
        data = json.loads(result.stdout)
        return data["message"]["content"]
    except:
        return f"ERROR: {result.stdout[:100]}"

print("=" * 80)
print("PRUEBAS DE TRADUCCIÓN — qwen3:1.7b (subconjunto)")
print("=" * 80)

errors = []
success = []

for i, text in enumerate(TEXTS, 1):
    print(f"\n--- Texto {i}: '{text}' ---")
    for lang_code, lang_name in LANGS.items():
        try:
            translation = translate(text, lang_code)
            # Limpiar thinking tags
            cleaned = translation.replace("<thinking>", "").replace("</thinking>", "").strip()
            
            # Verificar errores comunes
            is_error = False
            error_reason = ""
            
            if "ERROR" in cleaned:
                is_error = True
                error_reason = "Error de conexión/API"
            elif cleaned.lower().startswith(("i'm ", "i am ", "hello ", "hi ", "yes, ", "no, ")):
                if lang_code not in ["en"]:
                    is_error = True
                    error_reason = "Posible respuesta en inglés"
            elif len(cleaned) < 2:
                is_error = True
                error_reason = "Traducción demasiado corta"
            elif "thinking" in cleaned.lower():
                is_error = True
                error_reason = "Incluye thinking tags"
            
            if is_error:
                errors.append({
                    "text": text,
                    "lang": lang_name,
                    "lang_code": lang_code,
                    "translation": cleaned,
                    "error": error_reason
                })
                print(f"  ❌ {lang_name:12} → '{cleaned}' [{error_reason}]")
            else:
                success.append({
                    "text": text,
                    "lang": lang_name,
                    "translation": cleaned
                })
                print(f"  ✅ {lang_name:12} → '{cleaned}'")
        except subprocess.TimeoutExpired:
            errors.append({
                "text": text,
                "lang": lang_name,
                "translation": "N/A",
                "error": "Timeout"
            })
            print(f"  ❌ {lang_name:12} → TIMEOUT")
        except Exception as e:
            errors.append({
                "text": text,
                "lang": lang_name,
                "error": str(e)
            })
            print(f"  ❌ {lang_name:12} → ERROR: {e}")
        time.sleep(1)

print("\n" + "=" * 80)
print(f"RESULTADOS: {len(success)} exitosas, {len(errors)} con errores")
print("=" * 80)

if errors:
    print("\nERRORES DETECTADOS:")
    for err in errors:
        print(f"  • '{err['text']}' → {err['lang']}: '{err['translation']}' [{err['error']}]")
