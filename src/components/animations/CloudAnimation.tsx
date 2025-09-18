import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  withSequence,
} from 'react-native-reanimated';

interface CloudAnimationProps {
  intensity?: 'light' | 'moderate' | 'heavy';
}

export default function CloudAnimation({ intensity = 'moderate' }: CloudAnimationProps) {
  const animationValue = useSharedValue(0);
  
  useEffect(() => {
    const duration = intensity === 'light' ? 8000 : intensity === 'heavy' ? 4000 : 6000;
    animationValue.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [intensity]);

  const cloudParticles = Array.from({ length: intensity === 'light' ? 3 : intensity === 'heavy' ? 8 : 5 }, (_, i) => {
    const delay = i * 1000;
    const left = Math.random() * 100;
    const size = 4 + Math.random() * 8;
    const drift = (Math.random() - 0.5) * 30;
    
    const animatedStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        animationValue.value,
        [0, 1],
        [0, drift]
      );
      
      const translateY = interpolate(
        animationValue.value,
        [0, 0.5, 1],
        [0, -5, 0]
      );
      
      const opacity = interpolate(
        animationValue.value,
        [0, 0.2, 0.8, 1],
        [0.3, 0.6, 0.6, 0.3]
      );
      
      return {
        transform: [
          { translateX },
          { translateY },
        ],
        opacity,
      };
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.cloudParticle,
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
      {cloudParticles}
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
  cloudParticle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 50,
    top: '20%',
  },
});
