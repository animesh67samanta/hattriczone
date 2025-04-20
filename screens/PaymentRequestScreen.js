


import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  TextInput,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import Config from '../Config';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const initialLayout = { width: Dimensions.get('window').width };

const PaymentRequest = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'deposit', title: 'Deposit' },
    { key: 'withdraw', title: 'Withdraw' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleWithdraw, setModalVisibleWithdraw] = useState(false);
  const [platform, setPlatform] = useState('');
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [games, setGames] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [myBankAccounts, setMyBankAccounts] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isBalanceChecked, setIsBalanceChecked] = useState(false);

  const fetchUserId = async () => {
    try {
      const logInDataString = await AsyncStorage.getItem('loginData');
      const logInData = logInDataString ? JSON.parse(logInDataString) : null;
      if (logInData && logInData.data.id) {
        setUserId(logInData.data.id);
      } else {
        setError('User ID not found in login data');
      }
    } catch (err) {
      setError('Failed to fetch user ID');
    }
  };

  
  const fetchGames = async () => {
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/assigned-user-games/${userId}`,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.status) {
        setGames(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch games');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred while fetching games'
      );
    }
  };
  const fetchBankAccounts = async () => {
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/admin-bank-accounts`,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.data.status) {
        setBankAccounts(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'An error occurred while fetching bank accounts'
      );
    }
  };

  const checkWithdrawalBalance = async (gameId) => {
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/user-withdraw-balance/${userId}/${gameId}`,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.data.status) {
        setAvailableBalance(response.data.total_balance);
        setIsBalanceChecked(true);
        if (response.data.total_balance <= 0) {
          Alert.alert('No Balance', 'You do not have any balance to withdraw for this platform.');
        }
      } else {
        Alert.alert('Error', response.data.message || 'Failed to check withdrawal balance');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 
        'An error occurred while checking withdrawal balance'
      );
    }
  };

  const handleDepositSubmit = async () => {
    if (!platform || !amount || !paymentMethod || !receipt || !utr) {
      Alert.alert('Error', 'Please fill all fields and upload a receipt.');
      return;
    }
  
    if (parseFloat(amount) > 10000) {
      Alert.alert('Error', 'Amount should be under 10,000.');
      return;
    }
  
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('game_id', platform);
    formData.append('amount', amount);
    formData.append('utr', utr);
    formData.append('admin_bank_id', paymentMethod);
    formData.append('image', {
      uri: receipt,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    });
  
    try {
      const response = await axios.post(
        `${Config.API_URL}/api/deposit-request`,
        formData,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      if (response.data.status) {
        Alert.alert('Success', response.data.message);
        setModalVisible(false);
        setPlatform(null);
        setAmount(null);
        setUtr(null);
        setPaymentMethod(null);
        setReceipt(null);
        fetchDepositRequests();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create deposit request');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'An error occurred while submitting the request'
      );
    }
  };

  const fetchDepositRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/deposit-request-list/${userId}`,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
  
     
  };

  const fetchWithdrawRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/withdraw-request-list/${userId}`,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.status) {
        setWithdrawRequests(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch withdraw requests');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'An error occurred while fetching withdraw requests'
      );
    } finally {
      setLoading(false);
    }
  };

  

  const handleWithdrawSubmit = async () => {
    if (!platform || !amount || !paymentMethod) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      Alert.alert('Error', `Amount cannot exceed available balance (₹${availableBalance})`);
      return;
    }

    if (parseFloat(amount) > 10000) {
      Alert.alert('Error', 'Amount should be under 10,000.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('game_id', platform);
    formData.append('amount', amount);
    formData.append('account_id', paymentMethod);

    try {
      const response = await fetch(
        `${Config.API_URL}/api/withdraw-request`,
        {
          method: 'POST',
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (data.status) {
        Alert.alert('Success', data.message);
        setModalVisibleWithdraw(false);
        setPlatform(null);
        setAmount(null);
        setPaymentMethod(null);
        setReceipt(null)
        setAvailableBalance(0);
        setIsBalanceChecked(false);
        fetchWithdrawRequests();
      } else {
        Alert.alert('Error', data.message || 'Failed to create withdraw request');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while submitting the request');
    }
  };

  const handleDeleteDepositRequest = async (depositId) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('deposit_id', depositId);

      const response = await fetch(
        `${Config.API_URL}/api/delete-deposit-request`,
        {
          method: 'POST',
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (data.status) {
        Alert.alert('Success', data.message);
        fetchDepositRequests();
      } else {
        Alert.alert('Error', data.message || 'Failed to delete deposit request');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while deleting the deposit request');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserId();
    }, [])
  );

  
  const DepositScene = () => (
    <ScrollView
      style={styles.scene}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}  colors={['#DC2626']} />}
    >
      <View style={styles.requestSection}>
        {depositRequests.map((request) => (
          <View key={request.deposit_id} style={styles.requestCard}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestId}>#{request.deposit_id}</Text>
              <Text style={styles.platformName}>🎮 Game ID: {request.game_id}</Text>
              <Text style={styles.requestedOn}>📅 Request: {request.created_at}</Text>
              <Text style={styles.amount}>💰 Amount: ₹{request.amount}</Text>
              <Text style={styles.platformName}># UTR: {request.utr}</Text>
              <Text style={[styles.status, getStatusStyle(request.status)]}>
                {request.status}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeleteDepositRequest(request.deposit_id)}
            >
              <Ionicons name="trash-outline" size={22} color="#DC2626" />
              <Text style={styles.deleteText} >Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );



  const renderScene = SceneMap({
    deposit: DepositScene,
    withdraw: WithdrawScene,
  });

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

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (index === 0) {
            setModalVisible(true);
          } else {
            setModalVisibleWithdraw(true);
            setAvailableBalance(0);
            setIsBalanceChecked(false);
            setPlatform('');
            setAmount('');
            setPaymentMethod('');
          }
        }}
      >
        <Ionicons
          name={index === 0 ? "add-circle" : "remove-circle"}
          size={40}
          color="#DC2626"
        />
      </TouchableOpacity>

      {/* Modal for Deposit Request */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setModalVisible(false);
                setPlatform(null);
                setAmount(null);
                setUtr(null);
                setPaymentMethod(null);
                setReceipt(null);
                fetchDepositRequests();
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Create Deposit Request</Text>

            {/* <Text style={styles.label}>Choose Platform</Text> */}
            <Picker selectedValue={platform} onValueChange={setPlatform} style={styles.picker}>
              <Picker.Item label="Choose platform" value="" />
              {games.map((game) => (
                <Picker.Item key={game.game_id} label={game.game_name} value={game.game_id} />
              ))}
            </Picker>

            {/* <Text style={styles.label}>Amount</Text> */}
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={amount}
              onChangeText={(text) => {
                // Remove non-numeric characters
                const numericValue = text.replace(/[^0-9]/g, '');

                // Check if the value is within the limit
                if (numericValue === '' || (Number(numericValue) <= 10000)) {
                  setAmount(numericValue);
                }
              }}
              keyboardType="numeric"
              maxLength={5} // This prevents entering more than 5 digits (since 10000 is 5 digits)
            />
            {/* <Text style={styles.label}>UTR Number</Text> */}
            <TextInput style={styles.input} placeholder="Enter UTR number"
              value={utr} onChangeText={setUtr} />
            {/* <Text style={styles.label}>Select Payment Method</Text> */}
            <Picker selectedValue={paymentMethod} onValueChange={setPaymentMethod} style={styles.picker}>
              <Picker.Item label="Choose Account" value="" />
              {Object.entries(bankAccounts).map(([type, accounts]) =>
                accounts.map((account) => (
                  <Picker.Item key={account.id} label={`${type} - ${account.account_holder_name}`} value={account.id} />
                ))
              )}
            </Picker>

            <Text style={styles.label}>Upload Payment Receipt</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Text style={styles.uploadBtnText}>Choose Image</Text>
            </TouchableOpacity>
            {receipt && (
              <Image source={{ uri: receipt }} style={styles.receiptImage} />
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleDepositSubmit}>
              <Text style={styles.submitBtnText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Withdraw Request */}
      <Modal visible={modalVisibleWithdraw} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisibleWithdraw(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Withdraw Request</Text>

            {/* <Text style={styles.label}>Choose Platform</Text> */}
            <Picker
              selectedValue={platform}
              onValueChange={(itemValue) => {
                setPlatform(itemValue);
                if (itemValue) {
                  checkWithdrawalBalance(itemValue);
                } else {
                  setAvailableBalance(0);
                  setIsBalanceChecked(false);
                }
              }}
              style={styles.picker}
            >
              <Picker.Item label="Choose platform" value="" />
              {games.map((game) => (
                <Picker.Item key={game.game_id} label={game.game_name} value={game.game_id} />
              ))}
            </Picker>

            {/* <Text style={styles.label}>Enter Amount (Available: ₹{availableBalance})</Text> */}
            <TextInput
              style={styles.input}
              placeholder={`Enter amount (max ₹${availableBalance})`}
              value={amount}
              onChangeText={(text) => {
                if (parseFloat(text) > availableBalance) {
                  Alert.alert('Error', `Amount cannot exceed available balance (₹${availableBalance})`);
                  return;
                }
                setAmount(text);
              }}
              keyboardType="numeric"
              editable={availableBalance > 0}
            />

            {/* <Text style={styles.label}>Select Payment Method</Text> */}
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(itemValue) => setPaymentMethod(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Choose payment method" value="" />
              {myBankAccounts['bank-transfer'] &&
                myBankAccounts['bank-transfer'].map((bank) => (
                  <Picker.Item
                    key={bank.id}
                    label={`Bank: ${bank.bank_name} (${bank.account_holder_name})`}
                    value={bank.id}
                  />
                ))}
              {myBankAccounts.upi &&
                myBankAccounts.upi.map((upi) => (
                  <Picker.Item
                    key={upi.id}
                    label={`UPI: ${upi.upi_number} (${upi.account_holder_name})`}
                    value={upi.id}
                  />
                ))}
              {myBankAccounts.crypto &&
                myBankAccounts.crypto.map((crypto) => (
                  <Picker.Item
                    key={crypto.id}
                    label={`Crypto: ${crypto.crypto_wallet} (${crypto.account_holder_name})`}
                    value={crypto.id}
                  />
                ))}
            </Picker>

            <TouchableOpacity
              style={[styles.submitBtn, (availableBalance <= 0 || !isBalanceChecked) && styles.disabledBtn]}
              onPress={handleWithdrawSubmit}
              disabled={availableBalance <= 0 || !isBalanceChecked}
            >
              <Text style={styles.submitBtnText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return { backgroundColor: '#ffc107', color: '#fff' };
    case 'approved':
      return { backgroundColor: '#28a745', color: '#fff' };
    case 'rejected':
      return { backgroundColor: '#dc3545', color: '#fff' };
    default:
      return { backgroundColor: '#6c757d', color: '#fff' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scene: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tabLabel: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  indicator: {
    backgroundColor: '#DC2626',
    height: 3,
  },
  requestSection: {
    padding: 15,
    paddingBottom: 30, // Add padding for FAB
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestInfo: {
    flex: 1,
  },
  requestId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0b0d0c',
  },
  deleteText: {
    color: '#DC2626',
  },
  platformName: {
    fontSize: 12,
    marginTop: 5,
    color: '#0b0d0c',
  },
  requestedOn: {
    fontSize: 12,
    marginTop: 5,
    color: '#0b0d0c',
  },
  amount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 5,
  },
  utr: {
    fontSize: 12,
    marginTop: 5,
    color: '#0b0d0c',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    paddingVertical: 8,
    borderRadius: 5,
    textAlign: 'center',
    width: 100,
    textTransform: 'uppercase',
  },
  deleteBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#495057',
  },
  picker: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    padding: 12,
    // borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  uploadBtn: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  submitBtn: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledBtn: {
    backgroundColor: '#cccccc',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});


export default PaymentRequest;