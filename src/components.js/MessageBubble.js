import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

export const MessageBubble = ({ 
  message, 
  onPress, 
  isPlaying, 
  isPaused,
  onLongPress,
}) => {
  const isUser = message.type === 'user';
  
  const getIcon = () => {
    if (isPlaying) return "pause-circle";
    if (isPaused) return "play-circle-outline";
    return "play-circle";
  };

  const getWaveform = () => {
    if (isPlaying) {
      return (
        <View style={styles.waveform}>
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height: Math.random() * 20 + 10,
                  backgroundColor: isUser ? COLORS.textPrimary : COLORS.secondary,
                },
              ]}
            />
          ))}
        </View>
      );
    }
    return null;
  };
  
  return (
    <TouchableOpacity 
      onPress={() => onPress(message)}
      onLongPress={() => onLongPress(message)}
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.botMessage
      ]}
    >
      <View style={styles.messageContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getIcon()}
            size={28}
            color={isUser ? COLORS.textPrimary : COLORS.secondary}
          />
          {getWaveform()}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.timestamp}>{message.timestamp}</Text>
          <Text style={styles.messageText}>
            {isUser ? '🎤 Audio del Usuario' : '💬 Respuesta de GPT'}
          </Text>
          <Text style={styles.status}>
            {isPlaying ? 'Reproduciendo...' : 
             isPaused ? 'En pausa' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 12,
    borderRadius: 15,
    marginVertical: 4,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.userMessage,
    borderTopRightRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.botMessage,
    borderTopLeftRadius: 5,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  status: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});