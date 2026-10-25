import { StackActions, type NavigationState, type PartialState } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { forgetTabScreens } from '@/lib/navigation/back-history';

type TabRoute = BottomTabBarProps['state']['routes'][number];

/**
 * Vindo de outra aba, abre a aba onde a pessoa parou. Tocando na aba em que já
 * está, volta para a tela inicial dela (ex.: Perfil → Endereços → Editar → Perfil).
 */
export function handleTabPress(
  navigation: BottomTabBarProps['navigation'],
  route: TabRoute,
  isFocused: boolean,
) {
  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
  if (event.defaultPrevented) return;

  if (!isFocused) {
    navigation.navigate(route.name, route.params);
    return;
  }

  const nested = route.state as NavigationState | PartialState<NavigationState> | undefined;
  if (!nested?.key) return;
  if (!nested.index) {
    // A deep link may initialize a stack with a detail/form as its only screen.
    if (nested.routes[0]?.name !== 'index') {
      forgetTabScreens(route.name);
      navigation.navigate(route.name, { screen: 'index' });
    }
    return;
  }

  forgetTabScreens(route.name);
  navigation.dispatch({ ...StackActions.popToTop(), target: nested.key });
}
