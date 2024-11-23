import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

export const RecordButton = ({ isRecording, onPress }) => {
  const animatedValue = new Animated.Value(1);

  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.setValue(1);
    }
  }, [isRecording]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Animated.View
        style={[
          styles.button,
          { transform: [{ scale: animatedValue }] }
        ]}
      >
        <MaterialCommunityIcons
          name={isRecording ? "stop-circle" : "microphone"}
          size={32}
          color={COLORS.white}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
