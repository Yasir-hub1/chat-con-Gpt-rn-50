import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  StatusBar,
  Platform 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Constants';
import InfoModal from './InfoModal';

export const Header = ({ onClearChat }) => {
  // Estado para controlar la visibilidad del modal
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  
  // Animaciones para el indicador de estado
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const shiftAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animación de pulso para el indicador de estado
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Animación sutil de desplazamiento para el título
    Animated.loop(
      Animated.sequence([
        Animated.timing(shiftAnim, {
          toValue: 3,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shiftAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Función para mostrar el modal de información
  const handleShowInfo = () => {
    setInfoModalVisible(true);
  };

  // Calculamos el padding superior para diferentes plataformas
  const statusBarHeight = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10;
  
  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#141828" 
        translucent={true} 
      />
      <View style={[styles.header, { paddingTop: statusBarHeight }]}>
        {/* Efecto de gradiente para el header */}
        <View style={styles.gradientOverlay} />
        
        {/* Decoración lateral */}
        <View style={styles.sideDecoration}>
          <View style={styles.decorLine} />
          <View style={[styles.decorLine, { width: 15 }]} />
          <View style={[styles.decorLine, { width: 8 }]} />
        </View>
        
        {/* Contenedor del título con animación */}
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="robot-outline" 
              size={22} 
              color={COLORS.white} 
            />
            <Animated.View 
              style={[
                styles.statusIndicator, 
                { opacity: pulseAnim, transform: [{ scale: pulseAnim }] }
              ]} 
            />
          </View>
          
          <Animated.Text 
            style={[
              styles.title, 
              { transform: [{ translateX: shiftAnim }] }
            ]}
          >
            TraduApp
          </Animated.Text>
        </View>
        
        {/* Contenedor de acciones */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShowInfo}
          >
            <Ionicons name="information-circle-outline" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onClearChat}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons 
              name="delete-outline" 
              size={22} 
              color="rgba(255,255,255,0.8)" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Línea de separación con efecto brillante */}
      <View style={styles.separator}>
        <View style={styles.separatorGlow} />
      </View>

      {/* Modal de información */}
      <InfoModal 
        visible={infoModalVisible} 
        onClose={() => setInfoModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1A1F35', // Fondo oscuro que combina con el EmptyState
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0, 255, 239, 0.03)', // Sutil toque del color primario
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 239, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FFEF',
    bottom: -2,
    right: -2,
    borderWidth: 1,
    borderColor: '#1A1F35',
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  clearButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
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
  sideDecoration: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 4,
    height: '50%',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  decorLine: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(0, 255, 239, 0.3)',
    borderRadius: 1,
  },
});

export default Header;