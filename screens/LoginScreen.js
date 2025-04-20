// import React, { useState, useRef } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Config from '../Config';

// const LoginScreen = ({ navigation }) => {
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [otp, setOtp] = useState('');
//     const [isOtpSent, setIsOtpSent] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [requestId, setRequestId] = useState('');

//     const otpRefs = useRef([]); // Define ref for OTP input fields

//     const handleSendOtp = async () => {
//         if (!phoneNumber) {
//             Alert.alert('Error', 'Please enter your phone number.');
//             return;
//         }
//         setIsLoading(true);

//         try {
//             const response = await fetch('https://auth.otpless.app/auth/v1/initiate/otp', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'clientId': '6XC9OVUVX4D6M9BZXPZKYSHCBSN2TMG1',
//                     'clientSecret': 'f3ayo1fvemqxun1yoyy27mdk8ksbtlik',
//                 },
//                 body: JSON.stringify({
//                     phoneNumber: `+91${phoneNumber}`,
//                     channels: ['SMS'],
//                     otpLength: '4',
//                 }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 setRequestId(data.requestId);
//                 Alert.alert('OTP Sent', `OTP has been sent to ${phoneNumber}`);
//                 setIsOtpSent(true);
//             } else {
//                 Alert.alert('Error', data.message || 'Failed to send OTP.');
//             }
//         } catch (error) {
//             Alert.alert('Error', 'An error occurred while sending OTP.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleVerifyOtp = async () => {
//         if (!otp) {
//             Alert.alert('Error', 'Please enter the OTP.');
//             return;
//         }
//         setIsLoading(true);

//         try {
//             const verifyResponse = await fetch('https://auth.otpless.app/auth/v1/verify/otp', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'clientId': '6XC9OVUVX4D6M9BZXPZKYSHCBSN2TMG1',
//                     'clientSecret': 'f3ayo1fvemqxun1yoyy27mdk8ksbtlik',
//                 },
//                 body: JSON.stringify({
//                     requestId: requestId,
//                     otp: otp,
//                 }),
//             });

//             const verifyData = await verifyResponse.json();

//             if (!verifyResponse.ok) {
//                 Alert.alert('Error', verifyData.message || 'Invalid OTP. Please try again.');
//                 return;
//             }

//             const loginResponse = await fetch(`${Config.API_URL}/api/signup-or-login?phone_number=${phoneNumber}`, {
//                 method: 'GET',
//                 headers: {
//                     'Api-Key': Config.API_KEY,
//                 },
//             });

//             const loginData = await loginResponse.json();
//             console.log(loginData, "loginData");

//             if (loginResponse.ok) {
//                 Alert.alert('Success', 'Login successful!');
//                 await AsyncStorage.setItem('isLoggedIn', 'true');
//                 await AsyncStorage.setItem('loginData', JSON.stringify(loginData));
//                 navigation.navigate('MainApp', { screen: 'Dashboard' });

//             } else {
//                 Alert.alert('Error', loginData.message || 'Login failed. Please try again.');
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             Alert.alert('Error', 'An error occurred. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleGoToHome = () => {
//         // navigation.navigate('Dashboard');
//         navigation.navigate('MainApp', { screen: 'Dashboard' });

//     };

//     return (
//         <LinearGradient colors={['#fff', '#fff']} style={styles.container}>
//             <View style={styles.innerContainer}>
//                 <Text style={styles.title}>Welcome Back!</Text>
//                 <Text style={styles.subtitle}>Login to continue</Text>

//                 <View style={styles.inputContainer}>
//                     <MaterialIcons name="phone" size={24} color="#999" style={styles.icon} />
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Enter Phone Number"
//                         placeholderTextColor="#999"
//                         value={phoneNumber}
//                         onChangeText={setPhoneNumber}
//                         keyboardType="phone-pad"
//                     />
//                 </View>

//                 {!isOtpSent && (
//                     <TouchableOpacity style={styles.otpButton} onPress={handleSendOtp} disabled={isLoading}>
//                         {isLoading ? (
//                             <ActivityIndicator color="#fff" />
//                         ) : (
//                             <>
//                                 <MaterialIcons name="send" size={18} color="#fff" style={styles.otpIcon} />
//                                 <Text style={styles.otpText}>Send OTP</Text>
//                             </>
//                         )}
//                     </TouchableOpacity>
//                 )}

//                 {isOtpSent && (
//                     <>
//                         <View style={styles.otpContainer}>
//                             {Array(4)
//                                 .fill(0)
//                                 .map((_, index) => (
//                                     <TextInput
//                                         key={index}
//                                         ref={(el) => (otpRefs.current[index] = el)}
//                                         style={styles.otpInput}
//                                         value={otp[index] || ''}
//                                         onChangeText={(text) => {
//                                             let newOtp = otp.split('');
//                                             newOtp[index] = text;
//                                             setOtp(newOtp.join(''));

//                                             if (text && index < 3) {
//                                                 otpRefs.current[index + 1]?.focus();
//                                             }
//                                         }}
//                                         onKeyPress={({ nativeEvent }) => {
//                                             if (nativeEvent.key === 'Backspace' && index > 0) {
//                                                 otpRefs.current[index - 1]?.focus();
//                                             }
//                                         }}
//                                         maxLength={4}
//                                         keyboardType="number-pad"
//                                     />
//                                 ))}
//                         </View>

//                         <TouchableOpacity style={styles.otpButton} onPress={handleVerifyOtp} disabled={isLoading}>
//                             {isLoading ? (
//                                 <ActivityIndicator color="#fff" />
//                             ) : (
//                                 <>
//                                     <MaterialIcons name="send" size={18} color="#fff" style={styles.otpIcon} />
//                                     <Text style={styles.otpText}>Verify OTP</Text>
//                                 </>
//                             )}
//                         </TouchableOpacity>
//                     </>
//                 )}
//                 <TouchableOpacity style={styles.goHomeButton} onPress={handleGoToHome}>
//                     <LinearGradient colors={['#f44031', 'black']} style={styles.goHomeGradient}>
//                         <MaterialIcons name="home" size={20} color="#fff" style={styles.homeIcon} />
//                     </LinearGradient>
//                 </TouchableOpacity>
//             </View>
//         </LinearGradient>
//     );
// };

// const styles = StyleSheet.create({
//     otpButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#4a63ff',  // Solid modern blue color
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//         borderRadius: 20,
//         alignSelf: 'center',
//         elevation: 3,  // Adds a slight shadow for a modern look
//     },
//     otpIcon: {
//         marginRight: 6,
//     },
//     otpText: {
//         color: '#fff',
//         fontSize: 14,
//         fontWeight: 'bold',
//     },
//     goHomeButton: {
//         alignSelf: 'center', // Keeps it centered in the layout
//         marginTop: 20, // Adds spacing from other elements
//         width: 50,
//         height: 50,
//         borderRadius: 25, // Ensures a circular shape
//         overflow: 'hidden',
//         backgroundColor: 'transparent', // Avoid unnecessary background
//         elevation: 5, // Shadow effect for depth
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.3,
//         shadowRadius: 3,
//     },
//     goHomeGradient: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderRadius: 25, // Keeps the button round
//     },
//     homeIcon: {
//         color: '#fff',
//     },

//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     innerContainer: {
//         width: '90%',
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         padding: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.8,
//         shadowRadius: 2,
//         elevation: 5,
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#333',
//         textAlign: 'center',
//         marginBottom: 10,
//     },
//     subtitle: {
//         fontSize: 16,
//         color: '#666',
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
//         marginBottom: 20,
//     },
//     icon: {
//         marginRight: 10,
//     },
//     input: {
//         flex: 1,
//         height: 40,
//         color: '#333',
//     },
//     otpContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginBottom: 20,
//     },
//     otpInput: {
//         width: 50,
//         height: 50,
//         borderWidth: 1,
//         borderColor: '#4c669f',
//         borderRadius: 10,
//         textAlign: 'center',
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginHorizontal: 5,
//     },
//     button: {
//         backgroundColor: '#4a63ff',
//         padding: 15,
//         borderRadius: 5,
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
// });

// export default LoginScreen;


import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../Config';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [requestId, setRequestId] = useState('');
    const otpRefs = useRef([]);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Reset all state when screen comes into focus
            setPhoneNumber('');
            setOtp('');
            setIsOtpSent(false);
            setIsLoading(false);
            setRequestId('');
        });

        return unsubscribe;
    }, [navigation]);

    const resetForm = () => {
        setOtp('');
        setIsOtpSent(false);
    };

    const handleSendOtp = async () => {
        if (!phoneNumber) {
          Alert.alert('Error', 'Please enter your phone number.');
          return;
        }
        setIsLoading(true);
      
        try {
          const response = await axios.post(
            'https://auth.otpless.app/auth/v1/initiate/otp',
            {
              phoneNumber: `+91${phoneNumber}`,
              channels: ['SMS'],
              otpLength: '4',
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'clientId': '6XC9OVUVX4D6M9BZXPZKYSHCBSN2TMG1',
                'clientSecret': 'f3ayo1fvemqxun1yoyy27mdk8ksbtlik',
              },
              timeout: 10000, // 10 second timeout
            }
          );
      
          setRequestId(response.data.requestId);
          setIsOtpSent(true);
          setOtp(''); // Reset OTP fields when resending
        } catch (error) {
          let errorMessage = "We couldn't send the OTP.";
          
          if (axios.isAxiosError(error)) {
            if (error.response) {
              errorMessage = error.response.data?.message || errorMessage;
            } else if (error.request) {
              errorMessage = "Network error - Please check your internet connection";
            }
          }
      
          Alert.alert(
            "Oops! Something Went Wrong",
            errorMessage,
            [{ text: "OK", style: "default" }]
          );
        } finally {
          setIsLoading(false);
        }
      };
      
      const handleVerifyOtp = async () => {
        if (!otp) {
          Alert.alert('Error', 'Please enter the OTP.');
          return;
        }
        setIsLoading(true);
      
        try {
          // Step 1: Verify OTP with Otpless
          const verifyResponse = await axios.post(
            'https://auth.otpless.app/auth/v1/verify/otp',
            {
              requestId: requestId,
              otp: otp,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'clientId': '6XC9OVUVX4D6M9BZXPZKYSHCBSN2TMG1',
                'clientSecret': 'f3ayo1fvemqxun1yoyy27mdk8ksbtlik',
              },
              timeout: 10000,
            }
          );
      
          // Step 2: Login/Signup with your API
          const loginResponse = await axios.get(
            `${Config.API_URL}/api/signup-or-login`,
            {
              params: { phone_number: phoneNumber },
              headers: {
                'Api-Key': Config.API_KEY,
              },
              timeout: 10000,
            }
          );
      
          // Save login data and navigate
          await AsyncStorage.multiSet([
            ['isLoggedIn', 'true'],
            ['loginData', JSON.stringify(loginResponse.data)],
          ]);
      
          handleGoToDashboard();
        } catch (error) {
          let errorMessage = 'An error occurred. Please try again.';
          
          if (axios.isAxiosError(error)) {
            if (error.response) {
              // Handle specific error cases
              if (error.response.status === 400) {
                errorMessage = 'Invalid OTP. Please try again.';
              } else if (error.response.status === 401) {
                errorMessage = 'Authentication failed. Please try again.';
              } else {
                errorMessage = error.response.data?.message || errorMessage;
              }
            } else if (error.request) {
              errorMessage = 'Network error. Please check your internet connection.';
            }
          }
      
          Alert.alert('Error', errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

    const handleGoToDashboard = () => {
        // navigation.navigate('Dashboard');
        navigation.navigate('AuthStack', { screen: 'Dashboard' });

    };

    const handleChangePhoneNumber = () => {
        resetForm();
    };

    const handleResendOtp = () => {
        setOtp(''); // Clear OTP fields
        handleSendOtp(); // Resend OTP
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                {/* Home Icon in Header */}
                <TouchableOpacity 
                    style={styles.homeButton}
                    onPress={handleGoToDashboard}
                >
                    <MaterialIcons name="home" size={28} color="#DC2626" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome to A.P.P</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    {!isOtpSent ? (
                        <View style={styles.phoneInputContainer}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.countryCode}>+91</Text>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="Phone Number"
                                    placeholderTextColor="#a0a0a0"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    autoFocus
                                />
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleSendOtp}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="send" size={18} color="#fff" style={styles.otpIcon} />
                                        <Text style={styles.buttonText}> Send OTP</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.otpContainer}>
                            <View style={styles.phoneNumberHeader}>
                                <Text style={styles.otpTitle}>Enter OTP</Text>
                                <TouchableOpacity onPress={handleChangePhoneNumber}>
                                    <Text style={styles.changeNumberText}>Change Number</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <Text style={styles.otpSubtitle}>Sent to +91{phoneNumber}</Text>
                            
                            <View style={styles.otpInputsContainer}>
                                {Array(4).fill(0).map((_, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(el) => (otpRefs.current[index] = el)}
                                        style={styles.otpInput}
                                        value={otp[index] || ''}
                                        onChangeText={(text) => {
                                            let newOtp = otp.split('');
                                            newOtp[index] = text;
                                            setOtp(newOtp.join(''));

                                            if (text && index < 3) {
                                                otpRefs.current[index + 1]?.focus();
                                            }
                                        }}
                                        onKeyPress={({ nativeEvent }) => {
                                            if (nativeEvent.key === 'Backspace' && index > 0) {
                                                otpRefs.current[index - 1]?.focus();
                                            }
                                        }}
                                        maxLength={1}
                                        keyboardType="number-pad"
                                        textAlign="center"
                                    />
                                ))}
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleVerifyOtp}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="send" size={18} color="#fff" style={styles.otpIcon} />
                                        <Text style={styles.buttonText}> Verify OTP</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.resendLink}
                                onPress={handleResendOtp}
                                disabled={isLoading}
                            >
                                <Text style={styles.resendText}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    homeButton: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 50 : 30,
        left: '52%',
        transform: [{ translateX: -25 }],
        zIndex: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    phoneInputContainer: {
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    countryCode: {
        color: '#333',
        fontSize: 16,
        marginRight: 5,
    },
    phoneInput: {
        flex: 1,
        height: 50,
        color: '#333',
        fontSize: 16,
    },
    otpContainer: {
        width: '100%',
        alignItems: 'center',
    },
    phoneNumberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        marginBottom: 5,
    },
    otpTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    changeNumberText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '500',
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
        alignSelf: 'flex-start',
    },
    otpInputsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        color: '#333',
        fontSize: 24,
        fontWeight: 'bold',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DC2626',  // Solid modern blue color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'center',
        elevation: 3, 
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendLink: {
        marginTop: 5,
    },
    resendText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '500',
    },
    otpIcon: {
        marginRight: 5,
    },
});

export default LoginScreen;