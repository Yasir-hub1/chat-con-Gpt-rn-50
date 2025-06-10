import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Alert,
  Modal,
  ScrollView,
  Animated
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import { COLORS } from '../Constants';
import { api } from '../services/api';

const { width, height } = Dimensions.get('window');

export const MessageBubble = ({
  message,
  onPress,
  isPlaying,
  isPaused,
  onLongPress,
}) => {
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);

  const isUser = message.type === 'user';
  const isAudio = message.messageType === 'audio';
  const hasData = message.data && (Array.isArray(message.data) ? message.data.length > 0 : Object.keys(message.data).length > 0);
  
  const getIcon = () => {
    if (isPlaying) return "pause-circle-outline";
    if (isPaused) return "play-circle-outline";
    return "play-circle-outline";
  };

  const getTimeDisplay = () => {
    const timestamp = message.timestamp || 'Ahora';
    return timestamp;
  };

  // Función para exportar y mostrar documentos
  const handleExport = async (format) => {
    try {
      if (!message || !message.data) {
        Alert.alert('Error', 'No hay datos disponibles para exportar');
        return;
      }
      
      setIsLoadingDocument(true);
      
      const result = {
        response: message.content || '',
        data: message.data,
        type: message.queryType || 'general'
      };

      const documentResult = await api.generateReport(result, format);
      
      // Si la API devuelve los datos del documento
      if (documentResult) {
        setDocumentData(documentResult);
        setDocumentType(format);
        setShowDocumentModal(true);
      } else {
        Alert.alert('Información', 'Documento generado exitosamente');
      }
      
    } catch (error) {
      console.error('Error exportando datos:', error);
      Alert.alert('Error', `No se pudo generar el documento ${format.toUpperCase()}: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Función para compartir documento
  const handleShareDocument = async () => {
    try {
      if (!documentData) {
        Alert.alert('Error', 'No hay documento disponible para compartir');
        return;
      }

      if (!documentData.uri) {
        Alert.alert('Error', 'El documento no tiene una ubicación válida');
        return;
      }

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
        return;
      }

      await Sharing.shareAsync(documentData.uri, {
        mimeType: documentType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: `Compartir ${documentType ? documentType.toUpperCase() : 'Documento'}`
      });
    } catch (error) {
      console.error('Error sharing document:', error);
      Alert.alert('Error', 'No se pudo compartir el documento');
    }
  };

  // Modal para mostrar documentos
  const DocumentModal = () => {
    if (!showDocumentModal) return null;

    return (
      <Modal
        visible={showDocumentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDocumentModal(false)}
      >
        <BlurView intensity={50} tint="dark" style={styles.modalOverlay}>
          <View style={styles.documentModal}>
            <LinearGradient
              colors={['#1a1f35', '#0f1419']}
              style={styles.modalGradient}
            >
              {/* Header del modal */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <LinearGradient
                    colors={documentType === 'pdf' ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669']}
                    style={styles.modalIcon}
                  >
                    <MaterialCommunityIcons
                      name={documentType === 'pdf' ? 'file-pdf-box' : 'file-excel-box'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                  
                  <View>
                    <Text style={styles.modalTitle}>
                      Documento {documentType?.toUpperCase() || 'DESCONOCIDO'}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Reporte de análisis generado
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  onPress={() => setShowDocumentModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#A1A1AA" />
                </TouchableOpacity>
              </View>

              {/* Contenido del documento */}
              <View style={styles.modalContent}>
                {documentType === 'pdf' && documentData && documentData.uri ? (
                  <WebView
                    source={{ uri: documentData.uri }}
                    style={styles.webView}
                    startInLoadingState
                    renderLoading={() => (
                      <View style={styles.webViewLoading}>
                        <Text style={styles.loadingText}>Cargando PDF...</Text>
                      </View>
                    )}
                    onError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent;
                      console.warn('WebView error: ', nativeEvent);
                    }}
                  />
                ) : (
                  <View style={styles.excelPreview}>
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.excelIcon}
                    >
                      <MaterialCommunityIcons 
                        name="file-excel-box" 
                        size={64} 
                        color="#FFFFFF" 
                      />
                    </LinearGradient>
                    
                    <Text style={styles.excelTitle}>Archivo Excel Generado</Text>
                    <Text style={styles.excelDescription}>
                      El documento contiene los datos de análisis en formato de hoja de cálculo
                    </Text>
                    
                    <View style={styles.excelStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                          {message && message.data ? 
                            (Array.isArray(message.data) ? 
                              message.data.length : 
                              (typeof message.data === 'object' ? Object.keys(message.data).length : 0)
                            ) : 0
                          }
                        </Text>
                        <Text style={styles.statLabel}>Registros</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{documentType?.toUpperCase() || 'N/A'}</Text>
                        <Text style={styles.statLabel}>Formato</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Footer con acciones */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={handleShareDocument}
                  disabled={!documentData}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.shareButtonGradient}
                  >
                    <MaterialCommunityIcons name="share-variant" size={20} color="#FFFFFF" />
                    <Text style={styles.shareButtonText}>Compartir</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={async () => {
                    try {
                      if (!documentData || !documentData.uri) {
                        Alert.alert('Error', 'No hay documento disponible para descargar');
                        return;
                      }

                      // Usar Sharing para que el usuario elija dónde guardar
                      const sharingAvailable = await Sharing.isAvailableAsync();
                      if (!sharingAvailable) {
                        Alert.alert('Error', 'No se puede compartir archivos en este dispositivo');
                        return;
                      }

                      await Sharing.shareAsync(documentData.uri, {
                        mimeType: documentType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        dialogTitle: 'Guardar documento'
                      });

                      setShowDocumentModal(false);
                    } catch (error) {
                      console.error('Error sharing file:', error);
                      Alert.alert('Error', 'No se pudo guardar el archivo');
                    }
                  }}
                >
                  <Text style={styles.downloadButtonText}>Descargar</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </BlurView>
      </Modal>
    );
  };

  return (
    <>
      <View style={styles.bubbleWrapper}>
        {/* Avatar para mensajes del bot */}
        {!isUser && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#00FFEF', '#0EA5E9']}
              style={styles.avatar}
            >
              <MaterialCommunityIcons 
                name="robot" 
                size={16} 
                color="#FFFFFF" 
              />
            </LinearGradient>
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
          <BlurView 
            intensity={isUser ? 0 : 20} 
            tint={isUser ? "dark" : "light"} 
            style={styles.messageBlur}
          >
            <LinearGradient
              colors={isUser ? 
                ['#6366F1', '#8B5CF6'] : 
                ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']
              }
              style={[styles.messageGradient, isUser && styles.userMessageGradient]}
            >
              {/* Etiqueta de tipo de consulta */}
              {!isUser && message.queryType && (
                <View style={styles.queryTypeContainer}>
                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
                    style={styles.queryTypeBadge}
                  >
                    <Text style={styles.queryTypeLabel}>
                      {getQueryTypeLabel(message.queryType)}
                    </Text>
                  </LinearGradient>
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
                  
                  {/* Botones de acción */}
                  <View style={styles.actionRow}>
                    {/* Botón de reproducir para asistente */}
                    {!isUser && (
                      <TouchableOpacity 
                        onPress={() => onPress(message)}
                        style={styles.playButton}
                      >
                        <MaterialCommunityIcons
                          name={getIcon()}
                          size={20}
                          color="#6366F1"
                        />
                      </TouchableOpacity>
                    )}
                    
                    {/* Botones de exportación mejorados */}
                    {hasData && !isUser && (
                      <View style={styles.exportContainer}>
                        <TouchableOpacity 
                          onPress={() => handleExport('excel')}
                          style={[styles.exportButton, styles.excelButton]}
                          disabled={isLoadingDocument}
                        >
                          <MaterialCommunityIcons
                            name="microsoft-excel"
                            size={18}
                            color="#10B981"
                          />
                          <Text style={styles.exportButtonText}>Excel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          onPress={() => handleExport('pdf')}
                          style={[styles.exportButton, styles.pdfButton]}
                          disabled={isLoadingDocument}
                        >
                          <MaterialCommunityIcons
                            name="file-pdf-box"
                            size={18}
                            color="#EF4444"
                          />
                          <Text style={styles.exportButtonText}>PDF</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                // Mensaje de audio mejorado
                <View style={styles.audioContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.audioIconContainer,
                      isUser ? styles.userAudioIcon : styles.botAudioIcon
                    ]}
                    onPress={() => onPress(message)}
                  >
                    <MaterialCommunityIcons
                      name={getIcon()}
                      size={24}
                      color={isUser ? "#FFFFFF" : "#6366F1"}
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.audioInfo}>
                    <Text style={[
                      styles.audioText,
                      isUser ? styles.userAudioText : styles.botAudioText
                    ]}>
                      {isUser ? 'Mensaje de voz' : 'Respuesta de voz'}
                    </Text>
                    
                    {isUser && message.transcription && (
                      <Text style={styles.transcriptionText}>
                        "{message.transcription}"
                      </Text>
                    )}
                    
                    {/* Visualizador de audio animado */}
                    <View style={styles.audioVisualizer}>
                      {[...Array(6)].map((_, i) => (
                        <Animated.View 
                          key={i} 
                          style={[
                            styles.visualizerBar,
                            isUser ? styles.userVisualizerBar : styles.botVisualizerBar,
                            { 
                              height: isPlaying ? 
                                Math.random() * 16 + 4 : 
                                4 + (i % 3) * 2
                            }
                          ]} 
                        />
                      ))}
                    </View>
                  </View>
                </View>
              )}
              
              {/* Footer del mensaje */}
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
                
                {hasData && !isUser && (
                  <View style={styles.dataIndicator}>
                    <MaterialCommunityIcons name="database" size={12} color="#6366F1" />
                    <Text style={styles.dataText}>Exportable</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
        
        {/* Avatar para mensajes del usuario */}
        {isUser && (
          <View style={styles.userAvatarContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              style={styles.userAvatar}
            >
              <Ionicons 
                name="person" 
                size={14} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Modal para mostrar documentos */}
      {/* <DocumentModal /> */}
    </>
  );
};

// Función auxiliar para obtener etiquetas de tipo de consulta
const getQueryTypeLabel = (type) => {
  const labels = {
    'best_sales': '📊 Mejores Ventas',
    'top_seller': '👤 Mejor Vendedor',
    'top_products': '📦 Productos Top',
    'sales_by_branch': '🏪 Ventas por Sucursal',
    'summary': '📈 Resumen',
    'trend': '📉 Tendencia',
    'comparison': '🔄 Comparación',
    'help': 'ℹ️ Ayuda'
  };
  return labels[type] || '💬 Consulta';
};

const styles = StyleSheet.create({
  bubbleWrapper: {
    flexDirection: 'row',
    marginVertical: 6,
    marginHorizontal: 16,
    alignItems: 'flex-end',
    justifyContent: 'space-between', // Distribuye mejor el espacio
  },
  
  // Avatares
  avatarContainer: {
    marginRight: 10,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FFEF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userAvatarContainer: {
    marginLeft: 10,
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // Contenedor principal del mensaje
  messageContainer: {
    maxWidth: width * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageBlur: {
    overflow: 'hidden',
  },
  messageGradient: {
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    marginLeft: width * 0.25, // Empuja el mensaje hacia la derecha
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    marginRight: width * 0.25, // Empuja el mensaje hacia la izquierda
  },
  userMessageGradient: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Tipo de consulta
  queryTypeContainer: {
    marginBottom: 8,
  },
  queryTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  queryTypeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
    textTransform: 'uppercase',
  },

  // Contenido de texto
  textMessageContent: {
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  botMessageText: {
    color: '#1F2937',
    fontWeight: '400',
  },

  // Fila de acciones
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },

  // Botones de exportación
  exportContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    gap: 4,
  },
  excelButton: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pdfButton: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  // Mensajes de audio
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    maxHeight: 60,
  },
  audioIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  userAudioIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  botAudioIcon: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  audioInfo: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  audioText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  userAudioText: {
    color: '#FFFFFF',
  },
  botAudioText: {
    color: '#1F2937',
  },
  transcriptionText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 6,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 14,
  },
  audioVisualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
    justifyContent: 'flex-start',
  },
  visualizerBar: {
    width: 2,
    borderRadius: 1,
    minHeight: 3,
    maxHeight: 12,
  },
  userVisualizerBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  botVisualizerBar: {
    backgroundColor: 'rgba(99, 102, 241, 0.6)',
  },

  // Footer del mensaje
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTimestamp: {
    color: '#9CA3AF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  playingIndicator: {
    backgroundColor: '#10B981',
  },
  pausedIndicator: {
    backgroundColor: '#F59E0B',
  },
  status: {
    fontSize: 10,
    fontWeight: '500',
  },
  userStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  botStatus: {
    color: '#6B7280',
  },
  dataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dataText: {
    fontSize: 10,
    color: '#6366F1',
    fontWeight: '600',
  },

  // Modal de documento
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  documentModal: {
    width: width - 32,
    height: height - 100,
    borderRadius: 16,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  excelPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  excelIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  excelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  excelDescription: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 32,
  },
  excelStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  downloadButtonText: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '600',
  },
});
export  default MessageBubble;