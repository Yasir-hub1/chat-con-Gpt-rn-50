import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const DocumentViewer = ({ document, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [documentUri, setDocumentUri] = useState(null);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (document) {
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

      loadDocument();
    }
  }, [document]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (document.uri) {
        setDocumentUri(document.uri);
      } else if (document.base64) {
        // Convertir base64 a archivo temporal
        const fileUri = `${FileSystem.documentDirectory}temp_document.${document.type === 'pdf' ? 'pdf' : 'xlsx'}`;
        await FileSystem.writeAsStringAsync(fileUri, document.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setDocumentUri(fileUri);
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError('No se pudo cargar el documento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
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
    ]).start(() => {
      onClose();
    });
  };

  const handleShare = async () => {
    try {
      if (documentUri) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(documentUri, {
            mimeType: document.type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: `Compartir ${document.type.toUpperCase()}`,
          });
        } else {
          Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el documento');
    }
  };

  const handleDownload = async () => {
    try {
      if (!documentUri) {
        Alert.alert('Error', 'No hay documento disponible para descargar');
        return;
      }
  
      // Usar Sharing para que el usuario elija dónde guardar
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert('Error', 'No se puede compartir archivos en este dispositivo');
        return;
      }
  
      await Sharing.shareAsync(documentUri, {
        mimeType: document.type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Guardar documento'
      });
  
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'No se pudo guardar el archivo');
    }
  };

  const getDocumentIcon = () => {
    return document?.type === 'pdf' ? 'file-pdf-box' : 'file-excel-box';
  };

  const getDocumentColor = () => {
    return document?.type === 'pdf' ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669'];
  };

  const renderDocumentPreview = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error al cargar documento</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDocument}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <LinearGradient
              colors={getDocumentColor()}
              style={styles.spinnerGradient}
            >
              <MaterialCommunityIcons name={getDocumentIcon()} size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.loadingText}>Cargando documento...</Text>
        </View>
      );
    }

    if (documentUri) {
      if (document.type === 'pdf') {
        return (
          <WebView
            source={{ uri: documentUri }}
            style={styles.webView}
            startInLoadingState
            scalesPageToFit
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <Text style={styles.webViewLoadingText}>Cargando PDF...</Text>
              </View>
            )}
          />
        );
      } else {
        // Para Excel, mostrar información del archivo
        return (
          <View style={styles.excelContainer}>
            <View style={styles.excelIcon}>
              <LinearGradient
                colors={getDocumentColor()}
                style={styles.excelIconGradient}
              >
                <MaterialCommunityIcons name="file-excel-box" size={64} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            <Text style={styles.excelTitle}>Archivo Excel Generado</Text>
            <Text style={styles.excelSubtitle}>
              El documento contiene los datos de análisis solicitados
            </Text>
            
            <View style={styles.excelActions}>
              <TouchableOpacity style={styles.excelActionButton} onPress={handleShare}>
                <MaterialCommunityIcons name="share-variant" size={24} color="#10B981" />
                <Text style={styles.excelActionText}>Compartir</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.excelActionButton} onPress={handleDownload}>
                <MaterialCommunityIcons name="download" size={24} color="#6366F1" />
                <Text style={styles.excelActionText}>Descargar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.excelNote}>
              💡 Para visualizar el contenido completo, abra el archivo en Excel o similar
            </Text>
          </View>
        );
      }
    }

    return null;
  };

  if (!document) return null;

  return (
    <Modal
      visible={true}
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
              colors={['rgba(26, 31, 53, 0.95)', 'rgba(15, 20, 25, 0.95)']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIcon}>
                    <LinearGradient
                      colors={getDocumentColor()}
                      style={styles.headerIconGradient}
                    >
                      <MaterialCommunityIcons 
                        name={getDocumentIcon()} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>
                      Documento {document.type?.toUpperCase()}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                      Reporte de análisis empresarial
                    </Text>
                  </View>
                </View>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleShare}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-outline" size={20} color="#A1A1AA" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={24} color="#A1A1AA" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content */}
              <View style={styles.content}>
                {renderDocumentPreview()}
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={styles.footerButton}
                  onPress={handleDownload}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.footerButtonGradient}
                  >
                    <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
                    <Text style={styles.footerButtonText}>Descargar</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.footerSecondaryButton}
                  onPress={handleShare}
                  activeOpacity={0.8}
                >
                  <Text style={styles.footerSecondaryText}>Compartir</Text>
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
    width: width - 32,
    height: height - 100,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  webViewLoadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  spinnerGradient: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  excelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  excelIcon: {
    marginBottom: 24,
  },
  excelIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  excelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  excelSubtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 32,
  },
  excelActions: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  excelActionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 100,
  },
  excelActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
  },
  excelNote: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  footerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSecondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  footerSecondaryText: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentViewer;