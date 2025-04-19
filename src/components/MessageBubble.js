import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

const { width } = Dimensions.get('window');

export const MessageBubble = ({
  message,
  onPress,
  isPlaying,
  isPaused,
  onLongPress,
}) => {
  const isUser = message.type === 'user';
  const isAudio = message.messageType === 'audio';
  const isTranslation = message.messageType === 'translation';
  
  const getIcon = () => {
    if (isPlaying) return "pause-circle-outline";
    if (isPaused) return "play-circle-outline";
    return "play-circle-outline";
  };

  // Función para mostrar el tiempo transcurrido
  const getTimeDisplay = () => {
    const timestamp = message.timestamp || 'Ahora';
    return timestamp;
  };

  // Función para mostrar la etiqueta de traducción
  const getTranslationLabel = () => {
    if (!isTranslation || !message.sourceLang || !message.targetLang) return null;
    
    const sourceLabel = message.sourceLang === 'es' ? 'ES' : 'PT';
    const targetLabel = message.targetLang === 'es' ? 'ES' : 'PT';
    
    return `${sourceLabel} → ${targetLabel}`;
  };

  return (
    <View style={styles.bubbleWrapper}>
      {/* Avatar para mensajes del bot */}
      {!isUser && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons 
              name="robot" 
              size={14} 
              color="#00FFEF" 
            />
          </View>
        </View>
      )}
      
      <TouchableOpacity 
        onPress={() => onPress(message)}
        onLongPress={() => onLongPress(message)}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
          isAudio && styles.audioMessageContainer
        ]}
        activeOpacity={0.8}
      >
        {/* Decoración lateral para mensajes del asistente */}
        {!isUser && <View style={styles.botMessageAccent} />}
        
        <View style={styles.messageContentWrapper}>
          {/* Etiqueta de traducción */}
          {isTranslation && (
            <View style={styles.translationLabelContainer}>
              <Text style={styles.translationLabel}>
                {getTranslationLabel()}
              </Text>
            </View>
          )}

          {/* Texto original (para traducciones) */}
          {isTranslation && message.originalText && (
            <View style={styles.originalTextContainer}>
              <Text style={styles.originalTextLabel}>Original:</Text>
              <Text style={styles.originalText}>{message.originalText}</Text>
            </View>
          )}
          
          {!isAudio ? (
            // Mensaje de texto
            <View style={styles.textMessageContent}>
              <Text style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.botMessageText
              ]}>
                {message.content}
              </Text>
              
              {(message.type === 'gpt' || isTranslation) && (
                <TouchableOpacity 
                  onPress={() => onPress(message)}
                  style={styles.playButton}
                >
                  <MaterialCommunityIcons
                    name={getIcon()}
                    size={22}
                    color="#00FFEF"
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Mensaje de audio
            <View style={styles.audioContainer}>
              <View style={[
                styles.audioIconContainer,
                isUser ? styles.userAudioIcon : styles.botAudioIcon
              ]}>
                <MaterialCommunityIcons
                  name={getIcon()}
                  size={24}
                  color={isUser ? "#FFFFFF" : "#00FFEF"}
                />
              </View>
              
              <View style={styles.audioInfo}>
                <Text style={[
                  styles.audioText,
                  isUser ? styles.userAudioText : styles.botAudioText
                ]}>
                  {isUser ? 'Mensaje de voz' : 'Respuesta de voz'}
                </Text>
                
                {/* Visualizador de audio (solo decorativo) */}
                <View style={styles.audioVisualizer}>
                  {[...Array(4)].map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.visualizerBar,
                        isUser ? styles.userVisualizerBar : styles.botVisualizerBar,
                        { height: 4 + (i * 2) % 12 }
                      ]} 
                    />
                  ))}
                </View>
              </View>
            </View>
          )}
          
          {/* Información y estado del mensaje */}
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp, 
              isUser ? styles.userTimestamp : styles.botTimestamp
            ]}>
              {getTimeDisplay()}
            </Text>
            
            {(isPlaying || isPaused) && (
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusIndicator,
                  isPlaying ? styles.playingIndicator : styles.pausedIndicator
                ]} />
                <Text style={[
                  styles.status,
                  isUser ? styles.userStatus : styles.botStatus
                ]}>
                  {isPlaying ? 'Reproduciendo' : 'En pausa'}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Decoración para mensajes del usuario */}
        {isUser && (
          <View style={styles.userMessageStatus}>
            <MaterialCommunityIcons 
              name="check-all" 
              size={14} 
              color="rgba(255, 255, 255, 0.5)" 
            />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Avatar para mensajes del usuario (opcional) */}
      {isUser && (
        <View style={styles.userAvatarContainer}>
          <View style={styles.userAvatar}>
            <Ionicons 
              name="person" 
              size={12} 
              color="#FFFFFF" 
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleWrapper: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 239, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 239, 0.3)',
  },
  userAvatarContainer: {
    marginLeft: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  messageContainer: {
    borderRadius: 18,
    maxWidth: '80%',
    position: 'relative',
    overflow: 'hidden',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 255, 239, 0.2)',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
    marginLeft: 'auto',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    marginRight: 'auto',
  },
  botMessageAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#00FFEF',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  audioMessageContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  messageContentWrapper: {
    padding: 12,
  },
  textMessageContent: {
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  botMessageText: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  botTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  playingIndicator: {
    backgroundColor: '#00FFEF',
  },
  pausedIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  status: {
    fontSize: 11,
  },
  userStatus: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botStatus: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAudioIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  botAudioIcon: {
    backgroundColor: 'rgba(0, 255, 239, 0.15)',
  },
  audioInfo: {
    flex: 1,
  },
  audioText: {
    fontSize: 14,
    marginBottom: 5,
  },
  userAudioText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  botAudioText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  audioVisualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 12,
  },
  visualizerBar: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
  userVisualizerBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  botVisualizerBar: {
    backgroundColor: 'rgba(0, 255, 239, 0.6)',
  },
  playButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 255, 239, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMessageStatus: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  // Nuevos estilos para la funcionalidad de traducción
  translationLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  translationLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00FFEF',
    backgroundColor: 'rgba(0, 255, 239, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  originalTextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  originalTextLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
    fontWeight: '500',
  },
  originalText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  }
});

export default MessageBubble;