import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const QuickActions = ({ onActionPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const quickActions = [
    {
      id: 'top-sales',
      title: 'Mejores Ventas',
      subtitle: 'Del período actual',
      icon: 'trending-up',
      iconType: 'material',
      gradient: ['#10B981', '#059669'],
      query: 'Muéstrame las mejores ventas de este mes'
    },
    {
      id: 'top-seller',
      title: 'Vendedor Destacado',
      subtitle: 'Rendimiento individual',
      icon: 'account-star',
      iconType: 'material-community',
      gradient: ['#F59E0B', '#D97706'],
      query: 'Quién es el vendedor con mejor rendimiento'
    },
    {
      id: 'products',
      title: 'Productos Top',
      subtitle: 'Más vendidos',
      icon: 'cube-outline',
      iconType: 'ionicon',
      gradient: ['#8B5CF6', '#7C3AED'],
      query: 'Cuáles son los productos más vendidos'
    },
    {
      id: 'branches',
      title: 'Sucursales',
      subtitle: 'Comparativa general',
      icon: 'store',
      iconType: 'material-community',
      gradient: ['#EF4444', '#DC2626'],
      query: 'Compara el rendimiento por sucursales'
    },
    {
      id: 'trends',
      title: 'Tendencias',
      subtitle: 'Análisis temporal',
      icon: 'chart-line',
      iconType: 'material-community',
      gradient: ['#06B6D4', '#0891B2'],
      query: 'Analiza las tendencias de ventas de los últimos meses'
    },
    {
      id: 'report',
      title: 'Reporte Completo',
      subtitle: 'Resumen ejecutivo',
      icon: 'document-text-outline',
      iconType: 'ionicon',
      gradient: ['#6366F1', '#4F46E5'],
      query: 'Genera un reporte completo de ventas'
    },
  ];

  const renderIcon = (action) => {
    const iconProps = {
      size: 24,
      color: '#FFFFFF'
    };

    switch (action.iconType) {
      case 'material-community':
        return <MaterialCommunityIcons name={action.icon} {...iconProps} />;
      case 'ionicon':
        return <Ionicons name={action.icon} {...iconProps} />;
      default:
        return <MaterialCommunityIcons name={action.icon} {...iconProps} />;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#6366F1" />
          <Text style={styles.headerTitle}>Consultas Rápidas</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Seleccione una opción para obtener insights inmediatos
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
        style={styles.scrollView}
      >
        {quickActions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={[
              styles.actionWrapper,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [0, 30 + (index * 5)],
                    })
                  }
                ],
              }
            ]}
          >
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => onActionPress(action)}
              activeOpacity={0.8}
            >
              <BlurView intensity={40} tint="light" style={styles.cardBlur}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      <LinearGradient
                        colors={action.gradient}
                        style={styles.iconGradient}
                      >
                        {renderIcon(action)}
                      </LinearGradient>
                    </View>
                    
                    <View style={styles.textContainer}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                    </View>
                    
                    <View style={styles.arrowContainer}>
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                    </View>
                  </View>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>
          💡 También puede escribir o grabar su consulta personalizada
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  scrollView: {
    marginBottom: 16,
  },
  actionsContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  actionWrapper: {
    width: 280,
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBlur: {
    overflow: 'hidden',
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  footerDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default QuickActions;