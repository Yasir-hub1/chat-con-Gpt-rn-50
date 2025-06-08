import axios from 'axios';

const API_KEY = "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";
const BASE_URL = 'https://api.openai.com/v1';

export const api = {
  async convertAudioToText(audioFile, sourceLanguage = 'es') {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', sourceLanguage); // 'es' para español o 'pt' para portugués
    
    try {
      const response = await axios.post(
        `${BASE_URL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${API_KEY}`,
          },
          
        }
      );
      return response.data.text;
    } catch (error) {
      console.error('Error en transcripción:', error);
      throw error;
    }
  },
  
  async translateText(text, sourceLang, targetLang) {
    // Validación de idiomas
    if (!['es', 'pt'].includes(sourceLang) || !['es', 'pt'].includes(targetLang)) {
      throw new Error('Los idiomas deben ser "es" (español) o "pt" (portugués)');
    }
    
    // Crear el prompt de traducción
    const prompt = `Traduce el siguiente texto de ${sourceLang === 'es' ? 'español' : 'portugués'} a ${targetLang === 'es' ? 'español' : 'portugués'}. Mantén el tono y el contexto original. No añadas información adicional. Solo responde con la traducción: 

${text}`;
    
    try {
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: 'system', content: 'Eres un traductor profesional experto entre español y portugués.' }, 
                     { role: 'user', content: prompt }],
          max_tokens: 500, // Aumentado para permitir traducciones más largas
          temperature: 0.3, // Temperatura baja para traducciones más precisas
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error en traducción:', error);
      throw error;
    }
  },
  
  // Métodos específicos para cada dirección de traducción
  async translateSpanishToPortuguese(text) {
    return this.translateText(text, 'es', 'pt');
  },
  
  async translatePortugueseToSpanish(text) {
    return this.translateText(text, 'pt', 'es');
  },
  
  // Función para detectar idioma y traducir automáticamente
  async autoTranslate(text) {
    // Prompt para detectar el idioma
    const detectionPrompt = `Identifica si el siguiente texto está en español (es) o portugués (pt). Responde solo con "es" o "pt": 
    
${text}`;
    
    try {
      // Primero detectamos el idioma
      const detectResponse = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: 'user', content: detectionPrompt }],
          max_tokens: 10,
          temperature: 0.3,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      
      const detectedLang = detectResponse.data.choices[0].message.content.trim().toLowerCase();
      
      // Definimos el idioma destino basado en la detección
      const targetLang = detectedLang === 'es' ? 'pt' : 'es';
      
      // Realizamos la traducción
      return this.translateText(text, detectedLang, targetLang);
    } catch (error) {
      console.error('Error en auto-traducción:', error);
      throw error;
    }
  },
  
  // Función para transcribir audio y traducirlo
  async transcribeAndTranslate(audioFile, sourceLang, targetLang) {
    try {
      // Primero transcribimos el audio
      const transcription = await this.convertAudioToText(audioFile, sourceLang);
      
      // Luego traducimos el texto transcrito
      const translation = await this.translateText(transcription, sourceLang, targetLang);
      
      return {
        originalText: transcription,
        translatedText: translation
      };
    } catch (error) {
      console.error('Error en transcripción y traducción:', error);
      throw error;
    }
  }
};