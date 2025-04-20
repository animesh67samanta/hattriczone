

import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import {
  View,
  FlatList,
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  Linking,
  Platform
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from 'axios';

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const SNAP_INTERVAL = CARD_WIDTH + 20;

const images = [
  { id: 4, name: "CRICKET", url: require("../assets/ipl.jpg"), sportId: 4 },
  { id: 1, name: "FOOTBALL", url: require("../assets/football.jpg"), sportId: 1 },
  { id: 2, name: "TENNIS", url: require("../assets/tennis.jpg"), sportId: 2 },
];


const CarouselWithMatches = () => {
  const flatListRef = useRef(null);
  const route = useRoute();
  const initialSportId = route.params?.sportId || 4;
  const [currentIndex, setCurrentIndex] = useState(
    images.findIndex((img) => img.sportId === initialSportId)
  );
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [currentMatchIndices, setCurrentMatchIndices] = useState({});
  const cancelTokenRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounted");
      }
    };
  }, []);

  const fetchData = useCallback(async (sportId) => {
    if (!isMounted) return;
    
    setRefreshing(true);
    
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("New request initiated");
    }
    
    cancelTokenRef.current = axios.CancelToken.source();

    try {
      const response = await axios.get(
        `https://api.reddyanna.com/api/get-series-redis/${sportId}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000,
          cancelToken: cancelTokenRef.current.token
        }
      );
      
      if (isMounted && response.data?.data && Array.isArray(response.data.data)) {
        const competitionsWithMatches = response.data.data
          .filter(competition => competition.match?.length > 0)
          .map(competition => ({
            id: competition.competition?.id || Date.now().toString(),
            name: competition.competition?.name || "Unknown Tournament",
            matches: competition.match.map(match => {
              const [team1Name = "", team2Name = ""] = match.event?.name?.split(" v ") || [];
              
              return {
                id: match.event?.id || Date.now().toString(),
                team1: { name: team1Name },
                team2: { name: team2Name },
                rawDate: match.event?.openDate
              };
            })
          }));

        setMatches(competitionsWithMatches);
        // Initialize all match indices to 0
        setCurrentMatchIndices(prev => {
          const newIndices = {...prev};
          competitionsWithMatches.forEach(comp => {
            if (!newIndices[comp.id]) {
              newIndices[comp.id] = 0;
            }
          });
          return newIndices;
        });
      }
    } catch (error) {
      if (isMounted && !axios.isCancel(error)) {
        const errorMessage = axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message || "Network error"
          : error.message || "Failed to fetch matches";
        
        Alert.alert("Error", errorMessage);
      }
    } finally {
      if (isMounted) {
        setRefreshing(false);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    fetchData(images[currentIndex].sportId);
  }, [currentIndex, fetchData]);

  const handleScrollEnd = useCallback((event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  }, []);

  const handleMatchPress = useCallback(async (matchId) => {
    try {
      const url = `https://allpanelpro.com/live-score/${matchId}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open the browser");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open URL");
      console.error("URL Opening Error:", error);
    }
  }, []);

  const renderCompetition = useCallback(({ item: competition, index: compIndex }) => (
    <View key={`comp-${competition.id}-${compIndex}`}>
      <View style={styles.competitionHeader}>
        <Text style={styles.competitionName} numberOfLines={1} ellipsizeMode="tail">
          {competition.name}
        </Text>
      </View>
      <View style={styles.matchesSliderContainer}>
        <FlatList
          data={competition.matches}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          decelerationRate={Platform.OS === 'ios' ? 'normal' : 'fast'}
          contentContainerStyle={styles.matchesSliderContent}
          renderItem={({ item }) => (
            <MatchCard 
              match={item} 
              competitionName={competition.name}
              onPress={() => handleMatchPress(item.id)}
            />
          )}
          onMomentumScrollEnd={handleMatchScrollEnd(competition.id)}
          keyExtractor={(match, matchIndex) => 
            `match-${match.id?.toString() || 'na'}-${compIndex}-${matchIndex}`
          }
          windowSize={5}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          updateCellsBatchingPeriod={50}
        />
        {competition.matches.length > 1 && (
          <View style={styles.matchesPagination}>
            {competition.matches.map((_, index) => (
              <View 
                key={`match-dot-${index}`} 
                style={[
                  styles.matchDot,
                  index === (currentMatchIndices[competition.id] || 0) && styles.activeMatchDot
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  ), [handleMatchPress, handleMatchScrollEnd, currentMatchIndices]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        <Text style={styles.headerWhite}>Watch </Text>
        <Text style={styles.headerRed}>Live Matches</Text>
      </Text>

      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(item) => item.id.toString()}
          initialScrollIndex={currentIndex}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={renderCarouselItem}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          removeClippedSubviews={true}
        />

        <View style={[
          styles.paginationContainer,
          matches.length === 0 && styles.paginationNoMatches
        ]}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>

      <FlatList
        style={styles.liveList}
        data={matches}
        renderItem={renderCompetition}
        keyExtractor={(competition) => competition.id.toString()}
        ListEmptyComponent={
          <View style={styles.noDataContainer}>
            <Text style={styles.noMatches}>No matches available</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(images[currentIndex].sportId)}
            colors={['#DC2626']}
            tintColor="#DC2626"
          />
        }
        windowSize={5}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerText: {
    padding: 10,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: 'black',
  },
  headerWhite: {
    color: '#fff'
  },
  headerRed: {
    color: '#DC2626'
  },
  carouselContainer: {
    height: 150,
    position: 'relative'
  },
  slide: {
    width: width,
    height: '100%',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  imageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  paginationNoMatches: {
    bottom: height * 0.02
  },
  dot: {
    width: 25,
    height: 3,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#DC2626",
  },
  liveList: {
    flex: 1,
    marginTop: 5,
  },
  competitionHeader: {
    paddingVertical: 5,
    marginVertical: 2,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  competitionName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  matchesSliderContainer: {
    height: 200,
    marginVertical: 0,
  },
  matchesSliderContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 3,
    alignItems: 'center',
  },
  matchesPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 10,
    marginBottom: 15,
    height: 20,
  },
  matchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555',
    marginHorizontal: 4,
  },
  activeMatchDot: {
    backgroundColor: '#DC2626',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ticket: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
    height: 150,
  },
  league: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  matchDate: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  team: {
    width: '35%',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  matchTime: {
    color: '#DC2626',
    // fontWeight: 'bold',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  liveButton: {
    marginTop: 5,
    backgroundColor: '#DC2626',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  liveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveIcon: {
    width: 8,
    height: 8,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  // leftNotch: {
  //   position: 'absolute',
  //   width: 20,
  //   height: 20,
  //   backgroundColor: 'black',
  //   borderRadius: 10,
  //   top: '60%',
  //   left: -10,
  //   transform: [{ translateY: -10 }],
  //   borderWidth: 1,
  //   borderColor: '#fff',
  // },
  // rightNotch: {
  //   position: 'absolute',
  //   width: 20,
  //   height: 20,
  //   backgroundColor: 'black',
  //   borderRadius: 10,
  //   top: '60%',
  //   right: -10,
  //   transform: [{ translateY: -10 }],
  //   borderWidth: 1,
  //   borderColor: '#fff',
  // },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  noMatches: {
    textAlign: "center",
    color: "#fff",
    marginTop: 20,
    fontSize: 16
  },
});

export default CarouselWithMatches;