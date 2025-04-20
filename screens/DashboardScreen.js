import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import DynamicCarousel from '../components/DynamicCarousel';
import Carousel from '../components/Carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import Config from '../Config';

const initialLayout = { width: Dimensions.get('window').width };

const NeoSportApp = ({ navigation }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [logInData, setLogInData] = useState(null);
  const [matchCards, setMatchCards] = useState([]);
  const [assignMatchCards, setAssignMatchCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'assigned', title: 'Assigned' },
    { key: 'unassigned', title: 'Not Assigned' },
  ]);

  // Memoize static images to prevent unnecessary re-renders
  const images = useMemo(() => [
    { id: 1, url: require("../assets/All-Panel-Pro-1.jpg") },
    { id: 2, url: require("../assets/All-Panel-Pro-2.jpg") },
    { id: 3, url: require("../assets/All-Panel-Pro-3.jpg") },
    { id: 4, url: require("../assets/All-Panel-Pro-4.jpg") },
  ], []);

  // Memoize the openWebsite function
  const openWebsite = useCallback((url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error("Failed to open URL:", err);
        Alert.alert('Error', 'Failed to open website');
      });
    }
  }, []);

  // Fetch data with error handling and retries
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setRefreshing(true);

    try {
      const logInDataString = await AsyncStorage.getItem('loginData');
      const parsedLogInData = logInDataString ? JSON.parse(logInDataString) : null;
      setLogInData(parsedLogInData);

      const userId = parsedLogInData?.data?.id;
      if (userId) {
        // Parallel fetching for better performance
        await Promise.all([
          fetchWithRetry(() => fetchAssignedMatchCards(userId)), 
          fetchWithRetry(() => fetchUnAssignedMatchCards(userId))
        ]);
      } else {
        await fetchWithRetry(fetchMatchCards);
      }
    } catch (error) {
      handleFetchError(error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // Generic fetch with retry mechanism
  const fetchWithRetry = async (fetchFunction, retries = 3, delay = 1000) => {
    try {
      return await fetchFunction();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(fetchFunction, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Centralized error handling
  const handleFetchError = (error) => {
    console.error('Fetch error:', error);
    let errorMessage = 'Failed to load data. Please try again.';

    if (error.message.includes('Network Error')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. The server may be busy.';
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = 'Session expired. Please login again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }

    Alert.alert('Error', errorMessage);
  };

 
  const onRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Memoize tab bar to prevent unnecessary re-renders
  const renderTabBar = useCallback(props => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#DC2626"
      inactiveColor="#fff"
    />
  ), []);

  // Memoize scenes to prevent unnecessary re-renders
  const UnassignedScene = useCallback(() => (
    <View style={{ flex: 1 }}>
      <View style={styles.matchRow}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#DC2626" />
        ) : matchCards.length > 0 ? (
          matchCards.map((card, index) => (
            <View key={`unassigned-${index}`} style={styles.matchCard}>
              <View style={styles.teamBox}>
                <Image
                  source={{ uri: card.game_logo }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
                <Text style={styles.gameName}>{card.game_name}</Text>
              </View>
              <TouchableOpacity
                style={styles.websiteButton}
                onPress={() => handleGetCredentials(card)}
              >
                <Text style={styles.credentialsButtonText}>Account Request</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No available panels</Text>
          </View>
        )}
      </View>
    </View>
  ), [isLoading, matchCards, handleGetCredentials]);


  // Memoize the scene map
  const renderScene = useMemo(() => SceneMap({
    unassigned: UnassignedScene,
    assigned: AssignedScene,
  }), [UnassignedScene, AssignedScene]);

  // Fetch data on focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#DC2626']}
        />
      }
    >
      {!logInData && (
        <Carousel images={images} />
      )}

      <View style={styles.headerContainer}>
        <Text style={styles.mainHeader}>
          <Text style={{ color: '#fff' }}>Watch </Text>
          <Text style={{ color: '#DC2626' }}>Live Matches</Text>
        </Text>
      </View>
      <DynamicCarousel navigation={navigation} />

      <View style={styles.matchContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.mainHeader}>
            <Text style={{ color: '#fff' }}>Our </Text>
            <Text style={{ color: '#DC2626' }}>Panels</Text>
          </Text>
        </View>

        {!logInData ? (
          <View style={styles.matchRow}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#DC2626" />
            ) : matchCards.length > 0 ? (
              matchCards.map((card, index) => (
                <View key={`unauth-${index}`} style={styles.matchCard}>
                  <View style={styles.teamBox}>
                    <Image
                      source={{ uri: card.game_logo }}
                      style={styles.teamLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.gameName}>{card.game_name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.websiteButton}
                    onPress={() => navigation.navigate("AuthStack", { screen: "Login" })}
                  >
                    <Text style={styles.credentialsButtonText}>View Login</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No panels available</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={{ minHeight: Dimensions.get('window').height * 1.8 }}>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={initialLayout}
              renderTabBar={renderTabBar}
              style={styles.tabView}
              swipeEnabled={false}
            />
          </View>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Credentials</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeIcon}>
                <Icon name="close" size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            <View style={styles.credentialSection}>
              <Text style={styles.credentialLabel}>
                <Icon name="account-circle" size={16} color="#4a63ff" style={styles.icon} />
                Username
              </Text>
              <View style={styles.credentialRow}>
                <Text style={styles.modalText} numberOfLines={1} ellipsizeMode="tail">
                  {selectedMatch?.userName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setStringAsync(selectedMatch?.userName);
                    Alert.alert('Copied', 'Username copied to clipboard');
                  }}
                  style={styles.copyIcon}
                >
                  <Icon name="content-copy" size={18} color="#4a63ff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.credentialSection}>
              <Text style={styles.credentialLabel}>
                <Icon name="lock" size={16} color="#ff4a4a" style={styles.icon} />
                Password
              </Text>
              <View style={styles.credentialRow}>
                <Text style={styles.modalText} numberOfLines={1} ellipsizeMode="tail">
                  {selectedMatch?.password}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setStringAsync(selectedMatch?.password);
                    Alert.alert('Copied', 'Password copied to clipboard');
                  }}
                  style={styles.copyIcon}
                >
                  <Icon name="content-copy" size={18} color="#4a63ff" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => openWebsite(selectedMatch?.login_link)}
            >
              <Icon name="open-in-new" size={20} color="white" />
              <Text style={styles.viewButtonText}>Open Website</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  mainHeader: {
    padding: 10,
    paddingTop: 20,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: 'black',
  },
  headerContainer: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flex: 1,
    minHeight: Dimensions.get('window').height * 1,
  },
  tabView: {
    flex: 1,
    minHeight: Dimensions.get('window').height * 1,

  },
  tabBar: {
    backgroundColor: 'black',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  indicator: {
    backgroundColor: '#DC2626',
    height: 3,
  },
  sceneContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  matchContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  matchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  matchCard: {
    width: '45%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  match_Card: {
    width: '45%',
    backgroundColor: 'white',
    paddingBottom: 15,
    paddingTop: 5,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  teamBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  team_Box: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: 80,
    padding: 10,
    marginBottom: 5,
    borderRadius: 10,
  },
  teamLogo: {
    width: 100,
    height: 50,
    marginBottom: 2,
  },
  team_Logo: {
    width: 120,
    height: 60,
    marginBottom: 2,
  },
  userContainer: {
    marginTop: 5,
  },
  credentialsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 0,
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 5,
    width: '100%',
    paddingHorizontal: 30,
    marginVertical: 1,
  },
  iconButton: {
    padding: 6,
  },
  websiteButton: {
    flexDirection: 'row',
    marginTop: 10,
    paddingBottom: 5,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 5,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  credentialsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  credentialText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  walletText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  gameName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1a1a1a', // Dark background
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  closeIcon: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
  },
  credentialSection: {
    width: '100%',
    marginBottom: 16,
  },
  credentialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  copyIcon: {
    padding: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 10,
    marginLeft: 10,
  },
  viewButton: {
    backgroundColor: '#4a63ff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  icon: {
    marginRight: 8,
  },

  viewButton: {
    backgroundColor: '#4a63ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  noDataText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default NeoSportApp;