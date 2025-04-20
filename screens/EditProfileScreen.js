import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../Config';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [emailError, setEmailError] = useState('');

  const toastConfig = {
    success: ({ text1, text2 }) => (
      <View style={styles.successToast}>
        <Text style={styles.toastText1}>{text1}</Text>
        <Text style={styles.toastText2}>{text2}</Text>
      </View>
    ),
    error: ({ text1, text2 }) => (
      <View style={styles.errorToast}>
        <Text style={styles.toastText1}>{text1}</Text>
        <Text style={styles.toastText2}>{text2}</Text>
      </View>
    ),
  };
  
  

// Add this to your styles
const styles = StyleSheet.create({
  successToast: {
    width: '70%',
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 10,
    position: 'absolute',
    bottom: 20, // Adjust this for position
    left: '15%',
  },
  toastText1: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  toastText2: {
    color: 'white',
    fontSize: 14,
  },
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { alignItems: 'center', padding: 20 },
  profileImage: { 
    width: 140, 
    height: 140, 
    borderRadius: 100, 
    marginBottom: 10 
  },
  uploadText: { 
    color: '#4A63FF', 
    fontWeight: '600', 
    marginBottom: 20 
  },
  label: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#333', 
    marginBottom: 6, 
    alignSelf: 'flex-start' 
  },
  input: { 
    width: '100%', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    marginBottom: 12, 
    fontSize: 16, 
    backgroundColor: '#f9f9f9' 
  },
  errorInput: { borderColor: '#DC2626' },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 12 },
  multiline: { height: 80, textAlignVertical: 'top' },
  submitButton: {
    width: '50%',
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  loader: {
    marginTop: 50,
  },
  
});

export default EditProfileScreen;