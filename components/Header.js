import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    };

    checkLoginStatus();
  }, []);

  return (
    <View style={styles.header}>
      {/* Centered Logo */}
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={require('../assets/adaptive-icon.png')} style={styles.logo} />
        </TouchableOpacity>
      </View>

      {/* Profile Icon (Right Side) */}
      <TouchableOpacity
        onPress={() => navigation.navigate(isLoggedIn ? 'EditProfile' : 'Login')}
        style={styles.profileContainer}
      >
        <Image
          source={{ uri: 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg' }}
          style={styles.profilePic}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 10,
  },
  logoContainer: {
    flex: 1, // Takes up available space
    alignItems: 'center', // Centers the logo horizontally
    paddingLeft: 45,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  profileContainer: {
    padding: 0, // Adds space around the profile icon
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#ddd',
  },
});

export default Header;
