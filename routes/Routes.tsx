import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigation from '../App/navigation/BottomTabNavigation';
import { useThemeContext } from '../contexts/ui/ThemeContext';

export type RootStackParamList = {
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  const { navigationTheme } = useThemeContext();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomTabNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
