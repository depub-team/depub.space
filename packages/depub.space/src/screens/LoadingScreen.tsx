import React, { FC, useEffect, useRef } from 'react';
import { Flex, Text } from 'native-base';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LogoText, DepubSpinner } from '../components/atoms/icons';

export const LoadingScreen: FC = () => {
  const spinningValue = useSharedValue(0);
  const opacityValue = useSharedValue(0);
  const animationTimeout = useRef(0);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: spinningValue.value,
    transform: [{ scale: spinningValue.value }, { rotateZ: `${spinningValue.value * 360 * 2}deg` }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
  }));

  const resetAnimation = () => {
    opacityValue.value = 0;

    spinningValue.value = withSpring(
      1,
      {
        stiffness: 50,
        damping: 4,
        mass: 1.5,
      },
      () => {
        opacityValue.value = withTiming(1, { duration: 500 });

        animationTimeout.current = setTimeout(() => {
          spinningValue.value = 0;

          resetAnimation();
        }, 5000) as any;
      }
    );
  };

  useEffect(() => {
    resetAnimation();

    return () => {
      clearTimeout(animationTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex alignItems="center" flex={1} justifyContent="center">
      <Animated.View style={[{ width: 200, height: 200 }, logoStyle]}>
        <DepubSpinner />
      </Animated.View>
      <Animated.View style={[{ width: 200, height: 30 }, textStyle]}>
        <Text>
          <LogoText />
        </Text>
      </Animated.View>
    </Flex>
  );
};
