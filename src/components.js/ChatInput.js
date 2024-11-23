import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated,Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

export const ChatInput = ({ 
  onSendText, 
  onStartRecording, 
  onStopRecording, 
  isRecording,
  recordingTime 
}) => {
  const [message, setMessage] = useState('');
  const animatedValue = new Animated.Value(1);

  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.setValue(1);
    }
  }, [isRecording]);

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
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>
            {formatTime(recordingTime)}
          </Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          editable={!isRecording}
        />
        
        {message.trim() ? (
          <TouchableOpacity 
            onPress={handleSendText}
            style={styles.sendButton}
          >
            <MaterialCommunityIcons
              name="send"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleRecordPress}
            style={[
              styles.recordButton,
              isRecording && styles.recording
            ]}
          >
            <Animated.View
              style={[
                styles.recordButtonInner,
                { transform: [{ scale: animatedValue }] }
              ]}
            >
              <MaterialCommunityIcons
                name={isRecording ? "stop" : "microphone"}
                size={24}
                color={isRecording ? COLORS.error : COLORS.primary}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.recording,
    marginRight: 8,
  },
  recordingTime: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    color: COLORS.textPrimary,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  recordButton: {
    marginLeft: 8,
    padding: 8,
  },
  recordButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  recording: {
    backgroundColor: COLORS.error + '20',
  },
});