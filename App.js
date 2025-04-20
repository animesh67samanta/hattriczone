
import * as React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Menu 
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CustomDrawerContent from './components/CustomDrawerContent';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import PaymentRequestScreen from './screens/PaymentRequestScreen';
import OnboardingScreen3 from './screens/OnboardingScreen3';
import CarouselWithMatches from './screens/CarouselWithMatchesScreen';
import MyBonusScreen from './screens/MyBonusScreen';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainLayout = ({ children, navigation }) => (
  <View style={styles.container}>
    <Header navigation={navigation} />
    <View style={styles.content}>{children}</View>
    <BottomNav navigation={navigation} />
  </View>
);

const withLayout = (Component) => (props) => (
  <MainLayout navigation={props.navigation}>
    <Component {...props} />
  </MainLayout>
);

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="Splash"
      component={SplashScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Main Stack Navigator
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={withLayout(DashboardScreen)} />
    <Stack.Screen name="EditProfile" component={withLayout(EditProfileScreen)} />
    <Stack.Screen name="PaymentMethods" component={withLayout(PaymentMethodsScreen)} />
    <Stack.Screen name="PaymentRequest" component={withLayout(PaymentRequestScreen)} />
    <Stack.Screen name="CarouselWithMatches" component={withLayout(CarouselWithMatches)} />
    <Stack.Screen name="MyBonusScreen" component={withLayout(MyBonusScreen)} />

  </Stack.Navigator>
);

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerPosition: 'left',
            headerShown: false,
            drawerType: 'slide',
            overlayColor: 'transparent',
            swipeEnabled: false,
            drawerStyle: {
              width: width * 0.80, // Set the width of the drawer
            },
          }}
          initialRouteName="AuthStack"
        >
          <Drawer.Screen
            name="AuthStack"
            component={AuthStack}
            options={{
              drawerItemStyle: { display: 'none' }, // Hide from drawer menu
              swipeEnabled: false
            }}
          />
          <Drawer.Screen
            name="MainApp"
            component={MainStack}
            options={{
              drawerLabel: 'Main App',
              swipeEnabled: false
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default App;

