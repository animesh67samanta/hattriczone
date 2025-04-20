// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Image,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl, // Import RefreshControl
//   Alert,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // import Header from '../components/Header';
// // import BottomNav from '../components/BottomNav';
// import * as ImagePicker from 'expo-image-picker';
// import { useFocusEffect } from '@react-navigation/native';
// import Config from '../Config';

// const PaymentRequest = ({ navigation }) => {
//   const [activeNav, setActiveNav] = useState('request');
//   const [activeTab, setActiveTab] = useState('deposit');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalVisibleWithdraw, setModalVisibleWithdraw] = useState(false);
//   const [requestType, setRequestType] = useState('deposit');
//   const [platform, setPlatform] = useState('');
//   const [amount, setAmount] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('');
//   const [receipt, setReceipt] = useState(null);
//   const [withdrawRequests, setWithdrawRequests] = useState([]);
//   const [depositRequests, setDepositRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [refreshing, setRefreshing] = useState(false); // State for refresh control
//   const [games, setGames] = useState([]);
//   const [bankAccounts, setBankAccounts] = useState([]);
//   const [myBankAccounts, setMyBankAccounts] = useState([]);

//   // Fetch user ID from AsyncStorage
//   const fetchUserId = async () => {
//     try {
//       const logInDataString = await AsyncStorage.getItem('loginData');
//       const logInData = logInDataString ? JSON.parse(logInDataString) : null;
//       if (logInData && logInData.data.id) {
//         setUserId(logInData.data.id);
//       } else {
//         setError('User ID not found in login data');
//       }
//     } catch (err) {
//       setError('Failed to fetch user ID');
//     }
//   };

//   // Fetch assigned games (platforms)
//   const fetchGames = async () => {
//     try {
//       const response = await fetch(
//         `${Config.API_URL}/api/assigned-user-games/${userId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         setGames(data.data);
//       } else {
//         setError(data.message || 'Failed to fetch games');
//       }
//     } catch (err) {
//       setError('An error occurred while fetching games');
//     }
//   };

//   // Fetch admin bank accounts (payment methods)
//   const fetchBankAccounts = async () => {
//     try {
//       const response = await fetch(
//         `${Config.API_URL}/api/admin-bank-accounts`,
//         {
//           method: 'GET',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         setBankAccounts(data.data);
//       } else {
//         setError(data.message || 'Failed to fetch bank accounts');
//       }
//     } catch (err) {
//       setError('An error occurred while fetching bank accounts');
//     }
//   };
//   const handleDeleteWithdrawRequest = async (withdrawId) => {
//     try {
//       const formData = new FormData();
//       formData.append('user_id', userId);
//       formData.append('withdraw_id', withdrawId);

//       const response = await fetch(
//         `${Config.API_URL}/api/delete-withdraw-request`,
//         {
//           method: 'POST',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'multipart/form-data',
//           },
//           body: formData,
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         Alert.alert('Success', data.message);
//         fetchWithdrawRequests(); // Refresh withdraw requests
//       } else {
//         Alert.alert('Error', data.message || 'Failed to delete withdraw request');
//       }
//     } catch (err) {
//       Alert.alert('Error', 'An error occurred while deleting the withdraw request');
//     }
//   };
//   const fetchMyBankAccounts = async () => {
//     try {
//       const response = await fetch(
//         `${Config.API_URL}/api/get-payment-details/${userId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         setMyBankAccounts(data.data);
//       } else {
//         setError(data.message || 'Failed to fetch bank accounts');
//       }
//     } catch (err) {
//       setError('An error occurred while fetching bank accounts');
//     }
//   };
//   // Handle image upload
//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission denied', 'You need to grant permission to access the gallery.');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });
    

//     if (!result.canceled && result.assets.length > 0) {
//       setReceipt(result.assets[0].uri);
//     }
//   };
  
  
//   // Handle deposit request submission
//   const handleDepositSubmit = async () => {
//     if (!platform || !amount || !paymentMethod || !receipt) {
//       Alert.alert('Error', 'Please fill all fields and upload a receipt.');
//       return;
//     }

//     if (parseFloat(amount) > 10000) {
//       Alert.alert('Error', 'Amount should be under 10,000.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('user_id', userId);
//     formData.append('game_id', platform);
//     formData.append('amount', amount);
//     formData.append('admin_bank_id', paymentMethod);
//     formData.append('image', {
//       uri: receipt,
//       name: 'receipt.jpg',
//       type: 'image/jpeg',
//     });

//     try {
//       const response = await fetch(
//         `${Config.API_URL}/api/deposit-request`,
//         {
//           method: 'POST',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'multipart/form-data',
//           },
//           body: formData,
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         Alert.alert('Success', data.message);
//         setModalVisible(false);
//         setPlatform(null);
//         setAmount(null);
//         setPaymentMethod(null);
//         setReceipt(null)
//         fetchDepositRequests(); // Refresh deposit requests
//       } else {
//         Alert.alert('Error', data.message || 'Failed to create deposit request');
//       }
//     } catch (err) {
//       Alert.alert('Error', 'An error occurred while submitting the request');
//     }
//   };

//   // Fetch deposit requests
//   const fetchDepositRequests = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${Config.API_URL}/api/deposit-request-list/${userId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         setDepositRequests(data.data);
//       } else {
//         setError(data.message || 'Failed to fetch deposit requests');
//       }
//     } catch (err) {
//       setError('An error occurred while fetching deposit requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch withdraw requests
//   const fetchWithdrawRequests = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${Config.API_URL}/api/withdraw-request-list/${userId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         setWithdrawRequests(data.data);
//       } else {
//         setError(data.message || 'Failed to fetch withdraw requests');
//       }
//     } catch (err) {
//       setError('An error occurred while fetching withdraw requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle refresh
//   const onRefresh = async () => {
//     setRefreshing(true);
//     try {
//       if (activeTab === 'deposit') {
//         await fetchDepositRequests();
//       } else {
//         await fetchWithdrawRequests();
//       }
//     } catch (err) {
//       setError('Failed to refresh data');
//     } finally {
//       setRefreshing(false);
//     }
//   };


//   useFocusEffect(
//     useCallback(() => {
//       fetchUserId();
//     }, [])
//   );
//   const handleWithdrawSubmit = async () => {
//     if (!platform || !amount || !paymentMethod) {
//       Alert.alert('Error', 'Please fill all fields.');
//       return;
//     }

//     if (parseFloat(amount) > 10000) {
//       Alert.alert('Error', 'Amount should be under 10,000.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('user_id', userId);
//     formData.append('game_id', platform);
//     formData.append('amount', amount);
//     formData.append('account_id', paymentMethod);

//     try {
//       const response = await fetch(
//         `${Config.API_URL}/api/withdraw-request`,
//         {
//           method: 'POST',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'multipart/form-data',
//           },
//           body: formData,
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         Alert.alert('Success', data.message);
//         setModalVisibleWithdraw(false);
//         setPlatform(null);
//         setAmount(null);
//         setPaymentMethod(null);
//         setReceipt(null)
//         fetchWithdrawRequests(); // Refresh withdraw requests
//       } else {
//         Alert.alert('Error', data.message || 'Failed to create withdraw request');
//       }
//     } catch (err) {
//       Alert.alert('Error', 'An error occurred while submitting the request');
//     }
//   };
//   // Fetch games and bank accounts when the modal is opened
//   useEffect(() => {
//     if (modalVisible && userId) {
//       fetchGames();
//       fetchBankAccounts();
//     }
//     if (modalVisibleWithdraw && userId) {
//       fetchGames();
//       fetchMyBankAccounts();
//     }
//   }, [modalVisible, modalVisibleWithdraw, userId]);

//   // Fetch requests based on active tab
//   useEffect(() => {
//     if (userId) {
//       if (activeTab === 'deposit') {
//         fetchDepositRequests();
//       } else {
//         fetchWithdrawRequests();
//       }
//     }
//   }, [activeTab, userId]);
//   const handleDeleteDepositRequest = async (depositId) => {
//     try {
//       const formData = new FormData();
//       formData.append('user_id', userId);
//       formData.append('deposit_id', depositId);

//       const response = await fetch(
//         `${Config.API_URL}/api/delete-deposit-request`,
//         {
//           method: 'POST',
//           headers: {
//             'Api-Key': Config.API_KEY,
//             'Content-Type': 'multipart/form-data',
//           },
//           body: formData,
//         }
//       );
//       const data = await response.json();
//       if (data.status) {
//         Alert.alert('Success', data.message);
//         fetchDepositRequests(); // Refresh deposit requests
//       } else {
//         Alert.alert('Error', data.message || 'Failed to delete deposit request');
//       }
//     } catch (err) {
//       Alert.alert('Error', 'An error occurred while deleting the deposit request');
//     }
//   };
//   return (
//     <View style={styles.container}>
//       {/* Header */}
      
//       <View style={styles.tabButtons}>
//         <TouchableOpacity
//           style={[styles.tabBtn, activeTab === 'deposit' && styles.activeTabBtn]}
//           onPress={() => setActiveTab('deposit')}
//         >
//           <Text style={[styles.tabBtnText, activeTab === 'deposit' && styles.activeTabText]}>
//             Deposit Requests
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tabBtn, activeTab === 'withdraw' && styles.activeTabBtn]}
//           onPress={() => setActiveTab('withdraw')}
//         >
//           <Text style={[styles.tabBtnText, activeTab === 'withdraw' && styles.activeTabText]}>
//             Withdraw Requests
//           </Text>
//         </TouchableOpacity>
//       </View>


//       {/* Request List with RefreshControl */}
//       <ScrollView
//   style={styles.liveList}
//   refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />}
// >
//   <View style={styles.requestSection}>
//     {activeTab === 'deposit' ? (
//       <>
//         {/* Add Deposit Button */}
//         <View style={styles.actionsReq}>
//           <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
//             <Text style={styles.addBtnText}>+ Deposit Request</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Deposit Request Cards */}
//         {depositRequests.map((request) => (
//           <View key={request.deposit_id} style={styles.requestCard}>
//             <View style={styles.requestInfo}>
//               <Text style={styles.requestId}>#{request.deposit_id}</Text>
//               <Text style={styles.platformName}>🎮 Game ID : {request.game_id}</Text>
//               <Text style={styles.requestedOn}>📅 Request :{request.created_at}</Text>
//               <Text style={styles.amount}>💰 Amount : ₹{request.amount}</Text>
//               <Text style={[styles.status, getStatusStyle(request.status)]}>
//                 {request.status}
//               </Text>
//             </View>
//             <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteDepositRequest(request.deposit_id)}>
//               <Text style={styles.deleteIcon}>🗑️</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </>
//     ) : (
//       <>
//         {/* Add Withdraw Button */}
//         <View style={styles.actionsReq}>
//           <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisibleWithdraw(true)}>
//             <Text style={styles.addBtnText}>+ Withdraw Request</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Withdraw Request Cards */}
//         {withdrawRequests.map((request) => (
//           <View key={request.withdrawal_id} style={styles.requestCard}>
//             <View style={styles.requestInfo}>
//               <Text style={styles.requestId}>#{request.withdrawal_id}</Text>
//               <Text style={styles.platformName}>
//                 🏦 Method : {request.account ? request.account.payment_method : 'N/A'}
//               </Text>
//               <Text style={styles.requestedOn}>📅 Request :{request.created_at}</Text>
//               <Text style={styles.amount}>💰 Amount : ₹{request.amount}</Text>
//               <Text style={styles.utr}> 🏦 UPI : {request.account ? request.account.upi_number : 'N/A'}</Text>
//               <Text style={[styles.status, getStatusStyle(request.status)]}>
//                 {request.status}
//               </Text>
//             </View>
            
//             <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteWithdrawRequest(request.withdrawal_id)}>
//               <Text style={styles.deleteIcon}>🗑️</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </>
//     )}
//   </View>
// </ScrollView>


//       {/* Bottom Navigation */}
//       {/* <BottomNav navigation={navigation} activeNav={activeNav} setActiveNav={setActiveNav} /> */}

//       {/* Modal for Deposit Request */}
//       <Modal visible={modalVisible} transparent animationType="fade">
//   <View style={styles.modalOverlay}>
//     <View style={styles.modalContent}>
//       <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
//         <Text style={styles.closeIcon}>&times;</Text>
//       </TouchableOpacity>
      
//       <Text style={styles.modalTitle}>Create Deposit Request</Text>

//       {/* Choose Platform */}
//       <Text style={styles.label}>Choose Platform</Text>
//       <Picker selectedValue={platform} onValueChange={setPlatform} style={styles.picker}>
//         <Picker.Item label="Choose platform" value="" />
//         {games.map((game) => (
//           <Picker.Item key={game.game_id} label={game.game_name} value={game.game_id} />
//         ))}
//       </Picker>

//       {/* Amount */}
//       <Text style={styles.label}>Amount</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter amount"
//         value={amount}
//         onChangeText={setAmount}
//         keyboardType="numeric"
//       />

//       {/* Payment Method */}
//       <Text style={styles.label}>Select Payment Method</Text>
//       <Picker selectedValue={paymentMethod} onValueChange={setPaymentMethod} style={styles.picker}>
//         <Picker.Item label="Choose Account" value="" />
//         {Object.entries(bankAccounts).map(([type, accounts]) =>
//           accounts.map((account) => (
//             <Picker.Item key={account.id} label={`${type} - ${account.account_holder_name}`} value={account.id} />
//           ))
//         )}
//       </Picker>

//       {/* File Upload */}
//       <Text style={styles.label}>Upload Payment Receipt</Text>
//       <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
//         <Text style={styles.uploadBtnText}>Choose Image</Text>
//       </TouchableOpacity>
//       {receipt && (
//         <Image source={{ uri: receipt }} style={styles.receiptImage} />
//       )}

//       {/* Submit Button */}
//       <TouchableOpacity style={styles.submitBtn} onPress={handleDepositSubmit}>
//         <Text style={styles.submitBtnText}>Send Request</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// </Modal>

//       {/* Modal for withdraw Request */}
//       {/* Modal for Withdraw Request */}
//       <Modal visible={modalVisibleWithdraw} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
        
//             <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisibleWithdraw(false)}>
//               <Text style={styles.closeIcon}>&times;</Text>
//             </TouchableOpacity>
//             <Text style={styles.modalTitle}>Create Withdraw Request</Text>

//             {/* Choose Platform */}
//             <Text style={styles.label}>Choose Platform</Text>
//             <Picker
//               selectedValue={platform}
//               onValueChange={(itemValue) => setPlatform(itemValue)}
//               style={styles.picker}
//             >
//               <Picker.Item label="Choose platform" value="" />
//               {games.map((game) => (
//                 <Picker.Item key={game.game_id} label={game.game_name} value={game.game_id} />
//               ))}
//             </Picker>

//             {/* Enter Amount */}
//             <Text style={styles.label}>Enter Amount</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter amount"
//               value={amount}
//               onChangeText={setAmount}
//               keyboardType="numeric"
//             />

//             {/* Select Payment Method */}
//             <Text style={styles.label}>Select Payment Method</Text>
//             <Picker
//               selectedValue={paymentMethod}
//               onValueChange={(itemValue) => setPaymentMethod(itemValue)}
//               style={styles.picker}
//             >
//               <Picker.Item label="Choose payment method" value="" />
//               {/* Display Bank Transfer Payment Methods */}
//               {myBankAccounts['bank-transfer'] &&
//                 myBankAccounts['bank-transfer'].map((bank) => (
//                   <Picker.Item
//                     key={bank.id}
//                     label={`Bank: ${bank.bank_name} (${bank.account_holder_name})`}
//                     value={bank.id}
//                   />
//                 ))}
//               {/* Display UPI Payment Methods */}
//               {myBankAccounts.upi &&
//                 myBankAccounts.upi.map((upi) => (
//                   <Picker.Item
//                     key={upi.id}
//                     label={`UPI: ${upi.upi_number} (${upi.account_holder_name})`}
//                     value={upi.id}
//                   />
//                 ))}
//               {/* Display Crypto Payment Methods */}
//               {myBankAccounts.crypto &&
//                 myBankAccounts.crypto.map((crypto) => (
//                   <Picker.Item
//                     key={crypto.id}
//                     label={`Crypto: ${crypto.crypto_wallet} (${crypto.account_holder_name})`}
//                     value={crypto.id}
//                   />
//                 ))}
//             </Picker>

//             {/* Submit Button */}
//             <TouchableOpacity style={styles.submitBtn} onPress={handleWithdrawSubmit}>
//               <Text style={styles.submitBtnText}>Send Request</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };
// const getStatusStyle = (status) => {
//   switch (status.toLowerCase()) {
//     case 'pending':
//       return { backgroundColor: '#ffc107', color: '#fff' };
//     case 'approved':
//       return { backgroundColor: '#28a745', color: '#fff' };
//     case 'rejected':
//       return { backgroundColor: '#dc3545', color: '#fff' };
//     default:
//       return { backgroundColor: '#6c757d', color: '#fff' };
//   }
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f4f4f4',
//   },
//   tabButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 10,
//     backgroundColor: '#f8f9fa', // Light background
//     borderRadius: 10,
//   },
//   status: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginTop: 5,
//     paddingVertical: 8,
//     borderRadius: 5,
//     textAlign: 'center',
//     width: 100,
//     textTransform: 'uppercase',
//   },
//   tabBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 5,
//     backgroundColor: '#e0e0e0',
//   },
//   activeTabBtn: {
//     backgroundColor: '#007bff',
//   },
//   tabBtnText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333'
//   },
//   liveList: {
//     flex: 1,
//     backgroundColor: '#f4f6f8',
//   },
//   requestSection: {
//     padding: 15,
//   },
//   actionsReq: {
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   addBtn: {
//     backgroundColor: 'blue',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   addBtnText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   requestCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   requestInfo: {
//     flex: 1,
//   },
//   requestId: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   platformName: {
//    fontSize: 16,
//     color: '#555',
//   },
//   requestedOn: {
//     fontSize: 14,
//     marginTop: 5,
//     color: '#888',
//   },
//   amount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#28a745',
//     marginTop: 5,
//   },
//   utr: {
//     fontSize: 14,
//     marginTop: 5,
//     color: '#777',
//   },
//   deleteIcon: {
//     fontSize: 22,
//     color: '#dc3545',
//   },
  
//   actions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   viewBtn: {
//     backgroundColor: '#f3f4f6',
//     padding: 6,
//     borderRadius: 8,
//   },
//   deleteBtn: {
//     // backgroundColor: 'red',
//     // borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 15,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '90%',
//     alignItems: 'center',
//   },
//   closeBtn: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//   },
//   closeIcon: {
//     fontSize: 24,
//     color: '#333',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   label: {
//     alignSelf: 'flex-start',
//     marginTop: 10,
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   picker: {
//     width: '100%',
//     backgroundColor: '#f1f1f1',
//     marginVertical: 5,
//     borderRadius: 5,
//   },
//   input: {
//     width: '100%',
//     backgroundColor: '#f1f1f1',
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//   },
//   uploadBtn: {
//     backgroundColor: '#007BFF',
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//   },
//   uploadBtnText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   fileName: {
//     fontSize: 12,
//     color: '#6b7280',
//     marginBottom: 15,
//   },
//   receiptImage: {
//     width: 200,
//     height: 200,
//     marginTop: 10,
//     borderRadius: 10,
//   },
//   submitBtn: {
//     backgroundColor: '#28A745',
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 10,
//     width: '100%',
//     alignItems: 'center',
//   },
//   submitBtnText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   activeTabText: {
//     color: '#fff', // White text for active tab
//   },
// });

// export default PaymentRequest;

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
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import Config from '../Config';
import { Ionicons } from '@expo/vector-icons';

const initialLayout = { width: Dimensions.get('window').width };

const PaymentRequest = ({ navigation }) => {
  const [activeNav, setActiveNav] = useState('request');
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'deposit', title: 'Deposit' },
    { key: 'withdraw', title: 'Withdraw' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleWithdraw, setModalVisibleWithdraw] = useState(false);
  const [platform, setPlatform] = useState('');
  const [amount, setAmount] = useState('');
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
      const response = await fetch(
        `${Config.API_URL}/api/assigned-user-games/${userId}`,
        {
          method: 'GET',
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setGames(data.data);
      } else {
        setError(data.message || 'Failed to fetch games');
      }
    } catch (err) {
      setError('An error occurred while fetching games');
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch(
        `${Config.API_URL}/api/admin-bank-accounts`,
        {
          method: 'GET',
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setBankAccounts(data.data);
      } else {
        setError(data.message || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError('An error occurred while fetching bank accounts');
    }
  };

  const handleDeleteWithdrawRequest = async (withdrawId) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('withdraw_id', withdrawId);

      const response = await fetch(
        `${Config.API_URL}/api/delete-withdraw-request`,
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
        fetchWithdrawRequests();
      } else {
        Alert.alert('Error', data.message || 'Failed to delete withdraw request');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while deleting the withdraw request');
    }
  };

  const fetchMyBankAccounts = async () => {
    try {
      const response = await fetch(
        `${Config.API_URL}/api/get-payment-details/${userId}`,
        {
          method: 'GET',
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setMyBankAccounts(data.data);
      } else {
        setError(data.message || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError('An error occurred while fetching bank accounts');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'You need to grant permission to access the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled && result.assets.length > 0) {
      setReceipt(result.assets[0].uri);
    }
  };
  
  const handleDepositSubmit = async () => {
    if (!platform || !amount || !paymentMethod || !receipt) {
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
    formData.append('admin_bank_id', paymentMethod);
    formData.append('image', {
      uri: receipt,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await fetch(
        `${Config.API_URL}/api/deposit-request`,
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
        setModalVisible(false);
        setPlatform(null);
        setAmount(null);
        setPaymentMethod(null);
        setReceipt(null)
        fetchDepositRequests();
      } else {
        Alert.alert('Error', data.message || 'Failed to create deposit request');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while submitting the request');
    }
  };

  const fetchDepositRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${Config.API_URL}/api/deposit-request-list/${userId}`,
        {
          method: 'GET',
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setDepositRequests(data.data);
      } else {
        setError(data.message || 'Failed to fetch deposit requests');
      }
    } catch (err) {
      setError('An error occurred while fetching deposit requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${Config.API_URL}/api/withdraw-request-list/${userId}`,
        {
          method: 'GET',
          headers: {
            'Api-Key': Config.API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setWithdrawRequests(data.data);
      } else {
        setError(data.message || 'Failed to fetch withdraw requests');
      }
    } catch (err) {
      setError('An error occurred while fetching withdraw requests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (index === 0) {
        await fetchDepositRequests();
      } else {
        await fetchWithdrawRequests();
      }
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!platform || !amount || !paymentMethod) {
      Alert.alert('Error', 'Please fill all fields.');
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

  useEffect(() => {
    if (modalVisible && userId) {
      fetchGames();
      fetchBankAccounts();
    }
    if (modalVisibleWithdraw && userId) {
      fetchGames();
      fetchMyBankAccounts();
    }
  }, [modalVisible, modalVisibleWithdraw, userId]);

  useEffect(() => {
    if (userId) {
      if (index === 0) {
        fetchDepositRequests();
      } else {
        fetchWithdrawRequests();
      }
    }
  }, [index, userId]);

  const DepositScene = () => (
    <ScrollView
      style={styles.scene}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />}
    >
      <View style={styles.requestSection}>
        {depositRequests.map((request) => (
          <View key={request.deposit_id} style={styles.requestCard}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestId}>#{request.deposit_id}</Text>
              <Text style={styles.platformName}>🎮 Game ID: {request.game_id}</Text>
              <Text style={styles.requestedOn}>📅 Request: {request.created_at}</Text>
              <Text style={styles.amount}>💰 Amount: ₹{request.amount}</Text>
              <Text style={[styles.status, getStatusStyle(request.status)]}>
                {request.status}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => handleDeleteDepositRequest(request.deposit_id)}
            >
              <Ionicons name="trash-outline" size={30} color="#DC2626" />
              <Text style={styles.deleteText} >Delete</Text>

            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const WithdrawScene = () => (
    <ScrollView
      style={styles.scene}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />}
    >
      <View style={styles.requestSection}>
        {withdrawRequests.map((request) => (
          <View key={request.withdrawal_id} style={styles.requestCard}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestId}>#{request.withdrawal_id}</Text>
              <Text style={styles.platformName}>
                🏦 Method: {request.account ? request.account.payment_method : 'N/A'}
              </Text>
              <Text style={styles.requestedOn}>📅 Request: {request.created_at}</Text>
              <Text style={styles.amount}>💰 Amount: ₹{request.amount}</Text>
              <Text style={styles.utr}> 🏦 UPI: {request.account ? request.account.upi_number : 'N/A'}</Text>
              <Text style={[styles.status, getStatusStyle(request.status)]}>
                {request.status}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => handleDeleteWithdrawRequest(request.withdrawal_id)}
            >
            
              <Ionicons name="trash-outline" size={30} color="#DC2626" />
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
        onPress={() => index === 0 ? setModalVisible(true) : setModalVisibleWithdraw(true)}
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
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Create Deposit Request</Text>

            <Text style={styles.label}>Choose Platform</Text>
            <Picker selectedValue={platform} onValueChange={setPlatform} style={styles.picker}>
              <Picker.Item label="Choose platform" value="" />
              {games.map((game) => (
                <Picker.Item key={game.game_id} label={game.game_name} value={game.game_id} />
              ))}
            </Picker>

            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Select Payment Method</Text>
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

            <Text style={styles.label}>Choose Platform</Text>
            <Picker
              selectedValue={platform}
              onValueChange={(itemValue) => setPlatform(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Choose platform" value="" />
              {games.map((game) => (
                <Picker.Item key={game.game_id} label={game.game_name} value={game.game_id} />
              ))}
            </Picker>

            <Text style={styles.label}>Enter Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Select Payment Method</Text>
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

            <TouchableOpacity style={styles.submitBtn} onPress={handleWithdrawSubmit}>
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
    paddingBottom: 80, // Add padding for FAB
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f4f4f4',
    padding: 15,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  deleteText: {
    color: '#DC2626',
  },
  platformName: {
    fontSize: 16,
    color: '#555',
  },
  requestedOn: {
    fontSize: 14,
    marginTop: 5,
    color: '#888',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  utr: {
    fontSize: 14,
    marginTop: 5,
    color: '#777',
  },
  status: {
    fontSize: 14,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
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
    borderRadius: 8,
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
