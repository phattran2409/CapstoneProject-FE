import React, { useEffect, useRef } from "react";
import { View, Image, Animated } from "react-native";

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Animation for each letter
  const letterAnims = useRef(
    "kickify".split("").map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation for each letter
    const letterAnimations = letterAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 600 + index * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, letterAnimations).start();
  }, []);

  const letters = "kickify".split("");

  const colors = [
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#6B7280",
    "#6B7280",
    "#6B7280",
  ];

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="mb-5"
      >
        <Image
          source={require("../../../assets/kickify/logo_only.png")}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
      </Animated.View>

      <View className="flex-row mt-2.5">
        {letters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={{
              color: colors[index],
              opacity: letterAnims[index],
              transform: [
                {
                  translateY: letterAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
            className="text-5xl font-bold"
          >
            {letter}
          </Animated.Text>
        ))}
      </View>

      {/* Loading dots animation */}
      <LoadingDots />
    </View>
  );
};

const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(dot1, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };
    animateDots();
  }, []);

  return (
    <View className="flex-row mt-10 gap-2">
      {[dot1, dot2, dot3].map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            opacity: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.3],
                }),
              },
            ],
          }}
          className="w-2.5 h-2.5 rounded-full bg-neon-green"
        />
      ))}
    </View>
  );
};

export default SplashScreen;
