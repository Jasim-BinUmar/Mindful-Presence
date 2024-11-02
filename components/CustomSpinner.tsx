import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

const CIRCLE_SIZE = 40;
const CIRCLE_BORDER_WIDTH = 3;
const NUM_CIRCLES = 12;

const Dot = ({ index, size }: { index: number; size: number }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1200,
        delay: (index * 1200) / NUM_CIRCLES,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderWidth: CIRCLE_BORDER_WIDTH,
          borderColor: '#FFFFFF',
          opacity: animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.2, 1],
          }),
          transform: [
            {
              rotate: `${(index * 360) / NUM_CIRCLES}deg`,
            },
            {
              translateX: size / 2 - CIRCLE_BORDER_WIDTH / 2,
            },
          ],
        },
      ]}
    />
  );
};

const CustomSpinner = ({ size = CIRCLE_SIZE }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {Array.from({ length: NUM_CIRCLES }).map((_, index) => (
        <Dot key={index} index={index} size={size} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    borderRadius: CIRCLE_SIZE / 2,
  },
});

export default CustomSpinner;