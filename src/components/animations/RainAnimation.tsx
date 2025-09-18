import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

interface RainAnimationProps {
  intensity?: 'light' | 'moderate' | 'heavy';
}

export default function RainAnimation({ intensity = 'moderate' }: RainAnimationProps) {
  const animationValue = useSharedValue(0);
  
  useEffect(() => {
    const duration = intensity === 'light' ? 3000 : intensity === 'heavy' ? 1500 : 2000;
    animationValue.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [intensity]);

  const rainDrops = Array.from({ length: intensity === 'light' ? 8 : intensity === 'heavy' ? 20 : 12 }, (_, i) => {
    const delay = i * (intensity === 'heavy' ? 50 : 100);
    const left = Math.random() * 100;
    const opacity = 0.3 + Math.random() * 0.4;
    
    const animatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        animationValue.value,
        [0, 1],
        [-50, 200]
      );
      
      return {
        transform: [{ translateY }],
        opacity: interpolate(
          animationValue.value,
          [0, 0.1, 0.9, 1],
          [0, opacity, opacity, 0]
        ),
      };
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.rainDrop,
          {
            left: `${left}%`,
            opacity,
          },
          animatedStyle,
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      {rainDrops}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
});
