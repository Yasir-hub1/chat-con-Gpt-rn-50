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
  StatusBar,
  Dimensions,
  BackHandler,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAudioRecorder } from './src/hooks/useAudioRecorder';
import { useAudioPlayer } from './src/hooks/useAudioPlayer';
import { api } from './src/services/api';
import MessageBubble from './src/components/MessageBubble';
import ChatInput from './src/components/ChatInput';
import LoadingIndicator from './src/components/LoadingIndicator';
import DocumentViewer from './src/components/DocumentViewer';
import QuickActions from './src/components/DocumentViewer';
import Header from './src/components/Header';
import TermsModal from './src/components/Terminos';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [documentToView, setDocumentToView] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollViewRef = useRef();
  const [showTermsModal, setShowTermsModal] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { recording, recordingStatus, startRecording, stopRecording } = useAudioRecorder();
  const { playAudio, isPlaying, isGPTSpeaking, currentPlayingId, stopCurrentAudio, isPaused } = useAudioPlayer();
  
  const recordingTimerRef = useRef(null);


    // Verificar si los términos han sido aceptados al iniciar la app
    useEffect(() => {
      checkTermsAcceptance();
    }, []);
  
    const checkTermsAcceptance = async () => {
      try {
        const accepted = await AsyncStorage.getItem('termsAccepted');
        if (accepted !== 'true') {
          setShowTermsModal(true);
        } else {
          setTermsAccepted(true);
        }
      } catch (error) {
        console.error('Error checking terms:', error);
        setShowTermsModal(true);
      }
    };
  
    const handleAcceptTerms = async () => {
      try {
        await AsyncStorage.setItem('termsAccepted', 'true');
        setTermsAccepted(true);
        setShowTermsModal(false);
      } catch (error) {
        console.error('Error saving terms acceptance:', error);
      }
    };
  
    const handleDeclineTerms = () => {
      // Puedes manejar el rechazo como prefieras
      Alert.alert(
        'Términos Requeridos',
        'Para usar Sales Intelligence debe aceptar los términos y condiciones.',
        [
          { text: 'Revisar nuevamente', onPress: () => {} },
          { text: 'Salir de la app', onPress: () => BackHandler.exitApp() }
        ]
      );
    };
  
    
  

  // Mensaje de bienvenida
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      messageType: 'text',
      content: 'Bienvenido al Centro de Análisis de Ventas. Soy su asistente inteligente especializado en generar insights empresariales.\n\nPuedo ayudarle con:\n\n• Análisis de rendimiento de ventas\n• Reportes de vendedores destacados\n• Métricas de productos más vendidos\n• Comparativas por sucursales\n• Tendencias y pronósticos\n• Exportación de datos\n\n¿Cómo puedo asistirle hoy?',
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
      setShowQuickActions(false);
      
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        messageType: 'text',
        content: text,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMessage]);
      
      setIsLoading(true);
      const response = await api.processAssistantQuery(text, 'text');
      
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
      Alert.alert('Error del Sistema', 'No se pudo procesar su consulta. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      setShowQuickActions(false);
      await startRecording();
    } catch (error) {
      Alert.alert('Error de Permisos', 'No se pudo acceder al micrófono. Verifique los permisos de la aplicación.');
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await stopRecording();
      if (!uri) return;
      
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        messageType: 'audio',
        audioUri: uri,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMessage]);
      
      setIsLoading(true);
      const audioFile = {
        uri,
        type: 'audio/wav',
        name: 'recording.wav',
      };
      
      const result = await api.transcribeAndQuery(audioFile);
      
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, transcription: result.originalText }
          : msg
      ));
      
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
      Alert.alert('Error de Procesamiento', 'No se pudo procesar el mensaje de voz. Intente nuevamente.');
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

  const handleExportDocument = async (message, format) => {
    try {
      const document = await api.generateReport({
        response: message.content,
        data: message.data,
        type: message.queryType
      }, format);
      
      setDocumentToView(document);
    } catch (error) {
      Alert.alert('Error de Exportación', 'No se pudo generar el documento. Intente nuevamente.');
    }
  };

  const handleMessageLongPress = (message) => {
    if (message.type === 'assistant' && message.data) {
      Alert.alert(
        'Opciones de Documento',
        'Seleccione el formato para exportar',
        [
          {
            text: 'Excel (.xlsx)',
            onPress: () => handleExportDocument(message, 'excel')
          },
          {
            text: 'PDF (.pdf)',
            onPress: () => handleExportDocument(message, 'pdf')
          },
          {
            text: 'Compartir Datos',
            onPress: () => api.shareData(message.data)
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const handleQuickAction = (action) => {
    setShowQuickActions(false);
    handleSendText(action.query);
  };

  const clearChat = () => {
    Alert.alert(
      'Limpiar Sesión',
      '¿Desea reiniciar la conversación? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reiniciar', 
          style: 'destructive',
          onPress: () => {
            setMessages([{
              id: Date.now().toString(),
              type: 'assistant',
              messageType: 'text',
              content: 'Sesión reiniciada. ¿En qué puedo asistirle?',
              timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              queryType: 'help'
            }]);
            setShowQuickActions(true);
            stopCurrentAudio();
          }
        }
      ]
    );
  };

  return (
    <>
    {!termsAccepted ? (
      <TermsModal
        visible={showTermsModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    ) : (
      <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f35" />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1f35', '#0f1419']}
          style={styles.backgroundGradient}
        >
          <Header onClearChat={clearChat} />
          
          <KeyboardAvoidingView 
            style={styles.content}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
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
              
              {showQuickActions && messages.length <= 1 && (
                <QuickActions onActionPress={handleQuickAction} />
              )}
            </ScrollView>
            
            {isLoading && <LoadingIndicator />}
            
            <ChatInput
              onSendText={handleSendText}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              isRecording={recordingStatus === 'recording'}
              recordingTime={recordingTime}
            />
          </KeyboardAvoidingView>
        </LinearGradient>
        
        {documentToView && (
          <DocumentViewer
            document={documentToView}
            onClose={() => setDocumentToView(null)}
          />
        )}

        <TermsModal
          visible={showTermsModal}
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
        />
      </SafeAreaView>
      </>
    )}
  </>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f35',
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
});

export default App;