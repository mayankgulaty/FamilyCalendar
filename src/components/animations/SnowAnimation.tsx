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

interface SnowAnimationProps {
  intensity?: 'light' | 'moderate' | 'heavy';
}

export default function SnowAnimation({ intensity = 'moderate' }: SnowAnimationProps) {
  const animationValue = useSharedValue(0);
  
  useEffect(() => {
    const duration = intensity === 'light' ? 4000 : intensity === 'heavy' ? 2500 : 3000;
    animationValue.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [intensity]);

  const snowflakes = Array.from({ length: intensity === 'light' ? 6 : intensity === 'heavy' ? 15 : 10 }, (_, i) => {
    const delay = i * 200;
    const left = Math.random() * 100;
    const size = 2 + Math.random() * 4;
    const drift = (Math.random() - 0.5) * 50;
    
    const animatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        animationValue.value,
        [0, 1],
        [-50, 250]
      );
      
      const translateX = interpolate(
        animationValue.value,
        [0, 1],
        [0, drift]
      );
      
      const rotate = interpolate(
        animationValue.value,
        [0, 1],
        [0, 360]
      );
      
      return {
        transform: [
          { translateY },
          { translateX },
          { rotate: `${rotate}deg` },
        ],
        opacity: interpolate(
          animationValue.value,
          [0, 0.1, 0.9, 1],
          [0, 0.8, 0.8, 0]
        ),
      };
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.snowflake,
          {
            left: `${left}%`,
            width: size,
            height: size,
          },
          animatedStyle,
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      {snowflakes}
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
  snowflake: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 50,
  },
});
