import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Config from '../Config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const initialLayout = { width: Dimensions.get('window').width };

const PaymentMethodsScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('bank-transfer');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiNumber, setUpiNumber] = useState('');
  const [upiQRCode, setUpiQRCode] = useState(null);
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [cryptoQRCode, setCryptoQRCode] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Tab view state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'all', title: 'All' },
    { key: 'bank', title: 'Bank' },
    { key: 'upi', title: 'UPI' },
    { key: 'crypto', title: 'Crypto' },
  ]);

  useFocusEffect(
    useCallback(() => {
      fetchUserId();
    }, [])
  );

  useEffect(() => {
    if (userId) {
      fetchPaymentMethods();
    }
  }, [userId]);

  const fetchUserId = async () => {
    try {
      const logInDataString = await AsyncStorage.getItem('loginData');
      const logInData = logInDataString ? JSON.parse(logInDataString) : null;
      if (logInData && logInData.data.id) {
        setUserId(logInData.data.id);
      } else {
        navigation.navigate('AuthStack', { screen: 'Login' });

        // Alert.alert('Error', 'User ID not found in login data');
      }
    } catch (err) {
      navigation.navigate('AuthStack', { screen: 'Login' });

      // Alert.alert('Error', 'Failed to fetch user ID');
    }
  };

  const fetchPaymentMethods = async () => {
    setLoading(true);
    setRefreshing(true);

    try {
      const response = await axios.get(
        `${Config.API_URL}/api/get-payment-details/${userId}`,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data?.status) {
        const formattedMethods = formatPaymentMethods(response.data.data);
        setPaymentMethods(formattedMethods);
      } else {
        throw new Error(response.data?.message || 'Invalid response format');
      }
    } catch (error) {
      let errorMessage = 'An error occurred while fetching payment methods.';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with status code outside 2xx
          errorMessage = error.response.data?.message ||
            `Server error: ${error.response.status}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'Network error - Please check your internet connection';
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      // console.error('Error fetching payment methods:', error);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPaymentMethods();
  };

  const formatPaymentMethods = (data) => {
    const formattedMethods = [];

    if (data && typeof data === 'object') {
      if (Array.isArray(data['bank-transfer'])) {
        data['bank-transfer'].forEach((method) => {
          formattedMethods.push({
            id: method.id,
            type: 'bank',
            account_holder_name: method.account_holder_name || 'Not Provided', // Handle null case
            bank_name: method.bank_name,
            account_number: method.account_number,
            ifsc_code: method.ifc_number,
            details: `Bank: ${method.bank_name}, A/C: ${method.account_number ? method.account_number.slice(-4) : 'N/A'}`,
          });
        });
      }

      if (Array.isArray(data.upi)) {
        data.upi.forEach((method) => {
          formattedMethods.push({
            id: method.id,
            type: 'upi',
            account_holder_name: method.account_holder_name || 'Not Provided', // Handle null case
            upi_number: method.upi_number,
            details: `UPI ID: ${method.upi_number || 'N/A'}`,
          });
        });
      }

      if (Array.isArray(data.crypto)) {
        data.crypto.forEach((method) => {
          formattedMethods.push({
            id: method.id,
            type: 'crypto',
            account_holder_name: method.account_holder_name || 'Not Provided', // Handle null case
            crypto_wallet: method.crypto_wallet,
            details: method.crypto_wallet
              ? `Wallet: ${method.crypto_wallet.slice(0, 6)}...${method.crypto_wallet.slice(-4)}`
              : 'Wallet: N/A',
          });
        });
      }
    }

    return formattedMethods;
  };
 
  const renderScene = SceneMap({
    all: AllTab,
    bank: BankTab,
    upi: UpiTab,
    crypto: CryptoTab,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.label}
      activeColor="#DC2626"
      inactiveColor="#666"
      pressColor="rgba(108, 92, 231, 0.2)"
    />
  );

  const PaymentCard = ({ payment, onDelete, type }) => {
    const getIcon = () => {
      switch (type) {
        case 'bank': return 'account-balance';
        case 'upi': return 'smartphone';
        case 'crypto': return 'currency-bitcoin';
        default: return 'payment';
      }
    };

    const getColor = () => {
      switch (type) {
        case 'bank': return '#7BDCB5';
        case 'upi': return '#FCB900';
        case 'crypto': return '#FF6900';
        default: return 'black';
      }
    };

    const truncateName = (name) => {
      if (!name) return 'Not Provided';
      if (name.length > 20) {
        return `${name.substring(0, 20)}...`;
      }
      return name;
    };

    return (
      <View style={[styles.card, { borderLeftColor: getColor(), borderLeftWidth: 3, borderRightColor: getColor(), borderRightWidth: 0.7 }]}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Account Holder Name: </Text>
          <Text style={styles.cardValue}>{truncateName(payment.account_holder_name)}</Text>
        </View>



        {type === 'bank' && (
          <>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Bank:</Text>
              <Text style={styles.cardValue}>{payment.bank_name}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Account:</Text>
              <Text style={styles.cardValue}>•••• {payment.account_number?.slice(-4)}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>IFSC:</Text>
              <Text style={styles.cardValue}>{payment.ifsc_code}</Text>
            </View>
          </>
        )}

        {type === 'upi' && (
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>UPI ID:</Text>
            <Text style={styles.cardValue}>{payment.upi_number}</Text>
          </View>
        )}

        {type === 'crypto' && (
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Wallet:</Text>
            <Text style={styles.cardValue}>
              {payment.crypto_wallet?.slice(0, 6)}...{payment.crypto_wallet?.slice(-4)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: '#DC2626' }]}
          onPress={onDelete}
        >
          <Icon name="delete" size={18} color="white" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleUploadUPIQRCode = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setUpiQRCode(result.assets[0].uri);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentType) {
      case 'bank-transfer':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Bank Name"
              value={bankName}
              onChangeText={setBankName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="IFSC Code"
              value={ifscCode}
              onChangeText={setIfscCode}
              placeholderTextColor="#999"
            />
          </>
        );
      case 'upi':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="UPI Number"
              value={upiNumber}
              onChangeText={setUpiNumber}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadUPIQRCode}>
              <Icon name="photo-camera" size={20} color="white" />
              <Text style={styles.uploadButtonText}>Upload UPI QR Code</Text>
            </TouchableOpacity>
            {upiQRCode && (
              <Image source={{ uri: upiQRCode }} style={styles.qrCodeImage} />
            )}
          </>
        );
      case 'crypto':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Crypto Wallet Address"
              value={cryptoWalletAddress}
              onChangeText={setCryptoWalletAddress}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadUPIQRCode}>
              <Icon name="photo-camera" size={20} color="white" />
              <Text style={styles.uploadButtonText}>Upload Crypto QR Code</Text>
            </TouchableOpacity>
            {upiQRCode && (
              <Image source={{ uri: upiQRCode }} style={styles.qrCodeImage} />
            )}
          </>
        );
      default:
        return null;
    }
  };

  const savePaymentDetails = async (paymentData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append all payment data - Moved account_holder_name outside the conditional
      formData.append('user_id', paymentData.user_id);
      formData.append('payment_method', paymentData.payment_method);
      formData.append('account_holder_name', paymentData.account_holder_name || ''); // Always include this field

      // Append payment type specific fields
      if (paymentData.payment_method === 'bank-transfer') {
        formData.append('bank_name', paymentData.bank_name || '');
        formData.append('account_number', paymentData.account_number || '');
        formData.append('ifc_number', paymentData.ifc_number || '');
      }
      else if (paymentData.payment_method === 'upi') {
        formData.append('upi_number', paymentData.upi_number || '');
        if (paymentData.upi_qr_code) {
          formData.append('upi_qr_code', {
            uri: paymentData.upi_qr_code,
            name: 'upi_qr_code.jpg',
            type: 'image/jpeg',
          });
        }
      }
      else if (paymentData.payment_method === 'crypto') {
        formData.append('crypto_wallet', paymentData.crypto_wallet || '');
      }
      console.log(formData);

      const response = await axios.post(
        `${Config.API_URL}/api/save-payment-details`,
        formData,
        {
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 15000,
          transformRequest: (data) => data,
        }
      );

      if (response.data?.status === true) {
        Alert.alert('Success', 'Payment details saved successfully!');
        fetchPaymentMethods();
        setModalVisible(false);
        resetForm();
      } else {
        throw new Error(response.data?.message || 'Failed to save payment details');
      }
    } catch (error) {
      // Error handling remains the same
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    // Validate payment type selection
    if (!paymentType) {
      Alert.alert('Error', 'Please select a payment type.');
      return;
    }

    // Validate account holder name for ALL payment types
    if (!accountHolderName || accountHolderName.trim() === '') {
      Alert.alert('Error', 'Please enter account holder name');
      return;
    }

   
  const resetForm = () => {
    setBankName('');
    setAccountHolderName('');
    setAccountNumber('');
    setIfscCode('');
    setUpiNumber('');
    setUpiQRCode(null);
    setCryptoWalletAddress('');
    setCryptoQRCode(null);
  };

  const handleDeletePayment = async (id) => {
    Alert.alert('Delete Payment', 'Are you sure you want to delete this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const response = await fetch(`${Config.API_URL}/api/delete-payment-details`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Api-Key': Config.API_KEY,
              },
              body: JSON.stringify({
                user_id: userId,
                id: id,
              }),
            });

            const responseText = await response.text();
            const data = JSON.parse(responseText);

            if (data?.status === true) {
              setPaymentMethods(paymentMethods.filter((payment) => payment.id !== id));
              Alert.alert('Success', 'Payment method deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete payment method.');
            }
          } catch (error) {
            console.error('Error deleting payment method:', error);
            Alert.alert('Error', 'An error occurred while deleting the payment method.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        swipeEnabled={true}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Icon name="add" size={20} color="white" />
        <Text style={styles.addButtonText}>Add Payment Method</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Icon name="close" size={24} color="#DC2626" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add Payment Method</Text>

            <View style={styles.paymentTypeContainer}>
              {[
                { type: 'bank-transfer', label: 'Bank', icon: 'account-balance' },
                { type: 'upi', label: 'UPI', icon: 'smartphone' },
                { type: 'crypto', label: 'Crypto', icon: 'currency-bitcoin' },
              ].map(({ type, label, icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.paymentTypeButton,
                    paymentType === type && styles.activePaymentTypeButton,
                  ]}
                  onPress={() => setPaymentType(type)}
                >
                  <Icon
                    name={icon}
                    size={16}
                    color={paymentType === type ? 'white' : '#1a1a1a'}
                  />
                  <Text
                    style={[
                      styles.paymentTypeButtonText,
                      paymentType === type && styles.activePaymentTypeButtonText
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={styles.formContainer}>
              {renderPaymentForm()}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled
              ]}
              onPress={handleAddPaymentMethod}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Icon name="check" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Confirm</Text>
                </>
              )}
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
    backgroundColor: '#f8f9fa',
  },
  tabContent: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,

  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  indicator: {
    backgroundColor: '#DC2626',
    height: 3,
  },
  label: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardContainer: {
    marginTop: 2,
    paddingBottom: 10,
    // marginBottom: 5,

  },
  card: {
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 20,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 12,
  },
  cardIconContainer: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,  // Reduced vertical padding
    paddingHorizontal: 10,  // Reduced horizontal padding
    borderRadius: 20,  // Slightly smaller border radius
    marginTop: 8,  // Reduced margin
    backgroundColor: '#DC2626',
    alignSelf: 'flex-end',  // Align to right side
    minWidth: 80,  // Minimum width to prevent too narrow button
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,  // Smaller font size
    fontWeight: '600',
    marginLeft: 6,  // Reduced spacing between icon and text
    includeFontPadding: false,  // Remove extra padding around text
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 110,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  paymentTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    backgroundColor: 'white',
  },
  activePaymentTypeButton: {
    backgroundColor: '#DC2626',
    borderColor: '#1a1a1a',
  },
  paymentTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'black',
    marginLeft: 4,
  },
  activePaymentTypeButtonText: {
    color: 'white',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 20,
    marginBottom: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  qrCodeImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 16,
    alignSelf: 'center',
    width: '50%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#DC2626', // Same color but with opacity
  },
});

export default PaymentMethodsScreen;