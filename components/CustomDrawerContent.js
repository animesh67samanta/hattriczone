

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigationState, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CustomDrawerContent = ({ navigation }) => {
  const navigationState = useNavigationState((state) => state);
  const [screenName, setScreenName] = useState('');
  const [logInData, setLogInData] = useState(null);

  

  return (
    <View style={styles.container}>
      <View style={styles.drawerHeader}>
        <Image source={require('../assets/menu.png')} style={styles.logo} />
      </View>
      <View style={styles.menuItems}>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('MainApp', { screen: 'AboutScreen' })}
        >
          <Icon name="info-outline" size={20} style={screenName === 'AboutScreen' ? styles.activeIcon : styles.icon} />
          <Text style={screenName === 'AboutScreen' ? styles.activeItemText : styles.itemText}>About</Text>
        </TouchableOpacity>

        {logInData && (
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => navigation.navigate('MainApp', { screen: 'CarouselWithMatches' })}
          >
            <Icon name="live-tv" size={20} style={screenName === 'CarouselWithMatches' ? styles.activeIcon : styles.icon} />
            <Text style={screenName === 'CarouselWithMatches' ? styles.activeItemText : styles.itemText}>Live Matches</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate(logInData ? 'MainApp' : 'AuthStack', { screen: 'MarketScreen' })}
        >
          <Icon name="attach-money" size={20} style={screenName === 'MarketScreen' ? styles.activeIcon : styles.icon} />
          <Text style={screenName === 'MarketScreen' ? styles.activeItemText : styles.itemText}>Market</Text>
        </TouchableOpacity>

        {!logInData ? (
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => navigation.navigate('AuthStack', { screen: 'Login' })}
          >
            <Icon name="login" size={20} style={styles.icon} />
            <Text style={styles.itemText}>Login / Signup</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={async () => {
              await AsyncStorage.removeItem('loginData');
              setLogInData(null);
              navigation.navigate('AuthStack', { screen: 'Login' });
            }}
          >
            <Icon name="logout" size={20} style={styles.icon} />
            <Text style={styles.itemText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Bottom Images - Fixed position */}
       <View style={styles.bottomImagesContainer}>
         <Image source={require('../assets/add.png')} style={styles.bottomImage} />
         <Image source={require('../assets/add2.png')} style={styles.bottomImage} />
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: width * 0.75, backgroundColor: 'white', paddingTop: 33 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 3, borderBottomWidth: 2, borderBottomColor: '#DC2626' },
  logo: { width: width * 0.35, height: 40, resizeMode: 'contain' },
  menuItems: { paddingTop: 20 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, marginVertical: 2 },
  icon: { marginRight: 10, color: '#DC2626' },
  activeIcon: { marginRight: 10, color: 'black' },
  itemText: { fontSize: 16, color: 'black' },
  activeItemText: { fontSize: 16, color: '#DC2626', fontWeight: "bold" },
  bottomImagesContainer: {
    position: 'absolute',
    bottom: 50,
    left: 15,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'white',
    // paddingTop: 10,
    // borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomImage: {
    width: width * 0.65,
    // width : 270,
    height: 190, 
    resizeMode: 'cover',
    marginBottom: 15,
  },

});

export default CustomDrawerContent;
