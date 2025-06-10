import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const Header = ({ onClearChat }) => {
  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <LinearGradient
        colors={['rgba(26, 31, 53, 0.95)', 'rgba(15, 20, 25, 0.95)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.iconGradient}
              >
                <MaterialCommunityIcons name="chart-line" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>INOVASOFT</Text>
              <View style={styles.subtitleContainer}>
                <View style={styles.statusIndicator} />
                <Text style={styles.subtitle}>Centro de Análisis Empresarial</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.rightSection}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="analytics-outline" size={20} color="#A1A1AA" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onClearChat}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="refresh" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.divider} />
      </LinearGradient>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
});

export default Header;