import { useCallback } from 'react';

type GoBackNavigation = {
  canGoBack: () => boolean;
  goBack: () => void;
};

type ResetNavigation = {
  reset: (state: { index: number; routes: Array<{ name: 'MainTabs' }> }) => void;
};

interface UseGoBackOrResetToMainTabsParams {
  navigation?: GoBackNavigation;
  nav: ResetNavigation;
}

export const useGoBackOrResetToMainTabs = ({
  navigation,
  nav,
}: UseGoBackOrResetToMainTabsParams) =>
  useCallback(() => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
      return;
    }

    nav.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  }, [navigation, nav]);
