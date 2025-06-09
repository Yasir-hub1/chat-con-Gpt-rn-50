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

  const playAssistantResponse = async (text, messageId) => {
    try {
      // Si es el mismo mensaje del asistente, maneja la pausa
      if (currentPlayingId === messageId) {
        if (isGPTSpeaking) {
          await Speech.stop();
          setIsGPTSpeaking(false);
          setIsPaused(true);
          setLastPlayedText(text);
        } else if (isPaused) {
          Speech.speak(lastPlayedText, {
            language: 'es-ES',
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

      // Inicia la nueva reproducción
      setLastPlayedText(text);
      setIsGPTSpeaking(true);
      setCurrentPlayingId(messageId);
      setIsPaused(false);

      Speech.speak(text, {
        language: 'es-ES',
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
      console.error('Error playing assistant response:', error);
      await stopCurrentAudio();
    }
  };

  const playAudio = async (message) => {
    if (message.type === 'user') {
      await playUserAudio(message.audioUri, message.id);
    } else {
      await playAssistantResponse(message.audioUri || message.content, message.id);
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