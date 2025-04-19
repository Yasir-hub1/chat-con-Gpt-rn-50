import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

const LanguageSelector = ({ sourceLanguage, setSourceLanguage }) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <MaterialCommunityIcons 
          name="translate" 
          size={18} 
          color="#00FFEF" 
        />
        <Text style={styles.label}>Idioma de origen:</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            sourceLanguage === 'es' && styles.activeButton
          ]}
          onPress={() => setSourceLanguage('es')}
        >
          <Text style={[
            styles.buttonText,
            sourceLanguage === 'es' && styles.activeButtonText
          ]}>
            Español
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            sourceLanguage === 'pt' && styles.activeButton
          ]}
          onPress={() => setSourceLanguage('pt')}
        >
          <Text style={[
            styles.buttonText,
            sourceLanguage === 'pt' && styles.activeButtonText
          ]}>
            Portugués
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.targetLabelContainer}>
        <MaterialCommunityIcons 
          name="arrow-right-thin" 
          size={18} 
          color="rgba(255, 255, 255, 0.5)" 
        />
        <Text style={styles.targetLabel}>
          Traduciendo a: {sourceLanguage === 'es' ? 'Portugués' : 'Español'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(0, 255, 239, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 239, 0.3)',
  },
  buttonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#00FFEF',
    fontWeight: '600',
  },
  targetLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginLeft: 5,
  },
});

export default LanguageSelector;