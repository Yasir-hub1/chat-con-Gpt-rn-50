import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, StatusBar, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { MessageBubble } from './src/components.js/MessageBubble';
import { RecordButton } from './src/components.js/RecordButton';
import { useAudioRecorder } from './src/hooks/useAudioRecorder';
import { useAudioPlayer } from './src/hooks/useAudioPlayer';
import { api } from './src/services/api';
import { COLORS } from './src/Constants';
import { Header } from './src/components.js/Header';
import EmptyState from './src/components.js/EmptyState';
import { LoadingIndicator } from './src/components.js/LoadingIndicator';
import { ChatInput } from './src/components.js/ChatInput';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [currentGPTText, setCurrentGPTText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { recording, recordingStatus, startRecording, stopRecording } = useAudioRecorder();
  const { 
    playAudio, 
    isPlaying, 
    isGPTSpeaking, 
    currentPlayingId, 
    stopCurrentAudio,
    isPaused 
  } = useAudioPlayer();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error guardando mensajes:', error);
    }
  };

  const handleRecordPress = async () => {
    if (recording) {
      const audioUri = await stopRecording();
      if (audioUri) {
        await processUserMessage(audioUri);
      }
    } else {
      await startRecording();
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      Alert.alert(
        'Error',
        'No se pudo iniciar la grabación. Por favor, intenta de nuevo.'
      );
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioUri = await stopRecording();
      console.log('Audio URI obtenido:', audioUri); // Debug
      if (audioUri) {
        await processUserMessage(audioUri);
      }
    } catch (error) {
      console.error('Error al detener la grabación:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al procesar la grabación. Por favor, intenta de nuevo.'
      );
    }
  };

  const processUserMessage = async (audioUri) => {
    console.log('Procesando mensaje de audio:', audioUri); // Debug
    setIsProcessing(true);
    try {
      // Mensaje de audio del usuario
      const userMessage = {
        id: Date.now().toString(),
        audioUri,
        timestamp: new Date().toLocaleString(),
        type: 'user',
        messageType: 'audio'
      };
      
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      await saveMessages(newMessages);

      // Convertir audio a texto
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a'
      };

      // Añadir un pequeño delay para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Convirtiendo audio a texto...'); // Debug
      const text = await api.convertAudioToText(audioFile);
      console.log('Texto convertido:', text); // Debug

      // Obtener respuesta de GPT
      console.log('Obteniendo respuesta de GPT...'); // Debug
      const gptResponse = await api.getChatGPTResponse(text);
      console.log('Respuesta de GPT:', gptResponse); // Debug

      // Mensaje de GPT
      const gptMessage = {
        id: Date.now().toString(),
        content: gptResponse,
        audioUri: gptResponse,
        timestamp: new Date().toLocaleString(),
        type: 'gpt',
        messageType: 'text'
      };

      const updatedMessages = [...newMessages, gptMessage];
      setMessages(updatedMessages);
      await saveMessages(updatedMessages);

    } catch (error) {
      console.error('Error procesando mensaje de audio:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al procesar tu mensaje de audio. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar tiempo de grabación
  useEffect(() => {
    if (recordingStatus === 'recording') {
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    } else {
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingStatus]);

  const handleLongPressMessage = (message) => {
    Alert.alert(
      'Opciones',
      '¿Qué deseas hacer con este mensaje?',
      [
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteMessage(message.id),
        },
        {
          text: 'Repetir',
          onPress: () => replayMessage(message),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const deleteMessage = async (messageId) => {
    const newMessages = messages.filter(m => m.id !== messageId);
    setMessages(newMessages);
    await saveMessages(newMessages);
  };

  const replayMessage = async (message) => {
    if (message.type === 'user') {
      await processUserMessage(message.audioUri, true);
    }
  };
  const handleSendText = async (text) => {
    setIsProcessing(true);
    try {
      // Mensaje del usuario
      const userMessage = {
        id: Date.now().toString(),
        content: text,
        timestamp: new Date().toLocaleString(),
        type: 'user',
        messageType: 'text'
      };
      
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      await saveMessages(newMessages);

      // Obtener respuesta de GPT
      const gptResponse = await api.getChatGPTResponse(text);
      
      // Mensaje de GPT
      const gptMessage = {
        id: Date.now().toString(),
        content: gptResponse,
        audioUri: gptResponse,
        timestamp: new Date().toLocaleString(),
        type: 'gpt',
        messageType: 'text'
      };

      const updatedMessages = [...newMessages, gptMessage];
      setMessages(updatedMessages);
      await saveMessages(updatedMessages);

    } catch (error) {
      console.error('Error procesando mensaje de texto:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = async () => {
    Alert.alert(
      'Limpiar Chat',
      '¿Estás seguro de que deseas eliminar todos los mensajes?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          style: 'destructive',
          onPress: async () => {
            await stopCurrentAudio();
            setMessages([]);
            await AsyncStorage.removeItem('messages');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header onClearChat={clearChat} />
      
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onPress={(message) => playAudio(message)}
              onLongPress={handleLongPressMessage}
              isPlaying={currentPlayingId === item.id && (isPlaying || isGPTSpeaking)}
              isPaused={currentPlayingId === item.id && isPaused}
            />
          )}
          contentContainerStyle={styles.messagesList}
        />
      )}

      {isProcessing && <LoadingIndicator />}
      
      <ChatInput
        onSendText={handleSendText}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        isRecording={recordingStatus === 'recording'}
        recordingTime={recordingTime}
      />
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  recordContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  recordingInfo: {
    backgroundColor: COLORS.overlay,
    padding: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordingTime: {
    color: COLORS.white,
    marginRight: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.recording,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    height: 20,
  },
  waveformBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
});