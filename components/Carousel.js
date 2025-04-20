import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, FlatList, Image, Dimensions, Animated, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

const Carousel = ({ images, autoScroll = true, interval = 3000 }) => {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll function
  const goToNextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  }, [currentIndex]);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll) return;
    const intervalId = setInterval(goToNextSlide, interval);
    return () => clearInterval(intervalId);
  }, [goToNextSlide, interval, autoScroll]);

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={item.url} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 10,
  },
  imageContainer: {
    width: width,
    alignItems: "center",
  },
  image: {
    width: width * 1, // 100% of screen width
    height: 130,
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#ccc",
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#DC2626",
  },
});

export default Carousel;
