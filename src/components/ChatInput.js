import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Platform,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const ChatInput = ({
  onSendText,
  onStartRecording,
  onStopRecording,
  isRecording,
  recordingTime,
}) => {
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const [isFocused, setIsFocused] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isRecording) {
      // Animación de pulso para grabación
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      // Animación de entrada del panel de grabación
      Animated.timing(recordingAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      pulse.start();
      
      return () => {
        pulse.stop();
      };
    } else {
      Animated.timing(recordingAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording]);

  React.useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendText(inputText.trim());
      setInputText('');
      setInputHeight(44);
      Keyboard.dismiss();
    }
  };

  const handleContentSizeChange = (event) => {
    const newHeight = Math.min(Math.max(44, event.nativeEvent.contentSize.height + 20), 120);
    setInputHeight(newHeight);
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canSend = inputText.trim().length > 0;

  if (isRecording) {
    return (
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY: recordingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            })}],
            opacity: recordingAnim,
          }
        ]}
      >
        <BlurView intensity={80} tint="dark" style={styles.recordingContainer}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.1)']}
            style={styles.recordingGradient}
          >
            <View style={styles.recordingContent}>
              <Animated.View 
                style={[
                  styles.recordingButton,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.recordingButtonGradient}
                >
                  <MaterialCommunityIcons name="microphone" size={24} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingText}>Grabando...</Text>
                <Text style={styles.recordingTime}>{formatRecordingTime(recordingTime)}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.stopButton}
                onPress={onStopRecording}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="stop" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.inputContainer}>
        <LinearGradient
          colors={['rgba(26, 31, 53, 0.95)', 'rgba(15, 20, 25, 0.95)']}
          style={styles.inputGradient}
        >
          <View style={styles.inputWrapper}>
            <Animated.View 
              style={[
                styles.textInputContainer,
                {
                  height: inputHeight,
                  borderColor: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255, 255, 255, 0.1)', '#6366F1'],
                  }),
                  shadowOpacity: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3],
                  }),
                }
              ]}
            >
              <TextInput
                style={[styles.textInput, { height: inputHeight - 4 }]}
                placeholder="Escriba su consulta empresarial..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                onContentSizeChange={handleContentSizeChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              
              {inputText.length > 0 && (
                <View style={styles.characterCount}>
                  <Text style={styles.characterText}>{inputText.length}/500</Text>
                </View>
              )}
            </Animated.View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={onStartRecording}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="microphone" size={20} color="#A1A1AA" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!canSend}
                activeOpacity={canSend ? 0.8 : 1}
              >
                <LinearGradient
                  colors={canSend ? ['#6366F1', '#8B5CF6'] : ['#374151', '#4B5563']}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons 
                    name="send" 
                    size={18} 
                    color={canSend ? "#FFFFFF" : "#6B7280"} 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputContainer: {
    overflow: 'hidden',
  },
  inputGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 2,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    includeFontPadding: false,
  },
  characterCount: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  characterText: {
    fontSize: 10,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingContainer: {
    overflow: 'hidden',
  },
  recordingGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  recordingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordingButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recordingTime: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
  },
  stopButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
});

export default ChatInput;