import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

const { width } = Dimensions.get('window');

export const EmptyState = ({ sourceLanguage, setSourceLanguage, onStartRecording }) => {
  // Animación principal
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de pulso para el círculo central
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de rotación para los elementos decorativos
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();

    // Animación de entrada al cargar el componente
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Transformaciones para las animaciones
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Fondo con gradiente simulado */}
      <View style={styles.backgroundGradient}>
        <Animated.View style={[styles.decorCircle, styles.decorBlur1, { opacity: 0.7 }]} />
        <Animated.View style={[styles.decorCircle, styles.decorBlur2, { opacity: 0.5 }]} />
      </View>

      {/* Elementos decorativos rotatorios */}
      <Animated.View 
        style={[
          styles.decorativeRing, 
          { transform: [{ rotate }] }
        ]}
      >
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[
            styles.ringDot,
            { transform: [{ rotate: `${i * 45}deg` }] }
          ]} />
        ))}
      </Animated.View>

      {/* Contenido principal con animación de fade in */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Círculo central animado */}
        <Animated.View 
          style={[
            styles.micCircle,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <MaterialCommunityIcons 
            name="translate" 
            size={64} 
            color={COLORS.white} 
          />
        </Animated.View>
        
        <Text style={styles.title}>
          ¡Traductor Español-Portugués!
        </Text>
        
        {/* Selector de idioma */}
        {/* <View style={styles.languageSelectorContainer}>
          <Text style={styles.selectorLabel}>Selecciona tu idioma:</Text>
          
          <View style={styles.languageButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                sourceLanguage === 'es' && styles.activeLanguageButton
              ]}
              onPress={() => setSourceLanguage('es')}
            >
              <Text style={[
                styles.languageButtonText,
                sourceLanguage === 'es' && styles.activeLanguageButtonText
              ]}>
                Español
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.languageButton,
                sourceLanguage === 'pt' && styles.activeLanguageButton
              ]}
              onPress={() => setSourceLanguage('pt')}
            >
              <Text style={[
                styles.languageButtonText,
                sourceLanguage === 'pt' && styles.activeLanguageButtonText
              ]}>
                Portugués
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.translationDirectionContainer}>
            <MaterialCommunityIcons 
              name="arrow-right-thin" 
              size={18} 
              color="#00FFEF" 
            />
            <Text style={styles.translationDirectionText}>
              Traduciendo a: {sourceLanguage === 'es' ? 'Portugués' : 'Español'}
            </Text>
          </View>
        </View> */}
        
        <Text style={styles.description}>
          Habla o escribe en {sourceLanguage === 'es' ? 'español' : 'portugués'} y 
          recibirás la traducción al {sourceLanguage === 'es' ? 'portugués' : 'español'}
        </Text>
        
        {/* Botón de grabación con efecto elevado */}
        {/* <TouchableOpacity 
          style={styles.actionButton}
          onPress={onStartRecording}
        >
          <Ionicons name="mic" size={28} color={COLORS.white} />
          <Text style={styles.buttonText}>
            {sourceLanguage === 'es' ? 'Comienza a hablar' : 'Comece a falar'}
          </Text>
        </TouchableOpacity> */}

        {/* Indicador secundario */}
        <View style={styles.tipsContainer}>
          <MaterialCommunityIcons 
            name="lightbulb-outline" 
            size={20} 
            color={COLORS.white}
          />
          <Text style={styles.tipsText}>
            {sourceLanguage === 'es' 
              ? 'Di "Hola, ¿cómo estás?" para probar' 
              : 'Diga "Olá, como vai você?" para testar'}
          </Text>
        </View>
      </Animated.View>

      {/* Diseño de ondas en la parte inferior */}
      <View style={styles.wavesContainer}>
        <View style={[styles.wave, { opacity: 0.3 }]} />
        <View style={[styles.wave, styles.wave2, { opacity: 0.2 }]} />
        <View style={[styles.wave, styles.wave3, { opacity: 0.1 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1F35', // Fondo oscuro moderno
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 300,
  },
  decorBlur1: {
    width: 500,
    height: 500,
    backgroundColor: '#00FFEF',
    top: -200,
    right: -100,
    opacity: 0.12,
  },
  decorBlur2: {
    width: 500,
    height: 500,
    backgroundColor: '#128C7E',
    bottom: -200,
    left: -100,
    opacity: 0.12,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 30,
    zIndex: 10,
  },
  decorativeRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFEF',
    top: 0,
    left: 137,
  },
  micCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#00FFEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#00FFEF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
    marginBottom: 30,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,255,239,0.8)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    width: width * 0.7,
    maxWidth: 300,
    shadowColor: '#00FFEF',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 20,
  },
  tipsText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  wavesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#00FFEF',
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
  wave2: {
    bottom: -40,
    left: -30,
    right: -30,
  },
  wave3: {
    bottom: -60,
    left: -60,
    right: -60,
  },
  
  // Nuevos estilos para el selector de idioma
  languageSelectorContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  languageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeLanguageButton: {
    backgroundColor: 'rgba(0, 255, 239, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 239, 0.3)',
  },
  languageButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  activeLanguageButtonText: {
    color: '#00FFEF',
    fontWeight: '600',
  },
  translationDirectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  translationDirectionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    marginLeft: 5,
  },
});

export default EmptyState;