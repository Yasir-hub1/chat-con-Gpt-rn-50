import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  Platform,
  Vibration,
  Linking,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// Importa tus componentes existentes
import Header from './src/components/Header';
import EmptyState from './src/components/EmptyState';
import MessageBubble from './src/components/MessageBubble';

// Importa tus hooks personalizados
import { useAudioRecorder } from './src/hooks/useAudioRecorder';
import { useAudioPlayer } from './src/hooks/useAudioPlayer';

// Importa la API actualizada de traducción

// Importa constantes

// Funciones para el registro de tareas en segundo plano
import LanguageSelector from './src/components/LanguageSelector ';
import { useShakeDetector } from './src/hooks/useShakeDetection ';
import { api } from './src/services/api';
import { COLORS } from './src/Constants';
import { registerBackgroundTask, unregisterBackgroundTask } from './src/services/BackgroundTasks';
import { LoadingIndicator } from './src/components/LoadingIndicator';
import ChatInput from './src/components/ChatInput';

export default function App() {
  // Estados existentes
  const [messages, setMessages] = useState([]);
  const [currentGPTText, setCurrentGPTText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Nuevo estado para el idioma
  const [sourceLanguage, setSourceLanguage] = useState('es'); // 'es' para español, 'pt' para portugués
  
  // Referencias y hooks existentes
  const { recording, recordingStatus, startRecording, stopRecording } = useAudioRecorder();
  const { 
    playAudio, 
    isPlaying, 
    isGPTSpeaking, 
    currentPlayingId, 
    stopCurrentAudio,
    isPaused 
  } = useAudioPlayer();
  const shakeTimerRef = useRef(null);


  // Procesar mensaje de audio - Adaptado para traducción
  const processUserMessage = async (audioUri) => {
    console.log('Procesando mensaje de audio:', audioUri);
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

      // Preparar el archivo de audio
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a'
      };

      // Añadir un pequeño delay para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 500));

      // Definir el idioma destino basado en el idioma fuente
      const targetLang = sourceLanguage === 'es' ? 'pt' : 'es';
      
      console.log('Transcribiendo y traduciendo audio...');
      
      try {
        // Usamos la función para transcribir y traducir en un solo paso
        const result = await api.transcribeAndTranslate(audioFile, sourceLanguage, targetLang);
        
        console.log('Texto original:', result.originalText);
        console.log('Texto traducido:', result.translatedText);

        // Verificar palabras clave (si quieres mantener esta funcionalidad)
        checkForHelp(result.originalText);
        checkForLocation(result.originalText);

        // Mensaje de traducción
        const translationMessage = {
          id: Date.now().toString(),
          content: result.translatedText,
          originalText: result.originalText,
          audioUri: result.translatedText, // Para posible reproducción de audio
          timestamp: new Date().toLocaleString(),
          type: 'gpt',
          messageType: 'translation',
          sourceLang: sourceLanguage,
          targetLang
        };

        const updatedMessages = [...newMessages, translationMessage];
        setMessages(updatedMessages);
        await saveMessages(updatedMessages);
      } catch (error) {
        console.error('Error en traducción:', error);
        throw error;
      }

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

  // Manejar envío de texto - Adaptado para traducción
  const handleSendText = async (text) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      // Verificar palabras clave (si quieres mantener esta funcionalidad)
      checkForHelp(text);
      checkForLocation(text);

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

      // Traducir texto
      console.log('Traduciendo texto...');
      const targetLang = sourceLanguage === 'es' ? 'pt' : 'es';
      const translation = await api.translateText(text, sourceLanguage, targetLang);
      console.log('Texto traducido:', translation);
      
      // Mensaje de traducción
      const translationMessage = {
        id: Date.now().toString(),
        content: translation,
        originalText: text,
        audioUri: translation, // Para posible reproducción de audio
        timestamp: new Date().toLocaleString(),
        type: 'gpt',
        messageType: 'translation',
        sourceLang: sourceLanguage,
        targetLang
      };

      const updatedMessages = [...newMessages, translationMessage];
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

  // Función para detener la grabación
  const handleStopRecording = async () => {
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    
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

  // Cargar mensajes guardados
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

  // Guardar mensajes
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error guardando mensajes:', error);
    }
  };

  // Llamada de emergencia
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
        Alert.alert('Error', 'No se puede abrir la aplicación de llamadas');
      }
    } catch (error) {
      console.error('Error abriendo la app de llamadas:', error);
      Alert.alert('Error', 'Hubo un problema al intentar realizar la llamada');
    }
  };

  // Verificar si el texto contiene "ayuda"
  const checkForHelp = (text) => {
    const normalizedText = text.toLowerCase().trim();
    if (normalizedText.includes('ayuda')) {
      handleEmergencyCall();
    }
  };

  // Abrir mapas
  const handleOpenMaps = async (address) => {
    try {
      const encodedAddress = encodeURIComponent(address);
      
      // URLs para diferentes plataformas
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      const appleMapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;

      if (Platform.OS === 'android') {
        const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
        if (canOpenGoogleMaps) {
          await Linking.openURL(googleMapsUrl);
        } else {
          Alert.alert('Error', 'No se puede abrir Google Maps. Por favor, instala la aplicación.');
        }
      } else {
        // iOS intentará primero Apple Maps, si no está disponible usará Google Maps
        try {
          await Linking.openURL(appleMapsUrl);
        } catch {
          await Linking.openURL(googleMapsUrl);
        }
      }
    } catch (error) {
      console.error('Error abriendo mapas:', error);
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
    }
  };

  // Verificar si el texto contiene una ubicación
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

  // Iniciar grabación
  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación. Por favor, intenta de nuevo.');
    }
  };

  // Borrar un mensaje
  const deleteMessage = async (messageId) => {
    const newMessages = messages.filter(m => m.id !== messageId);
    setMessages(newMessages);
    await saveMessages(newMessages);
  };

  // Reproducir un mensaje
  const replayMessage = async (message) => {
    if (message.type === 'user') {
      await processUserMessage(message.audioUri, true);
    }
  };

  // Borrar todo el chat
  const clearChat = async () => {
    Alert.alert(
      'Limpiar Chat',
      '¿Estás seguro de que deseas eliminar todos los mensajes?',
      [
        { text: 'Cancelar', style: 'cancel' },
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

  // Detener la grabación por agitación
  const stopShakeRecording = async () => {
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    if (recordingStatus === 'recording') {
      await handleStopRecording();
    }
  };

  // Manejar la agitación del dispositivo
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
        Alert.alert('Error', 'No se pudo iniciar la grabación. Por favor, intenta de nuevo.');
      }
    }
  };

  // Manejar pulsación larga en un mensaje
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

  // Cargar mensajes al iniciar
  useEffect(() => {
    loadMessages();
  }, []);

  // Limpiar el temporizador al desmontar
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
      }
    };
  }, []);

  // Configurar tareas en segundo plano
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

  // Activar el detector de agitación
  useShakeDetector(handleShake);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header onClearChat={clearChat} />
      
      {/* Selector de idioma */}
     
      <LanguageSelector 
        sourceLanguage={sourceLanguage}
        setSourceLanguage={setSourceLanguage}
      />

     
      
      {messages.length === 0 ? (
        <EmptyState 
        setSourceLanguage={setSourceLanguage}
        onStartRecording={handleStartRecording}
        />
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
        placeholder={sourceLanguage === 'es' ? "Escribe en español..." : "Escreva em português..."}
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