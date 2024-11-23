import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

export const EmptyState = () => {
  // Animation for the icon
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ translateY }] }
        ]}
      >
        <MaterialCommunityIcons 
          name="message-text-outline" 
          size={84} 
          color={COLORS.textSecondary}
        />
      </Animated.View>
      
      <Text style={styles.title}>
        ¡Comienza una conversación!
      </Text>
      
      <Text style={styles.description}>
        Presiona el botón del micrófono para grabar tu mensaje y comenzar a chatear con el asistente
      </Text>
      
      <View style={styles.instructionContainer}>
        <MaterialCommunityIcons 
          name="microphone" 
          size={24} 
          color={COLORS.textSecondary}
        />
        <Text style={styles.instructionText}>
          Toca para grabar
        </Text>
      </View>

      {/* Decorative elements */}
      <View style={styles.decorativeDots}>
        {[...Array(3)].map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot,
              { backgroundColor: COLORS.secondary, opacity: 0.7 - (index * 0.2) }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
    marginBottom: 32,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.84,
    elevation: 2,
  },
  instructionText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  decorativeDots: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  // Responsive styles for different screen sizes
  '@media (min-width: 768)': {
    title: {
      fontSize: 32,
    },
    description: {
      fontSize: 18,
      maxWidth: 400,
    },
  },
});

export default EmptyState;