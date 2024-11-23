import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Constants';

export const LoadingIndicator = () => {
  const [dots] = React.useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  React.useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ),
      ])
    );

    Animated.parallel(animations).start();

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="robot" 
          size={24} 
          color={COLORS.secondary} 
        />
        <Text style={styles.text}>Procesando mensaje</Text>
        <View style={styles.dotsContainer}>
          {dots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      translateY: dot.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
    width: 40,
    justifyContent: 'space-between',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
});