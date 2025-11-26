import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { NativeWindButton, NativeWindCard } from '../components';

const NativeWindDemoScreen: React.FC = () => {
  const { t } = useTranslation();
  const featureList = t('nativewind.featureList', {
    returnObjects: true,
  }) as string[];

  return (
    <SafeAreaView className="flex-1 bg-soft-white dark:bg-dark-black">
      <ScrollView className="flex-1 p-4">
        <Text className="text-4xl font-bold text-dark-black dark:text-soft-white mb-6">
          {t('nativewind.title')}
        </Text>

        {/* Cards Demo */}
        <NativeWindCard className="mb-4">
          <Text className="text-xl font-bold text-dark-black dark:text-soft-white mb-2">
            {t('nativewind.description')}
          </Text>
          <Text className="text-base text-medium-gray">
            {t('nativewind.subtitle')}
          </Text>
        </NativeWindCard>

        {/* Buttons Demo */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-dark-black dark:text-soft-white mb-3">
            {t('nativewind.buttonVariants')}
          </Text>
          
          <NativeWindButton
            title={t('nativewind.buttonPrimary')}
            onPress={() => console.log('Primary clicked')}
            variant="primary"
            className="mb-3"
          />
          
          <NativeWindButton
            title={t('nativewind.buttonSecondary')}
            onPress={() => console.log('Secondary clicked')}
            variant="secondary"
            className="mb-3"
          />
          
          <NativeWindButton
            title={t('nativewind.buttonOutline')}
            onPress={() => console.log('Outline clicked')}
            variant="outline"
            className="mb-3"
          />
        </View>

        {/* Sizes Demo */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-dark-black dark:text-soft-white mb-3">
            {t('nativewind.buttonSizes')}
          </Text>
          
          <NativeWindButton
            title={t('nativewind.sizeSmall')}
            onPress={() => {}}
            size="sm"
            className="mb-2"
          />
          
          <NativeWindButton
            title={t('nativewind.sizeMedium')}
            onPress={() => {}}
            size="md"
            className="mb-2"
          />
          
          <NativeWindButton
            title={t('nativewind.sizeLarge')}
            onPress={() => {}}
            size="lg"
            className="mb-2"
          />
        </View>

        {/* Custom Styling */}
        <NativeWindCard className="mb-4 bg-neon-green">
          <Text className="text-2xl font-bold text-dark-black mb-2">
            {t('nativewind.customCardTitle')}
          </Text>
          <Text className="text-base text-dark-black">
            {t('nativewind.customCardBody')}
          </Text>
        </NativeWindCard>

        {/* Grid Example */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-dark-black dark:text-soft-white mb-3">
            {t('nativewind.gridTitle')}
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1 bg-neon-green p-4 rounded-lg">
              <Text className="text-dark-black font-bold text-center">
                {t('nativewind.gridBox1')}
              </Text>
            </View>
            <View className="flex-1 bg-medium-gray p-4 rounded-lg">
              <Text className="text-white font-bold text-center">
                {t('nativewind.gridBox2')}
              </Text>
            </View>
          </View>
        </View>

        {/* Features List */}
        <NativeWindCard>
          <Text className="text-xl font-bold text-dark-black dark:text-soft-white mb-4">
            {t('nativewind.featuresTitle')}
          </Text>
          
          <View className="space-y-2">
            {featureList.map((feature) => (
              <Text key={feature} className="text-base text-medium-gray">
                ✅ {feature}
              </Text>
            ))}
          </View>
        </NativeWindCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NativeWindDemoScreen;

