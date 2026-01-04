import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Animated,
  StyleSheet,
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
  const { theme } = useTheme();
  
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
    <View style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
      <Animated.View
        style={[
          styles.flex1,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
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
            <View style={{ paddingHorizontal: 24, paddingTop: 48 }}>
              <TouchableOpacity
                onPress={() => setLanguage(language === "vi" ? "en" : "vi")}
                style={[styles.languageButton, { backgroundColor: '#1f2937', borderRadius: 40, width: 100 }]}
              >
                <Text style={{ flex: 1, color: theme.colors.softWhite }}>
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
            <View style={{ paddingHorizontal: 24, alignItems: 'center' }}>
              <Text style={[styles.title, { color: theme.colors.softWhite }]}>
                {currentSlide.title}
              </Text>
              <Text style={[styles.description, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                {currentSlide.description}
              </Text>

              {/* Pagination dots */}
              <View style={styles.pagination}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        width: index === currentIndex ? 24 : 8,
                        backgroundColor: index === currentIndex ? '#4ade80' : 'rgba(255, 255, 255, 0.4)',
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Buttons */}
              <View style={styles.buttonsContainer}>
                {currentIndex < slides.length - 1 ? (
                  <>
                    <TouchableOpacity
                      onPress={handleSkip}
                      style={styles.skipButton}
                    >
                      <Text style={[styles.skipText, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                        {t("onboarding_1.skip")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleNext}
                      style={[styles.nextButton, { backgroundColor: theme.colors.neonGreen, borderRadius: 25 }]}
                    >
                      <Text style={[styles.nextText, { color: theme.colors.darkBlack }]}>
                        {t("onboarding_1.next")}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={handleComplete}
                    style={[styles.doneButton, { backgroundColor: theme.colors.neonGreen, borderRadius: 25 }]}
                  >
                    <Text style={[styles.doneText, { color: theme.colors.darkBlack }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    flex: 1,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export const checkOnboardingStatus = async (): Promise<boolean> => {
  const hasSeenOnboarding = await storage.getItem(ONBOARDING_KEY);
  return hasSeenOnboarding === "true";
};

export default OnboardingScreen;
