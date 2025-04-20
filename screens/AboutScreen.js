import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const About = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/coming-soon.png')} style={styles.image} />
      <Text style={styles.title}>
         <Text style={{ color: '#fff' }}>Coming Soon </Text>
                  <Text style={{ color: '#DC2626' }}>About !</Text>
      </Text>
      <Text style={styles.subtitle}>We're working hard to bring something amazing for you. Stay tuned!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
   
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default About;
