import React, { useState, useEffect, useCallback } from 'react';
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

  const images = [
    { id: 1, url: require("../assets/All-Panel-Pro-1.jpg") },
    { id: 2, url: require("../assets/All-Panel-Pro-2.jpg") },
    { id: 3, url: require("../assets/All-Panel-Pro-3.jpg") },
    { id: 4, url: require("../assets/All-Panel-Pro-4.jpg") },
  ];

  const fetchData = async () => {
    setRefreshing(true);
    setIsLoading(true);
    
    try {
      const logInDataString = await AsyncStorage.getItem('loginData');
      const logInData = logInDataString ? JSON.parse(logInDataString) : null;
      setLogInData(logInData);

      if (logInData?.data?.id) {
        await Promise.all([
          fetchAssignedMatchCards(logInData.data.id),
          fetchUnAssignedMatchCards(logInData.data.id)
        ]);
      } else {
        await fetchMatchCards();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleGetCredentials = async (card) => {
    if (!logInData?.data?.id) {
      navigation.navigate('AuthStack', { screen: 'Login' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', logInData.data.id);
      formData.append('game_id', card.game_id);

      const response = await axios.post(
        `${Config.API_URL}/api/request-assign-game`,
        formData,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = response.data;

      if (data.status === true) {
        setSelectedMatch({
          ...card,
          userName: data.data.username,
          password: data.data.password,
        });
        setModalVisible(true);
        await fetchData();
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch credentials.');
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      Alert.alert('Error', 'An error occurred while fetching credentials.');
    }
  };

  const openWebsite = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Unable to open this URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open website.');
    }
  };

  const fetchMatchCards = async () => {
    try {
      const response = await fetch(`${Config.API_URL}/api/games`, {
        method: 'GET',
        headers: {
          'Api-Key': Config.API_KEY,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        setMatchCards(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch match cards');
      }
    } catch (error) {
      console.error('Error fetching match cards:', error);
      throw error;
    }
  };

  const fetchAssignedMatchCards = async (id) => {
    try {
      const response = await fetch(`${Config.API_URL}/api/assigned-user-games/${id}`, {
        method: 'GET',
        headers: {
          'Api-Key': Config.API_KEY,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status && Array.isArray(data.data)) {
        setAssignMatchCards(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch assigned match cards');
      }
    } catch (error) {
      console.error('Error fetching assigned match cards:', error);
      throw error;
    }
  };

  const fetchUnAssignedMatchCards = async (id) => {
    try {
      const response = await fetch(`${Config.API_URL}/api/unassigned-user-games/${id}`, {
        method: 'GET',
        headers: {
          'Api-Key': Config.API_KEY,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status && Array.isArray(data.data)) {
        setMatchCards(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch unassigned match cards');
      }
    } catch (error) {
      console.error('Error fetching unassigned match cards:', error);
      throw error;
    }
  };

  const onRefresh = () => {
    fetchData();
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#DC2626"
      inactiveColor="#6c757d"
    />
  );

  const UnassignedScene = () => (
    <View style={styles.sceneContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} nestedScrollEnabled />
        }
      >
        <View style={styles.matchRow}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#DC2626" style={styles.loader} />
          ) : matchCards.length > 0 ? (
            matchCards.map((card, index) => (
              <View key={index} style={styles.matchCard}>
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
            <Text style={styles.noDataText}>No available panels</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );

  const AssignedScene = () => (
    <View style={styles.sceneContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} nestedScrollEnabled/>
        }
      >
        <View style={styles.matchRow}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#DC2626" style={styles.loader} />
          ) : assignMatchCards.length > 0 ? (
            assignMatchCards.map((card, index) => (
              <View key={index} style={styles.match_Card}>
                <View style={styles.team_Box}>
                  <Image 
                    source={{ uri: card.game_logo }} 
                    style={styles.team_Logo} 
                    resizeMode="contain"
                  />
                  <Text style={styles.gameName}>{card.game_name}</Text>
                </View>
                <View style={styles.walletContainer}>
                  <Text style={styles.walletText}>Your Balance: 0</Text>
                </View>
                <View style={styles.walletContainer}>
                  <Text style={styles.walletText}>Your Exposure: 0</Text>
                </View>
                <View style={styles.userContainer}>
                  <View style={styles.credentialsContainer}>
                    <Icon name="account-circle" size={12} color="#4a63ff" />
                    <Text style={styles.credentialText}>{card.username}</Text>
                    <TouchableOpacity 
                      style={styles.iconButton} 
                      onPress={() => Clipboard.setStringAsync(card.username)}
                    >
                      <Icon name="content-copy" size={12} color="#4a63ff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.credentialsContainer}>
                    <Icon name="lock" size={12} color="#ff4a4a" />
                    <Text style={styles.credentialText}> {card.password}</Text>
                    <TouchableOpacity 
                      style={styles.iconButton} 
                      onPress={() => Clipboard.setStringAsync(card.password)}
                    >
                      <Icon name="content-copy" size={12} color="#4a63ff" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.websiteButton} 
                  onPress={() => openWebsite(card.login_link)}
                >
                  <Text style={styles.buttonText}>Play Now</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No assigned panels</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'unassigned':
        return <UnassignedScene />;
      case 'assigned':
        return <AssignedScene />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          !logInData ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {!logInData && <Carousel images={images} />}

        <Text style={styles.mainHeader}>Our Live Matches</Text>
        <DynamicCarousel navigation={navigation} />
        
        <View style={styles.matchContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Our Panels</Text>
          </View>

          {!logInData ? (
            <View style={styles.matchRow}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#DC2626" style={styles.loader} />
              ) : matchCards.length > 0 ? (
                matchCards.map((card, index) => (
                  <View key={index} style={styles.matchCard}>
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
                <Text style={styles.noDataText}>No panels available</Text>
              )}
            </View>
          ) : (
            <View style={styles.tabContainer}>
              <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                renderTabBar={renderTabBar}
                style={styles.tabView}
                swipeEnabled={true}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Credentials</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeIcon}>
                <Icon name="close" size={28} color="#ff4d4d" />
              </TouchableOpacity>
            </View>

            <View style={styles.credentialSection}>
              <Text style={styles.credentialLabel}>
                <Icon name="account-circle" size={20} color="#4a63ff" /> Username
              </Text>
              <View style={styles.credentialRow}>
                <Text style={styles.modalText}>{selectedMatch?.userName}</Text>
                <TouchableOpacity 
                  onPress={() => Clipboard.setStringAsync(selectedMatch?.userName)} 
                  style={styles.copyIcon}
                >
                  <Icon name="content-copy" size={22} color="#4a63ff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.credentialSection}>
              <Text style={styles.credentialLabel}>
                <Icon name="lock" size={20} color="#ff4a4a" /> Password
              </Text>
              <View style={styles.credentialRow}>
                <Text style={styles.modalText}>{selectedMatch?.password}</Text>
                <TouchableOpacity 
                  onPress={() => Clipboard.setStringAsync(selectedMatch?.password)} 
                  style={styles.copyIcon}
                >
                  <Icon name="content-copy" size={22} color="#4a63ff" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewButton} 
              onPress={() => openWebsite(selectedMatch?.login_link)}
            >
              <Text style={styles.viewButtonText}>View Website</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sceneContainer: {
    flex: 1,
    backgroundColor: 'black',
    minHeight: Dimensions.get('window').height * 0.6,
  },
  loader: {
    marginVertical: 20,
  },
  mainHeader: {
    padding: 10,
    paddingTop: 20,
    fontSize: 25,
    fontWeight: "bold",
    color: "#DC2626",
    textAlign: "center",
    backgroundColor: 'black',
  },
  headerContainer: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    padding: 10,
    fontSize: 25,
    fontWeight: "bold",
    color: "#DC2626",
    textAlign: "center",
    backgroundColor: 'black',
  },
  tabContainer: {
    flex: 1,
    minHeight: Dimensions.get('window').height * 1.4,
  },
  tabView: {
    flex: 1,
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
  matchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'black',
    paddingBottom: 20,
  },
  matchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  matchCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
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
    fontSize: 14,
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
  noDataText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'cornflowerblue',
    textTransform: 'uppercase'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  closeIcon: {
    padding: 5,
  },
  credentialSection: {
    width: '100%',
    marginBottom: 10,
  },
  credentialLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 3,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 6,
  },
  copyIcon: {
    padding: 5,
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
});

export default NeoSportApp;