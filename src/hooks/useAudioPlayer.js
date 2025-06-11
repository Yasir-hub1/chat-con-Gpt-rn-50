import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export const useAudioPlayer = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGPTSpeaking, setIsGPTSpeaking] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastPlayedText, setLastPlayedText] = useState('');

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (isGPTSpeaking) {
        Speech.stop();
      }
    };
  }, [sound]);

  const stopCurrentAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      if (isGPTSpeaking) {
        await Speech.stop();
        setIsGPTSpeaking(false);
      }
      setIsPlaying(false);
      setCurrentPlayingId(null);
      setIsPaused(false);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      setCurrentPlayingId(null);
      setIsPaused(false);
    }
  };

  const playUserAudio = async (uri, messageId) => {
    try {
      // Si es el mismo audio que está sonando, maneja la pausa
      if (currentPlayingId === messageId && sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          setIsPaused(true);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
          setIsPaused(false);
        }
        return;
      }

      // Si hay otro audio reproduciéndose, detenlo
      await stopCurrentAudio();

      // Crea y carga el nuevo sonido
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        handlePlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setCurrentPlayingId(messageId);
      setIsPaused(false);
    } catch (error) {
      console.error('Error playing user audio:', error);
      await stopCurrentAudio();
    }
  };

  const playGPTResponse = async (text, messageId, message = null) => {
    try {
      // Si es el mismo mensaje GPT, maneja la pausa
      if (currentPlayingId === messageId) {
        if (isGPTSpeaking) {
          await Speech.stop();
          setIsGPTSpeaking(false);
          setIsPaused(true);
          setLastPlayedText(text);
        } else if (isPaused) {
          // Determinar el idioma para la reproducción
          const language = getLanguageForSpeech(message);
          
          Speech.speak(lastPlayedText, {
            language: language,
            onDone: () => {
              setIsGPTSpeaking(false);
              setCurrentPlayingId(null);
              setIsPaused(false);
            },
          });
          setIsGPTSpeaking(true);
          setIsPaused(false);
        }
        return;
      }

      // Si hay otro audio reproduciéndose, detenlo
      await stopCurrentAudio();

      // Determinar el idioma para la reproducción
      const language = getLanguageForSpeech(message);

      // Inicia la nueva reproducción
      setLastPlayedText(text);
      setIsGPTSpeaking(true);
      setCurrentPlayingId(messageId);
      setIsPaused(false);

      Speech.speak(text, {
        language: language,
        onDone: () => {
          setIsGPTSpeaking(false);
          setCurrentPlayingId(null);
          setIsPaused(false);
        },
        onError: () => {
          setIsGPTSpeaking(false);
          setCurrentPlayingId(null);
          setIsPaused(false);
        },
      });
    } catch (error) {
      console.error('Error playing GPT response:', error);
      await stopCurrentAudio();
    }
  };

  // Función para determinar el idioma de la síntesis de voz
  const getLanguageForSpeech = (message) => {
    // Si es una traducción, usar el idioma de destino
    if (message && message.messageType === 'translation' && message.targetLang) {
      return message.targetLang === 'pt' ? 'pt-BR' : 'es-ES';
    }
    
    // Por defecto, usar español
    return 'es-ES';
  };

  const playAudio = async (message) => {
    if (message.type === 'user') {
      await playUserAudio(message.audioUri, message.id);
    } else {
      // Pasar el mensaje completo para determinar el idioma
      await playGPTResponse(message.audioUri || message.content, message.id, message);
    }
  };

  return {
    playAudio,
    isPlaying,
    isGPTSpeaking,
    currentPlayingId,
    stopCurrentAudio,
    isPaused,
  };
};