import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const TermsModal = ({ visible, onAccept, onDecline }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    setScrollProgress(Math.min(Math.max(progress, 0), 1));
  };

  const isScrolledToBottom = scrollProgress > 0.9;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <BlurView intensity={50} tint="dark" style={styles.blurOverlay}>
          <Animated.View 
            style={[
              styles.container,
              {
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(26, 31, 53, 0.98)', 'rgba(15, 20, 25, 0.98)']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={styles.logoContainer}>
                    <LinearGradient
                      colors={['#6366F1', '#8B5CF6']}
                      style={styles.logoGradient}
                    >
                      <MaterialCommunityIcons name="shield-check" size={32} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.headerText}>
                    <Text style={styles.title}>Términos y Condiciones</Text>
                    <Text style={styles.subtitle}>
                    INOVASOFT - Sales Intelligence - Centro de Análisis Empresarial
                    </Text>
                  </View>
                </View>
                
                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[
                        styles.progressFill,
                        { width: `${scrollProgress * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(scrollProgress * 100)}% leído
                  </Text>
                </View>
              </View>

              {/* Content */}
              <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>1. Aceptación de Términos</Text>
                  <Text style={styles.sectionContent}>
                    Al utilizar Sales Intelligence de INOVASOFT ("la Aplicación"), usted acepta estos Términos y Condiciones. 
                    Esta aplicación de análisis empresarial procesa datos de ventas para generar insights y reportes 
                    que optimizan la toma de decisiones comerciales.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>2. Uso del Asistente de IA</Text>
                  <Text style={styles.sectionContent}>
                    Nuestro asistente inteligente procesa sus consultas de voz y texto para generar análisis de ventas. 
                    Los datos procesados se utilizan exclusivamente para proporcionar insights empresariales y no se 
                    almacenan permanentemente en servidores externos.
                  </Text>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.bulletText}>Procesamiento local de consultas de voz</Text>
                  </View>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.bulletText}>Generación de reportes PDF y Excel</Text>
                  </View>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.bulletText}>Análisis en tiempo real sin almacenamiento externo</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>3. Privacidad de Datos Empresariales</Text>
                  <Text style={styles.sectionContent}>
                    Sus datos de ventas y consultas son confidenciales. Implementamos medidas de seguridad 
                    avanzadas para proteger la información empresarial:
                  </Text>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="shield-lock" size={16} color="#6366F1" />
                    <Text style={styles.bulletText}>Cifrado de extremo a extremo</Text>
                  </View>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="shield-lock" size={16} color="#6366F1" />
                    <Text style={styles.bulletText}>No compartimos datos con terceros</Text>
                  </View>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="shield-lock" size={16} color="#6366F1" />
                    <Text style={styles.bulletText}>Sesiones de chat temporales</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>4. Funcionalidades de Exportación</Text>
                  <Text style={styles.sectionContent}>
                    La aplicación permite exportar y compartir reportes generados. Los documentos creados 
                    contienen únicamente los datos solicitados en su consulta específica.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>5. Responsabilidades del Usuario</Text>
                  <Text style={styles.sectionContent}>
                    El usuario se compromete a:
                  </Text>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="account-check" size={16} color="#F59E0B" />
                    <Text style={styles.bulletText}>Usar la aplicación solo para análisis empresarial legítimo</Text>
                  </View>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="account-check" size={16} color="#F59E0B" />
                    <Text style={styles.bulletText}>No intentar acceder a datos no autorizados</Text>
                  </View>
                  <View style={styles.bulletPoint}>
                    <MaterialCommunityIcons name="account-check" size={16} color="#F59E0B" />
                    <Text style={styles.bulletText}>Mantener la confidencialidad de información sensible</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>6. Propiedad Intelectual</Text>
                  <Text style={styles.sectionContent}>
                    La tecnología de análisis, algoritmos de IA y interfaz de usuario son propiedad exclusiva 
                    de Sales Intelligence. Los reportes generados pertenecen al usuario, pero la tecnología 
                    subyacente permanece protegida por derechos de autor.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>7. Limitaciones de Responsabilidad</Text>
                  <Text style={styles.sectionContent}>
                    Sales Intelligence proporciona análisis basados en los datos proporcionados. Las decisiones 
                    empresariales basadas en estos análisis son responsabilidad exclusiva del usuario. 
                    No garantizamos resultados comerciales específicos.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>8. Actualizaciones y Modificaciones</Text>
                  <Text style={styles.sectionContent}>
                    Nos reservamos el derecho de actualizar estos términos y mejorar las funcionalidades 
                    de la aplicación. Los usuarios serán notificados de cambios significativos.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>9. Contacto y Soporte</Text>
                  <Text style={styles.sectionContent}>
                    Para consultas sobre estos términos o soporte técnico, contacte a nuestro equipo de 
                    desarrollo empresarial a través de los canales oficiales de la aplicación.
                  </Text>
                </View>

                <View style={styles.lastSection}>
                  <Text style={styles.lastSectionText}>
                    Al continuar usando Sales Intelligence, confirma que ha leído, entendido y acepta 
                    estar sujeto a estos Términos y Condiciones.
                  </Text>
                  <Text style={styles.versionText}>
                    Versión 1.0 • Última actualización: {new Date().toLocaleDateString('es-ES')}
                  </Text>
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={[styles.declineButton, !isScrolledToBottom && styles.disabledButton]}
                  onPress={onDecline}
                  activeOpacity={0.8}
                >
                  <Text style={styles.declineButtonText}>Declinar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.acceptButton, !isScrolledToBottom && styles.disabledButton]}
                  onPress={onAccept}
                  disabled={!isScrolledToBottom}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isScrolledToBottom ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
                    style={styles.acceptButtonGradient}
                  >
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={20} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.acceptButtonText}>
                      {isScrolledToBottom ? 'Acepto los Términos' : 'Lea completamente'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width - 24,
    height: height - 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalGradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    marginRight: 16,
  },
  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 24,
  },
  sectionContent: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  lastSection: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginTop: 16,
  },
  lastSectionText: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TermsModal;