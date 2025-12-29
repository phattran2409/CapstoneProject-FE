import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { storage } from "@/shared/utils/storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { useAppStore } from "@/store/appStore";
const { width, height } = Dimensions.get("window");

const ONBOARDING_KEY = "hasSeenOnboarding";

interface OnboardingSlide {
  id: number;
  image: any;
  title: string;
  description: string;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const { t } = useTranslation();
  const theme = useTheme();
  const handleComplete = async () => {
    await storage.setItem(ONBOARDING_KEY, "true");
    onComplete();
  };

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      image: require("@/assets/kickify/onBoarding_1.png"),
      title: t("onboarding_1.title"),
      description: t("onboarding_1.description"),
    },
    {
      id: 2,
      image: require("@/assets/kickify/onBoarding_2.png"),
      title: t("onboarding_2.title"),
      description: t("onboarding_2.description"),
    },
    {
      id: 3,
      image: require("@/assets/kickify/onBoarding_3.png"),
      title: t("onboarding_3.title"),
      description: t("onboarding_3.description"),
    },
  ];

  const animateTransition = (nextIndex: number) => {
    // Fade out + slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: nextIndex > currentIndex ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(nextIndex);
      slideAnim.setValue(nextIndex > currentIndex ? 50 : -50);

      // Fade in + slide back
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      animateTransition(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentSlide = slides[currentIndex];

  return (
    <View className="flex-1 bg-black">
      <Animated.View
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        <ImageBackground
          source={currentSlide.image}
          style={{ flex: 1, width: width, height: height }}
          resizeMode="cover"
        >
          {/* Top gradient overlay */}
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: height * 0.25,
            }}
          >
            <View className="px-6 pt-12">
              <TouchableOpacity
                onPress={() => setLanguage(language === "vi" ? "en" : "vi")}
                className="flex-row items-center px-5 py-3 mb-2 bg-gray-800 rounded-[40px] w-[100px]"
              >
                <Text className="flex-1 text-white">
                  {language === "vi" ? "Tiếng Việt" : "English "}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Bottom gradient overlay - more intense */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.95)"]}
            locations={[0, 0.3, 1]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: height * 0.55,
              justifyContent: "flex-end",
              paddingBottom: 50,
            }}
          >
            {/* Content */}
            <View className="px-6 items-center">
              <Text className="text-3xl font-bold text-white text-center mb-3">
                {currentSlide.title}
              </Text>
              <Text className="text-base text-white/80 text-center leading-6 mb-8">
                {currentSlide.description}
              </Text>

              {/* Pagination dots */}
              <View className="flex-row justify-center mb-8">
                {slides.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 rounded mx-1 ${
                      index === currentIndex
                        ? "w-6 bg-green-400"
                        : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </View>

              {/* Buttons */}
              <View className="flex-row justify-between w-full px-2">
                {currentIndex < slides.length - 1 ? (
                  <>
                    <TouchableOpacity
                      onPress={handleSkip}
                      className="py-3.5 px-6"
                    >
                      <Text className="text-white/70 text-base">
                        {t("onboarding_1.skip")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleNext}
                      className="bg-neon-green py-3.5 px-8 rounded-[25px]"
                    >
                      <Text className="text-black text-base font-semibold">
                        {t("onboarding_1.next")}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={handleComplete}
                    className="bg-neon-green py-3.5 px-8 rounded-[25px] flex-1 items-center"
                  >
                    <Text className="text-black text-base font-semibold">
                      {t("onboarding_1.done")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

export const checkOnboardingStatus = async (): Promise<boolean> => {
  const hasSeenOnboarding = await storage.getItem(ONBOARDING_KEY);
  return hasSeenOnboarding === "true";
};

export default OnboardingScreen;
