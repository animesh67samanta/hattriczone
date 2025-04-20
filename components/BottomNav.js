

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigationState } from '@react-navigation/native';

const BottomNav = ({ navigation }) => {
  const [loginData, setIsLoggedIn] = useState(false);
  const navigationState = useNavigationState((state) => state);
  const [activeNav, setActiveNav] = useState('');

  // Update active tab based on current route
  useEffect(() => {
    if (navigationState?.routes) {
      const currentRoute = navigationState.routes[navigationState.index];
      let screenName = currentRoute.name;

      // Handle nested navigator
      if (currentRoute.state) {
        const nestedState = currentRoute.state;
        screenName = nestedState.routes[nestedState.index].name;
      }

     
  }, []);

  // Check login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem('loginData');
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
    const unsubscribe = navigation.addListener('focus', checkLoginStatus);
    return unsubscribe;
  }, [navigation]);

  

  
  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={item.action}
        >
          <Icon
            name={item.icon}
            size={18}
            color={activeNav === item.id ? '#DC2626' : 'black'}
          />
          <Text style={[
            styles.navText,
            activeNav === item.id && styles.activeNavText
          ]}>
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}

      {loginData && (
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <Icon
            name="logout"
            size={18}
            color={activeNav === 'logout' ? '#DC2626' : 'black'}
          />
          <Text style={[
            styles.navText,
            activeNav === 'logout' && styles.activeNavText
          ]}>
            Logout
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    // paddingVertical: 0,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 45,
  },
  navItem: {
    alignItems: 'center',
    // paddingHorizontal: 5,
    flex: 1,
  },
  navText: {
    fontSize: 10,
    marginTop: 2,
    color: '#666',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});

export default BottomNav;