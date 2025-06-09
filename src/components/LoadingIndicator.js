import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

const { width } = Dimensions.get('window');

export const LoadingIndicator = ({ loadingText = 'Consultando ventas' }) => {
  // Animaciones para los puntos
  const dots = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Animación de pulso para el ícono
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animación para el resplandor
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Animación para la aparición del indicador
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animación de aparición
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Animación de pulso para el ícono
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
    
    // Animación del resplandor
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animaciones para los puntos
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.parallel(animations).start();

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeInAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        {/* Decoración del borde con resplandor */}
        <Animated.View 
          style={[
            styles.glowBorder,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0.2, 1],
                outputRange: [0.3, 0.7]
              })
            }
          ]}
        />
        
        {/* Icono animado */}
        <Animated.View style={{
          transform: [{ scale: pulseAnim }]
        }}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="chart-line" 
              size={22} 
              color="#00FFEF" 
            />
          </View>
        </Animated.View>
        
        {/* Texto de carga */}
        <View style={styles.textContainer}>
          <Text style={styles.text}>{loadingText}</Text>
          <View style={styles.dotsContainer}>
            {dots.map((dot, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1]
                    }),
                    transform: [
                      {
                        scale: dot.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: width / 2 - 110,
    width: 220,
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 31, 53, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 239, 0.3)',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#00FFEF',
    shadowColor: '#00FFEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 255, 239, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 4,
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00FFEF',
    shadowColor: '#00FFEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
});

export default LoadingIndicator;