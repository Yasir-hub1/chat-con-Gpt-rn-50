import axios from 'axios';

const API_KEY = "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";
const BASE_URL = 'https://api.openai.com/v1';

export const api = {
  async convertAudioToText(audioFile) {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

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

  async getChatGPTResponse(text) {
    try {
      const response = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: 'user', content: text }],
          max_tokens: 100,
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
      console.error('Error en respuesta GPT:', error);
      throw error;
    }
  }
};