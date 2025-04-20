// // import React from 'react';
// // import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { Ionicons } from '@expo/vector-icons'; // Import arrow icon

// // const OnboardingScreen3 = ({ navigation }) => {
// //   const completeOnboarding = async () => {
// //     try {
// //       await AsyncStorage.setItem('onboardingComplete', 'true');
// //       navigation.replace('Dashboard'); // Use replace to prevent going back to onboarding
// //     } catch (error) {
// //       console.error('Error saving onboarding status:', error);
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Image source={require('../assets/logo.png')} style={styles.image} />
// //       <Text style={styles.title}>Ready to Get Started?</Text>
// //       <Text style={styles.description}>
// //         Join A.P.P and enjoy the best sports experience.
// //       </Text>

// //       {/* Updated Animated Button */}
// //       <TouchableOpacity style={styles.button} onPress={completeOnboarding}>
// //         <Text style={styles.buttonText}>Get Started</Text>
// //         <Ionicons name="arrow-forward" size={24} color="#fff" style={styles.icon} />
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 20,
// //     backgroundColor: '#fff', // Dark-themed modern look
// //   },
// //   image: {
// //     width: 180,
// //     height: 180,
// //     resizeMode: 'contain',
// //   },
// //   title: {
// //     fontSize: 26,
// //     fontWeight: 'bold',
// //     color: '#363f43',
// //     marginTop: 20,
// //   },
// //   description: {
// //     fontSize: 16,
// //     textAlign: 'center',
// //     color: '#f44031',
// //     marginVertical: 15,
// //   },
// //   button: {
// //     flexDirection: 'row', // Align text & icon horizontally
// //     alignItems: 'center',
// //     backgroundColor: '#333',
// //     paddingVertical: 14,
// //     paddingHorizontal: 40,
// //     borderRadius: 30,
// //     marginTop: 20,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.3,
// //     shadowOffset: { width: 2, height: 2 },
// //     elevation: 5, // For Android shadow effect
// //   },
// //   buttonText: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#f44031',
// //   },
// //   icon: {
// //     marginLeft: 10, // Space between text & arrow
// //   },
// // });

// // export default OnboardingScreen3;
// ####### BKP code

// import React, { useRef, useState } from 'react';
// import { View, Text, StyleSheet, Image, FlatList, Dimensions, TouchableOpacity } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');

// const slides = [
//   {
//     id: '1',
//     image: require('../assets/logo.png'),
//     title: 'Welcome to A.P.P!',
//     description: 'Experience the best sports coverage.',
//   },
//   {
//     id: '2',
//     image: require('../assets/logo.png'),
//     title: 'Track Live Scores',
//     description: 'Stay updated with real-time scores and highlights.',
//   },
//   {
//     id: '3',
//     image: require('../assets/logo.png'),
//     title: 'Ready to Get Started?',
//     description: 'Join A.P.P and enjoy the best sports experience.',
//   },
// ];

// const OnboardingScreen3 = ({ navigation }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef(null);

//   const completeOnboarding = async () => {
//     try {
//       await AsyncStorage.setItem('onboardingComplete', 'true');
//       navigation.navigate('MainApp', { screen: 'Dashboard' });

//     } catch (error) {
//       console.error('Error saving onboarding status:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ref={flatListRef}
//         data={slides}
//         keyExtractor={(item) => item.id}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onMomentumScrollEnd={(event) => {
//           const index = Math.round(event.nativeEvent.contentOffset.x / width);
//           setCurrentIndex(index);
//           if (index === slides.length - 1) {
//             completeOnboarding();
//           }
//         }}
//         renderItem={({ item }) => (
//           <View style={styles.slide}>
//             <Image source={item.image} style={styles.image} />
//             <Text style={styles.title}>{item.title}</Text>
//             <Text style={styles.description}>{item.description}</Text>
//           </View>
//         )}
//       />

//       <View style={styles.dotsContainer}>
//         {slides.map((_, index) => (
//           <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
//         ))}
//       </View>

//       <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
//         <Ionicons name="arrow-forward" size={24} color="#f44031" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   slide: {
//     width: width,
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   image: {
//     width: 200,
//     height: 200,
//     resizeMode: 'contain',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 20,
//   },
//   description: {
//     fontSize: 16,
//     textAlign: 'center',
//     color: '#555',
//     marginVertical: 15,
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     position: 'absolute',
//     bottom: 80,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#bbb',
//     marginHorizontal: 5,
//   },
//   activeDot: {
//     backgroundColor: 'red',
//   },
//   skipButton: {
//     position: 'absolute',
//     bottom: 100,
//     right: 20,
//     padding: 10,
//   },
//   skipText: {
//     fontSize: 16,
//     color: '#f44031',
//   },
// });

// export default OnboardingScreen3;

// ########  BKP code

import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  Dimensions, 
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/IMG_6130.png'),
    title: 'Welcome to A.P.P!',
    description: 'Experience the best sports coverage.',
  },
  {
    id: '2',
    image: require('../assets/IMG_6132.png'),
    title: 'Track Live Scores',
    description: 'Stay updated with real-time scores and highlights.',
  },
  {
    id: '3',
    image: require('../assets/IMG_6133.png'),
    title: 'Ready to Get Started?',
    description: 'Join A.P.P and enjoy the best sports experience.',
  },
];

const OnboardingScreen3 = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      navigation.navigate('MainApp', { screen: 'Dashboard' });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderButton = () => {
    if (currentIndex === slides.length - 1) {
      return (
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={completeOnboarding}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={12} color="#fff" />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={completeOnboarding}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="arrow-forward" size={12} color="#fff" />
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView >
      <StatusBar hidden />
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image 
              source={item.image} 
              style={styles.fullScreenImage} 
              resizeMode="cover"
            />
            <View style={styles.textOverlay}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />
      
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
        ))}
      </View>

      {renderButton()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width: width,
    height: height,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    marginHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#f44031',
  },
  skipButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44031',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 25,
  },
  skipText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 5,
  },
  getStartedButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44031',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 25,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 5,
  },
});

export default OnboardingScreen3;