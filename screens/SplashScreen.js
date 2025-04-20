import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, ImageBackground, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const images = [
  require('../assets/splash-icon1.png'),
];

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  // clearAppCache();
  useEffect(() => {

    const checkFirstLaunch = async () => {
      try {
        const firstLaunch = await AsyncStorage.getItem('isFirstLaunch');
        if (firstLaunch === null) {
          await AsyncStorage.setItem('isFirstLaunch', 'false');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
      }
    };

    checkFirstLaunch();
  }, []);

  useEffect(() => {
   
    if (isFirstLaunch === null) return; // Prevent rendering until AsyncStorage check is done

    
    const timer = setTimeout(() => {
      if (isFirstLaunch) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthStack', params: { screen: 'Onboarding3' } }],
        });
      } else {
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' } ],
        });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isFirstLaunch, navigation]);

  return (
    <ImageBackground style={styles.container}>
      <Animated.Image
        source={images[0]}
        style={[styles.fullScreenImage, { opacity: fadeAnim }]}
      />
      {/* <TouchableOpacity style={styles.clearCacheButton}
        onPress={clearAppCache} activeOpacity={0.8} >
        <Text style={styles.clearCacheText}>Clear Cache</Text>
      </TouchableOpacity> */}
    </ImageBackground>
  );
};

// const clearAppCache = async () => {
//   try {
//     await AsyncStorage.removeItem('isFirstLaunch');
//     console.log('Cache cleared');
//   } catch (error) {
//     console.error('Error clearing cache:', error);
//   }
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  clearCacheButton: {
    backgroundColor: '#ff5252',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    marginBottom: 20,
  },
  clearCacheText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default SplashScreen;


// import React, { useEffect, useState, useRef } from 'react';
// import { View, Animated, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const SplashScreen = ({ navigation }) => {
//   const fadeAnim = useRef(new Animated.Value(1)).current;
//   const [appReady, setAppReady] = useState(false);
//   const [isFirstLaunch, setIsFirstLaunch] = useState(null);

//   useEffect(() => {
//     const prepareApp = async () => {
//       try {
//         // Check if it's first launch
//         const firstLaunch = await AsyncStorage.getItem('isFirstLaunch');
//         if (firstLaunch === null) {
//           await AsyncStorage.setItem('isFirstLaunch', 'false');
//           setIsFirstLaunch(true);
//         } else {
//           setIsFirstLaunch(false);
//         }

//         // Check authentication status
//         const authToken = await AsyncStorage.getItem('authToken');
//         setAppReady(true);

//         // Navigate after splash duration
//         setTimeout(() => {
//           if (isFirstLaunch) {
//             navigation.replace('Onboarding3');
//           } else if (authToken) {
//             navigation.replace('MainApp');
//           } else {
//             navigation.replace('Onboarding3');
//           }
//         }, 2000); // 2 seconds splash duration

//       } catch (error) {
//         console.error('Splash screen error:', error);
//         // Fallback navigation if something fails
//         setTimeout(() => navigation.replace('Login'), 2000);
//       }
//     };

//     prepareApp();
//   }, [isFirstLaunch, navigation]);

//   // Smooth fade out animation
//   useEffect(() => {
//     if (appReady) {
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 500,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [appReady, fadeAnim]);

//   return (
//     <ImageBackground 
//       source={require('../assets/splash-icon1.png')}
//       style={styles.container}
//       resizeMode="cover"
//     >
//       <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
//         {!appReady && <ActivityIndicator size="large" color="#FFFFFF" />}
//       </Animated.View>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
// });

// export default SplashScreen;