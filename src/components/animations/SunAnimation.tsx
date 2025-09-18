import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SunAnimationProps {
  intensity?: 'light' | 'moderate' | 'bright';
}

export default function SunAnimation({ intensity = 'moderate' }: SunAnimationProps) {
  const animationValue = useSharedValue(0);
  
  useEffect(() => {
    const duration = intensity === 'light' ? 12000 : intensity === 'bright' ? 8000 : 10000;
    animationValue.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [intensity]);

  const sunRays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45);
    
    const animatedStyle = useAnimatedStyle(() => {
      const rotate = interpolate(
        animationValue.value,
        [0, 1],
        [angle, angle + 360]
      );
      
      const scale = interpolate(
        animationValue.value,
        [0, 0.5, 1],
        [1, 1.1, 1]
      );
      
      const opacity = interpolate(
        animationValue.value,
        [0, 0.5, 1],
        [0.6, 0.8, 0.6]
      );
      
      return {
        transform: [
          { rotate: `${rotate}deg` },
          { scale },
        ],
        opacity,
      };
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.sunRay,
          animatedStyle,
        ]}
      />
    );
  });

  const centerGlow = useAnimatedStyle(() => {
    const scale = interpolate(
      animationValue.value,
      [0, 0.5, 1],
      [1, 1.05, 1]
    );
    
    const opacity = interpolate(
      animationValue.value,
      [0, 0.5, 1],
      [0.8, 1, 0.8]
    );
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.centerGlow, centerGlow]} />
      {sunRays}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginTop: -30,
    marginLeft: -30,
  },
  centerGlow: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  sunRay: {
    position: 'absolute',
    top: 28,
    left: 28,
    width: 4,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2,
    transformOrigin: '2px 2px',
  },
});
