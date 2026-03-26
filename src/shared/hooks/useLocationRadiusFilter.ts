// ví dụ: src/shared/hooks/useLocationRadiusFilter.ts
import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

type UseLocationRadiusFilterParams = {
  t: (key: string, defaultValue?: string | object) => string;
  onChange?: (params: { latitude: number | null; longitude: number | null; radiusKm: number | null }) => void;
};

export const useLocationRadiusFilter = ({ t, onChange }: UseLocationRadiusFilterParams) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleApplyRadiusFilter = useCallback(async (radiusKmValue: number) => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'info',
          text1: t('venueSelection.locationPermissionDenied', 'Cần quyền vị trí'),
          text2: t('venueSelection.locationPermissionHint', 'Bật vị trí để lọc theo bán kính.'),
        });
        setRadiusKm(radiusKmValue);
        setLatitude(null);
        setLongitude(null);
        onChange?.({ latitude: null, longitude: null, radiusKm: radiusKmValue });
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setRadiusKm(radiusKmValue);
      onChange?.({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radiusKm: radiusKmValue,
      });
      Toast.show({
        type: 'success',
        text1: t('venueSelection.filterApplied', { km: radiusKmValue }),
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: t('venueSelection.locationError'),
        text2: t('venueSelection.locationErrorHint'),
      });
      setRadiusKm(radiusKmValue);
      onChange?.({ latitude: null, longitude: null, radiusKm: radiusKmValue });
    } finally {
      setLocationLoading(false);
    }
  }, [t, onChange]);

  return {
    latitude,
    longitude,
    radiusKm,
    locationLoading,
    handleApplyRadiusFilter,
  };
};