import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

const { width, height } = Dimensions.get('window');

export const InfoModal = ({ visible, onClose }) => {
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Referencias para animaciones de elementos individuales
  const iconAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ];
  
  // Efecto para animar la entrada y salida del modal
  useEffect(() => {
    if (visible) {
      // Animaciones de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        })
      ]).start();
      
      // Animaciones de íconos secuenciales
      iconAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: 400 + (index * 100),
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Animaciones de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
      
      // Resetear animaciones de íconos
      iconAnimations.forEach(anim => {
        anim.setValue(0);
      });
    }
  }, [visible]);

  // Transformaciones para las animaciones de íconos
  const iconTransforms = iconAnimations.map(anim => ({
    opacity: anim,
    transform: [
      { 
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0.8, 1.1, 1]
        })
      }
    ]
  }));

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[
        styles.overlay,
        { opacity: fadeAnim }
      ]}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}>
          {/* Barra superior con título y botón de cierre */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              TraduApp
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          
          {/* Separador con brillo */}
          <View style={styles.separator}>
            <View style={styles.separatorGlow} />
          </View>
          
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Sección de introducción */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconAccent} />
                <Text style={styles.sectionTitle}>¿Qué es TraduApp?</Text>
              </View>
              
              <Text style={styles.description}>
                TraduApp es una aplicación de traducción en tiempo real entre español y portugués. 
                Utiliza tecnología avanzada de reconocimiento de voz y traducción para facilitar 
                la comunicación entre hablantes de ambos idiomas.
              </Text>
            </View>
            
            {/* Características principales */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconAccent} />
                <Text style={styles.sectionTitle}>Características principales</Text>
              </View>
              
              <View style={styles.featureContainer}>
                <Animated.View style={[styles.featureItem, iconTransforms[0]]}>
                  <View style={styles.featureIconContainer}>
                    <MaterialCommunityIcons 
                      name="microphone" 
                      size={22} 
                      color="#00FFEF" 
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Traducción por voz</Text>
                    <Text style={styles.featureDescription}>
                      Habla en español o portugués y recibe una traducción instantánea en el idioma contrario.
                    </Text>
                  </View>
                </Animated.View>
                
                <Animated.View style={[styles.featureItem, iconTransforms[1]]}>
                  <View style={styles.featureIconContainer}>
                    <MaterialCommunityIcons 
                      name="text-box-outline" 
                      size={22} 
                      color="#00FFEF" 
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Traducción de texto</Text>
                    <Text style={styles.featureDescription}>
                      Escribe texto para traducir si lo prefieres en lugar de usar tu voz.
                    </Text>
                  </View>
                </Animated.View>
                
                <Animated.View style={[styles.featureItem, iconTransforms[2]]}>
                  <View style={styles.featureIconContainer}>
                    <MaterialCommunityIcons 
                      name="history" 
                      size={22} 
                      color="#00FFEF" 
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Historial de traducciones</Text>
                    <Text style={styles.featureDescription}>
                      Accede a tus traducciones anteriores en cualquier momento.
                    </Text>
                  </View>
                </Animated.View>
              </View>
            </View>
            
            {/* Cómo usar */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconAccent} />
                <Text style={styles.sectionTitle}>Cómo usar TraduApp</Text>
              </View>
              
              <View style={styles.instructionContainer}>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Presiona el botón de micrófono para comenzar a grabar tu mensaje.
                  </Text>
                </View>
                
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Habla en español o portugués. Selecciona un idioma.
                  </Text>
                </View>
                
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Recibe la traducción en texto y audio en el idioma contrario.
                  </Text>
                </View>
                
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Toca cualquier mensaje para escucharlo nuevamente.
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Consejos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconAccent} />
                <Text style={styles.sectionTitle}>Consejos útiles</Text>
              </View>
              
              <View style={styles.tipsContainer}>
                <View style={styles.tipItem}>
                  <MaterialCommunityIcons 
                    name="lightbulb-outline" 
                    size={18} 
                    color="#00FFEF" 
                    style={styles.tipIcon}
                  />
                  <Text style={styles.tipText}>
                    Habla claramente y a un ritmo normal para mejores resultados.
                  </Text>
                </View>
                
                <View style={styles.tipItem}>
                  <MaterialCommunityIcons 
                    name="lightbulb-outline" 
                    size={18} 
                    color="#00FFEF" 
                    style={styles.tipIcon}
                  />
                  <Text style={styles.tipText}>
                    Usa frases completas para obtener traducciones más precisas.
                  </Text>
                </View>
                
                <View style={styles.tipItem}>
                  <MaterialCommunityIcons 
                    name="lightbulb-outline" 
                    size={18} 
                    color="#00FFEF" 
                    style={styles.tipIcon}
                  />
                  <Text style={styles.tipText}>
                    Mantén presionado un mensaje para ver opciones adicionales.
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Espacio adicional al final */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
          
          {/* Botón flotante en la parte inferior */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onClose}
            >
              <Text style={styles.actionButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#1A1F35',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingTop: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  separatorGlow: {
    position: 'absolute',
    height: 1,
    width: 100,
    left: '50%',
    marginLeft: -50,
    backgroundColor: '#00FFEF',
    opacity: 0.6,
    shadowColor: '#00FFEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconAccent: {
    width: 4,
    height: 20,
    backgroundColor: '#00FFEF',
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featureContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#00FFEF',
  },
  featureIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 255, 239, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  instructionContainer: {
    marginTop: 8,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 255, 239, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FFEF',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  tipsContainer: {
    backgroundColor: 'rgba(0, 255, 239, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 31, 53, 0.95)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 255, 239, 0.8)',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#1A1F35',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InfoModal;