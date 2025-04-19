import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Text,
  Keyboard,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

const { width } = Dimensions.get('window');

 const ChatInput = ({ 
  onSendText, 
  onStartRecording, 
  onStopRecording, 
  isRecording,
  recordingTime 
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;
  const inputExpandAnim = useRef(new Animated.Value(0)).current;

  // Efecto para animación de grabación
  useEffect(() => {
    if (isRecording) {
      // Animación de pulso para el botón
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Animaciones para las ondas de sonido
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim1, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim1, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim2, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            delay: 100,
          }),
          Animated.timing(waveAnim2, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim3, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            delay: 200,
          }),
          Animated.timing(waveAnim3, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Detener animaciones
      pulseAnim.setValue(1);
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
    }
  }, [isRecording]);
  
  // Efecto para animación de input
  useEffect(() => {
    Animated.timing(inputExpandAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // Importante: no usar native driver para height
    }).start();
  }, [isFocused]);

  const handleSendText = () => {
    if (message.trim()) {
      onSendText(message.trim());
      setMessage('');
    }
  };

  const handleRecordPress = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
      Keyboard.dismiss();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calcular la altura del input basado en animación
  const inputHeight = inputExpandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [45, 80]
  });
  
  // Fix para las barras del visualizador - usar transform en lugar de height
  const visualizerBar1Height = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 4]
  });
  const visualizerBar2Height = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3]
  });
  const visualizerBar3Height = waveAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3.6]
  });

  return (
    <View style={styles.outerContainer}>
      {/* Ondas decorativas en la parte superior */}
      <View style={styles.wavesContainer}>
        <View style={[styles.wave, { opacity: 0.03 }]} />
        <View style={[styles.wave, styles.wave2, { opacity: 0.02 }]} />
      </View>
      
      <View style={styles.container}>
        {/* Indicador de grabación */}
        {isRecording && (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingVisualizer}>
              <Animated.View 
                style={[
                  styles.visualizerBar, 
                  { 
                    transform: [{ scaleY: visualizerBar1Height }],
                    opacity: waveAnim1
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.visualizerBar, 
                  { 
                    transform: [{ scaleY: visualizerBar2Height }],
                    opacity: waveAnim2
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.visualizerBar, 
                  { 
                    transform: [{ scaleY: visualizerBar3Height }],
                    opacity: waveAnim3
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.visualizerBar, 
                  { 
                    transform: [{ scaleY: visualizerBar1Height }],
                    opacity: waveAnim1
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.visualizerBar, 
                  { 
                    transform: [{ scaleY: visualizerBar2Height }],
                    opacity: waveAnim2
                  }
                ]} 
              />
            </View>
            
            <View style={styles.recordingInfo}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>
                {formatTime(recordingTime)}
              </Text>
            </View>
            
            <Text style={styles.recordingLabel}>
              Grabando mensaje de voz...
            </Text>
          </View>
        )}
        
        {/* Contenedor del input */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            { height: inputHeight }
          ]}>
            <MaterialCommunityIcons
              name="text-box-outline"
              size={20}
              color="rgba(255,255,255,0.6)"
              style={styles.inputIcon}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable={!isRecording}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            
            {message.trim() ? (
              <TouchableOpacity 
                onPress={handleSendText}
                style={styles.sendButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={20}
                  color="#00FFEF"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleRecordPress}
                style={[
                  styles.recordButton,
                  isRecording && styles.recording
                ]}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.recordButtonInner,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isRecording ? "stop" : "microphone"}
                    size={18}
                    color={isRecording ? "#FF3B30" : "#00FFEF"}
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    backgroundColor: 'transparent', // Color de fondo oscuro
  },
  container: {
    padding: 12,
    paddingBottom: 16,
  },
  wavesContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
    overflow: 'hidden',
    transform: [{ rotate: '180deg' }]
  },
  wave: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#00FFEF',
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
  wave2: {
    bottom: -50,
    left: -20,
    right: -20,
  },
  recordingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  recordingVisualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    marginBottom: 8,
    justifyContent: 'center',
  },
  visualizerBar: {
    width: 3,
    height: 20,
    backgroundColor: '#00FFEF',
    borderRadius: 3,
    marginHorizontal: 2,
    transformOrigin: 'bottom',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  recordingTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  recordingLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 24,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainerFocused: {
    borderColor: 'rgba(0, 255, 239, 0.3)',
    backgroundColor: 'rgba(0, 255, 239, 0.06)',
  },
  inputIcon: {
    paddingRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: 'rgba(255, 255, 255, 0.9)',
    maxHeight: 80,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 239, 0.1)',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    padding: 8,
  },
  recordButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 255, 239, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 239, 0.3)',
  },
  recording: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
});

export default ChatInput;