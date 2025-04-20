import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

const carouselImages = [
    { id: 4, name: "CRICKET", url: require("../assets/ipl.jpg"), sportId: 4 },
    { id: 1, name: "FOOTBALL", url: require("../assets/football.jpg"), sportId: 1 },
    { id: 2, name: "TENNIS", url: require("../assets/tennis.jpg"), sportId: 2 },
];

const DynamicCarousel = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
   
  const [logInData, setLogInData] = useState(null);
   

  useEffect(() => {
    const checkLoginStatus = async () => {
      const logInDataString = await AsyncStorage.getItem('loginData');
      const logInData = logInDataString ? JSON.parse(logInDataString) : null;
      setLogInData(logInData);
    };

    checkLoginStatus();
  }, []);
  const handleScrollEnd = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  const navigateToMatches = (sportId) => {
    if (!logInData) {
      navigation.navigate('AuthStack', { screen: 'Login' });
    }else{
    // navigation.navigate("CarouselWithMatches", { sportId });
    navigation.navigate('MainApp', { screen: "CarouselWithMatches",  sportId })
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToMatches(item.sportId)}>
      <View style={styles.imageContainer}>
            <Image source={item.url} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.imageText}>{item.name}</Text>
            </View>
          </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={carouselImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {carouselImages.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'black',
  },
  overlay: {
    position: "absolute",
    width: width * 0.3,
    bottom: 20,
    left: 30,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    // backgroundColor: '#DC2626',
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  imageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    width: width,
    alignItems: "center",
    marginBottom: 5,
  },
  image: {
    width: width * 0.9,
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    marginHorizontal: 10,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
  },
  dot: {
    width: 30,
    height: 3,
    backgroundColor: "#ccc",
    borderRadius: 5,
    margin: 5,
  },
  activeDot: {
    backgroundColor: "red",
  },
});

export default DynamicCarousel;
