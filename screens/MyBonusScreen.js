import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  Modal,
  Animated,
  Easing
} from 'react-native';
import axios from 'axios';
import Config from '../Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const MyBonusScreen = () => {
    const [bonuses, setBonuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);
    const [redeemedIds, setRedeemedIds] = useState([]);
    const [userId, setUserId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [congratsMessage, setCongratsMessage] = useState('');
    const spinValue = new Animated.Value(0);

    // Trophy spin animation
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const startAnimation = () => {
        spinValue.setValue(0);
        Animated.timing(
            spinValue,
            {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserId();
        }, [])
    );

    useEffect(() => {
        if (userId) {
            fetchBonuses();
        }
    }, [userId]);

    const fetchUserId = async () => {
        try {
            const logInDataString = await AsyncStorage.getItem('loginData');
            const logInData = logInDataString ? JSON.parse(logInDataString) : null;
            if (logInData && logInData.data.id) {
                setUserId(logInData.data.id);
            } else {
                Alert.alert('Error', 'User ID not found in login data');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch user ID');
        }
    };

    const fetchBonuses = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${Config.API_URL}/api/get-my-bonus/${userId}`,{
                headers: {
                    'Api-Key': Config.API_KEY,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.status) {
                setBonuses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching bonuses:', error);
            Alert.alert('Error', 'Failed to fetch bonuses');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserId();
        fetchBonuses();
    }, [userId]);

    const handleRedeem = async (bonusId, gameId) => {
        if (redeemedIds.includes(bonusId)) return;

        setRedeeming(true);
        try {
            const response = await axios.get(
                `${Config.API_URL}/api/subscribe-redem/${userId}/${gameId || '0'}/${bonusId}`, 
                {
                    headers: {
                        'Api-Key': Config.API_KEY,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            if (response.data.status) {
                setCongratsMessage(`Congratulations! You've redeemed ${response.data.bonusAmount || 'your bonus'}!`);
                setShowCongrats(true);
                startAnimation();
                setRedeemedIds([...redeemedIds, bonusId]);
                fetchBonuses();
            }
        } catch (error) {
            console.error('Error redeeming bonus:', error);
            Alert.alert('Error', 'Failed to redeem bonus');
        } finally {
            setRedeeming(false);
        }
    };

    const renderBonusItem = ({ item }) => (
        <View style={styles.bonusItem}>
            <View style={styles.bonusInfo}>
                <Text style={styles.bonusAmount}>Amount: {item.bonus}</Text>
                <Text style={styles.bonusType}>Type: {item.bonus_type}</Text>
                {item.game && <Text style={styles.gameName}>Game: {item.game.name}</Text>}
                {item.coupon_code && <Text style={styles.couponCode}>Coupon: {item.coupon_code}</Text>}
                <Text style={styles.date}>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
           
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
        <View style={styles.titleContainer}>
            <Text style={styles.title}> 
             <Text style={{ color: '#000' }}>My </Text>
                        <Text style={{ color: '#DC2626' }}>Bonuses</Text>
            </Text>

            <MaterialCommunityIcons name="gift-outline" size={50} color="#DC2626" />
        </View>
            {bonuses.length === 0 ? (
                <Text style={styles.noBonusesText}>No bonuses available</Text>
            ) : (
                <FlatList
                    data={bonuses}
                    renderItem={renderBonusItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#DC2626']}
                            tintColor="#DC2626"
                        />
                    }
                    showsVerticalScrollIndicator={false} 
                    showsHorizontalScrollIndicator={false} 
                />
            )}

           
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: '#333',
    },
    listContainer: {
        paddingBottom: 20,
    },
    bonusItem: {
        backgroundColor: '#f4f4f4',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bonusInfo: {
        flex: 1,
    },
    bonusAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    bonusType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    gameName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    couponCode: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontStyle: 'italic',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    redeemButton: {
        backgroundColor: '#DC2626',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginLeft: 10,
    },
    redeemedButton: {
        backgroundColor: '#9E9E9E',
    },
    redeemButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    noBonusesText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        width: '80%',
    },
    congratsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
        marginBottom: 10,
    },
    congratsMessage: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#DC2626',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 25,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default MyBonusScreen;