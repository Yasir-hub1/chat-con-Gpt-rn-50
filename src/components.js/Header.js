
  
  import React from 'react';
  import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
  import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Constants';
  
  export const Header = ({ onClearChat }) => {
    return (
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons 
            name="robot" 
            size={24} 
            color={COLORS.white} 
          />
          <Text style={styles.title}>Asistente de Voz</Text>
        </View>
        <TouchableOpacity 
          onPress={onClearChat}
          style={styles.clearButton}
        >
          <MaterialCommunityIcons 
            name="delete" 
            size={24} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    header: {
      backgroundColor: COLORS.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 40,
      paddingBottom: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      color: COLORS.white,
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    clearButton: {
      padding: 8,
    },
  });