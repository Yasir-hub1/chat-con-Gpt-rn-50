import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const LoadingIndicator = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de rotación
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    );

    // Animación de pulso
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    rotation.start();
    pulse.start();

    return () => {
      rotation.stop();
      pulse.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        }
      ]}
    >
      <View style={styles.loadingCard}>
        <BlurView intensity={60} tint="light" style={styles.blurContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']}
            style={styles.cardGradient}
          >
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconWrapper,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.iconGradient}
                >
                  <MaterialCommunityIcons name="brain" size={24} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.primaryText}>Procesando consulta</Text>
              <Text style={styles.secondaryText}>Analizando datos empresariales...</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { 
                      width: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['20%', '90%'],
                      })
                    }
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: rotateAnim.interpolate({
                        inputRange: [0, 0.3, 0.6, 1],
                        outputRange: index === 0 ? [1, 0.3, 0.3, 1] :
                                   index === 1 ? [0.3, 1, 0.3, 0.3] :
                                                 [0.3, 0.3, 1, 0.3],
                      }),
                      transform: [{
                        scale: rotateAnim.interpolate({
                          inputRange: [0, 0.3, 0.6, 1],
                          outputRange: index === 0 ? [1, 0.7, 0.7, 1] :
                                     index === 1 ? [0.7, 1, 0.7, 0.7] :
                                                   [0.7, 0.7, 1, 0.7],
                        })
                      }]
                    }
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  loadingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  cardGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },
});

export default LoadingIndicator;