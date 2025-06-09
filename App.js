import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioRecorder } from './src/hooks/useAudioRecorder';
import { useAudioPlayer } from './src/hooks/useAudioPlayer';
import { api } from './src/services/api';
import MessageBubble from './src/components/MessageBubble';
import ChatInput from './src/components/ChatInput';
import LoadingIndicator from './src/components/LoadingIndicator';


const App = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const scrollViewRef = useRef();
  
  const { recording, recordingStatus, startRecording, stopRecording } = useAudioRecorder();
  const { playAudio, isPlaying, isGPTSpeaking, currentPlayingId, stopCurrentAudio, isPaused } = useAudioPlayer();
  
  const recordingTimerRef = useRef(null);

  // Mensaje de bienvenida
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      messageType: 'text',
      content: '¡Hola! Soy tu asistente de ventas. Puedo ayudarte con información sobre:\n\n• Mejores ventas del día/mes/año\n• Vendedor destacado\n• Productos más vendidos\n• Rendimiento por sucursal\n• Resumen y tendencias de ventas\n• Comparaciones entre períodos\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      queryType: 'help'
    };
    setMessages([welcomeMessage]);
  }, []);

  // Timer para el tiempo de grabación
  useEffect(() => {
    if (recordingStatus === 'recording') {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recordingStatus]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendText = async (text) => {
    try {
      // Agregar mensaje del usuario
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        messageType: 'text',
        content: text,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Procesar consulta
      setIsLoading(true);
      const response = await api.processAssistantQuery(text, 'text');
      
      // Agregar respuesta del asistente
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        messageType: 'text',
        content: response.response,
        data: response.data,
        queryType: response.type,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error procesando texto:', error);
      Alert.alert('Error', 'No se pudo procesar tu consulta. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar la grabación. Verifica los permisos de micrófono.');
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await stopRecording();
      if (!uri) return;
      
      // Crear mensaje de audio del usuario
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        messageType: 'audio',
        audioUri: uri,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Procesar audio
      setIsLoading(true);
      const audioFile = {
        uri,
        type: 'audio/wav',
        name: 'recording.wav',
      };
      
      const result = await api.transcribeAndQuery(audioFile);
      
      // Actualizar mensaje con transcripción
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, transcription: result.originalText }
          : msg
      ));
      
      // Agregar respuesta del asistente
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        messageType: 'text',
        content: result.response,
        data: result.data,
        queryType: result.type,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error procesando audio:', error);
      Alert.alert('Error', 'No se pudo procesar tu mensaje de voz. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessagePress = (message) => {
    if (message.type === 'user' && message.messageType === 'audio') {
      playAudio(message);
    } else if (message.type === 'assistant') {
      playAudio(message);
    }
  };

  const handleMessageLongPress = (message) => {
    if (message.type === 'assistant' && message.data) {
      Alert.alert(
        'Opciones de exportación',
        '¿Qué deseas hacer con estos datos?',
        [
          {
            text: 'Exportar a Excel',
            onPress: () => api.generateReport({
              response: message.content,
              data: message.data,
              type: message.queryType
            }, 'excel')
          },
          {
            text: 'Exportar a PDF',
            onPress: () => api.generateReport({
              response: message.content,
              data: message.data,
              type: message.queryType
            }, 'pdf')
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Limpiar chat',
      '¿Estás seguro de que quieres borrar toda la conversación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Borrar', 
          style: 'destructive',
          onPress: () => {
            setMessages([{
              id: Date.now().toString(),
              type: 'assistant',
              messageType: 'text',
              content: '¡Chat limpiado! ¿En qué puedo ayudarte?',
              timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              queryType: 'help'
            }]);
            stopCurrentAudio();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="robot" size={28} color="#00FFEF" />
          <Text style={styles.headerTitle}>Asistente de Ventas</Text>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <MaterialCommunityIcons name="broom" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Mensajes */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onPress={handleMessagePress}
              onLongPress={handleMessageLongPress}
              isPlaying={currentPlayingId === message.id && (isPlaying || isGPTSpeaking)}
              isPaused={currentPlayingId === message.id && isPaused}
            />
          ))}
        </ScrollView>
        
        {/* Indicador de carga */}
        {isLoading && <LoadingIndicator />}
        
        {/* Input */}
        <ChatInput
          onSendText={handleSendText}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          isRecording={recordingStatus === 'recording'}
          recordingTime={recordingTime}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(26, 31, 53, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 12,
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
});

export default App;