import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, StatusBar, SafeAreaView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking'

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
import {  useShakeDetector } from './src/hooks/useShakeDetection ';
import { Vibration } from 'react-native';
import { registerBackgroundTask, unregisterBackgroundTask } from './src/services/ForegroundService';
import * as IntentLauncher from 'expo-intent-launcher';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [currentGPTText, setCurrentGPTText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { recording, recordingStatus, startRecording, stopRecording } = useAudioRecorder();
  const shakeTimerRef = useRef(null);

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

  
  // Limpiar el temporizador cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
      }
    };
  }, []);



  useEffect(() => {
    const setupBackground = async () => {
      try {
        await registerBackgroundTask();
      } catch (error) {
        console.error('Error configurando background task:', error);
      }
    };

    setupBackground();

    return () => {
      const cleanup = async () => {
        try {
          await unregisterBackgroundTask();
        } catch (error) {
          console.error('Error limpiando background task:', error);
        }
      };
      cleanup();
    };
  }, []);

  // Función para detener la grabación y limpiar el temporizador
  const stopShakeRecording = async () => {
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    if (recordingStatus === 'recording') {
      await handleStopRecording();
    }
  };


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
  const handleEmergencyCall = async () => {
    try {
      const phoneNumber = Platform.select({
        ios: 'telprompt:911',
        android: 'tel:911'
      });
      
      const canOpen = await Linking.canOpenURL(phoneNumber);
      if (canOpen) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert(
          'Error',
          'No se puede abrir la aplicación de llamadas'
        );
      }
    } catch (error) {
      console.error('Error abriendo la app de llamadas:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al intentar realizar la llamada'
      );
    }
  };

  const checkForHelp = (text) => {
    const normalizedText = text.toLowerCase().trim();
    if (normalizedText.includes('ayuda')) {
      handleEmergencyCall();
    }
  };

  // const handleOpenMaps = async (address) => {
  //   try {
  //     const encodedAddress = encodeURIComponent(address);
      
  //     // URLs para diferentes plataformas
  //     const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  //     const appleMapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;

  //     if (Platform.OS === 'android') {
  //       const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
  //       if (canOpenGoogleMaps) {
  //         await Linking.openURL(googleMapsUrl);
  //       } else {
  //         Alert.alert(
  //           'Error',
  //           'No se puede abrir Google Maps. Por favor, instala la aplicación.'
  //         );
  //       }
  //     } else {
  //       // iOS intentará primero Apple Maps, si no está disponible usará Google Maps
  //       try {
  //         await Linking.openURL(appleMapsUrl);
  //       } catch {
  //         await Linking.openURL(googleMapsUrl);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error abriendo mapas:', error);
  //     Alert.alert(
  //       'Error',
  //       'No se pudo abrir la aplicación de mapas'
  //     );
  //   }
  // };


  const handleOpenMaps = async (address) => {
    try {
      const encodedAddress = encodeURIComponent(address);
      
      if (Platform.OS === 'android') {
        // Primera opción: Usar geo URI (abre directamente Google Maps si está instalado)
        try {
          const geoUrl = `geo:0,0?q=${encodedAddress}`;
          const canOpenGeo = await Linking.canOpenURL(geoUrl);
          if (canOpenGeo) {
            await Linking.openURL(geoUrl);
            return;
          }
        } catch (geoError) {
          console.log('Error con geo URI:', geoError);
        }
  
        // Segunda opción: Abrir en el navegador
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        await Linking.openURL(webUrl);
      } else {
        // iOS - mantiene la lógica actual
        const appleMapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
        const googleMapsWebUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        
        try {
          const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);
          if (canOpenAppleMaps) {
            await Linking.openURL(appleMapsUrl);
          } else {
            await Linking.openURL(googleMapsWebUrl);
          }
        } catch {
          await Linking.openURL(googleMapsWebUrl);
        }
      }
    } catch (error) {
      console.error('Error abriendo mapas:', error);
      // Intento final: abrir en el navegador si todo lo demás falla
      try {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        await Linking.openURL(webUrl);
      } catch (finalError) {
        Alert.alert(
          'Error',
          'No se pudo abrir el mapa. Por favor, inténtalo de nuevo.'
        );
      }
    }
  };


  const checkForLocation = (text) => {
    console.log('Verificando ubicación en:', text);
    const normalizedText = text.toLowerCase().trim();
    
    // Patrones para detectar solicitudes de ubicación
    const locationPatterns = [
      /ubicación\s+(.+)/i,    // "ubicación DIRECCIÓN"
      /dirección\s+(.+)/i,    // "dirección DIRECCIÓN"
      /ir\s+a\s+(.+)/i,       // "ir a DIRECCIÓN"
      /llegar\s+a\s+(.+)/i,   // "llegar a DIRECCIÓN"
      /como\s+llego\s+a\s+(.+)/i  // "como llego a DIRECCIÓN"
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        const address = match[1].trim();
        console.log('Dirección encontrada:', address);
        handleOpenMaps(address);
        return;
      }
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

  // const handleStopRecording = async () => {
  //   try {
  //     const audioUri = await stopRecording();
  //     console.log('Audio URI obtenido:', audioUri); // Debug
  //     if (audioUri) {
  //       await processUserMessage(audioUri);
  //     }
  //   } catch (error) {
  //     console.error('Error al detener la grabación:', error);
  //     Alert.alert(
  //       'Error',
  //       'Hubo un problema al procesar la grabación. Por favor, intenta de nuevo.'
  //     );
  //   }
  // };

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
      
         // Verificar si el audio contiene "ayuda"
         checkForHelp(text);
         checkForLocation(text); // Añadir verificación de ubicación
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
      checkForHelp(text);
      checkForLocation(text); // Añadir verificación de ubicación
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

  const handleShake = async () => {
    if (recordingStatus !== 'recording' && !isProcessing) {
      try {
        // Feedback táctil según la plataforma
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Vibration.vibrate(200);
        }
        
        console.log('Iniciando grabación por agitación...');
        await handleStartRecording();
        
        // Limpiar cualquier temporizador existente
        if (shakeTimerRef.current) {
          clearTimeout(shakeTimerRef.current);
        }
        
        // Configurar nuevo temporizador para detener la grabación
        shakeTimerRef.current = setTimeout(async () => {
          console.log('Deteniendo grabación por temporizador...');
          await stopShakeRecording();
        }, 5000);

      } catch (error) {
        console.error('Error en grabación por agitación:', error);
        Alert.alert(
          'Error',
          'No se pudo iniciar la grabación. Por favor, intenta de nuevo.'
        );
      }
    }
  };

  // También deberíamos limpiar el temporizador si el usuario detiene manualmente la grabación
  const handleStopRecording = async () => {
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    // Tu lógica existente de handleStopRecording
    try {
      const audioUri = await stopRecording();
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
  useShakeDetector(handleShake);

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