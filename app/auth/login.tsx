import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { Redirect } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
    Alert,
    Animated,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { api } from '@/constants/Backend';

const App = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingRedirect, setLoadingRedirect] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: 'John Doe', email: 'johndoe@example.com' });
  const [showPasscode, setShowPasscode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const startFadeAnimation = () => {
    setLoadingRedirect(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => setAuthenticated(true), 500);
    });
  };

  const handleKeyPress = (key) => {
    if (passcode.length < 6) {
      const newPasscode = passcode + key;
      setPasscode(newPasscode);

      if (newPasscode.length === 6) {
        if (isRegistering) {
          handleRegister(newPasscode);
        } else {
          validatePasscode(newPasscode);
        }
      }
    }
  };

  const handleFingerprintAuth = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('Fingerprint not supported');
      return;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert('No fingerprint enrolled');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with fingerprint',
    });

    if (result.success) {
      authenticateUser();
    } else {
      Alert.alert('Authentication Failed');
    }
  };

  const validatePasscode = async (enteredPasscode) => {
    try {
      const response = await fetch(api('/api/user/validate-passcode'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: enteredPasscode })
      });
      const result = await response.json();
      if (result.valid) {
        authenticateUser();
      } else {
        Alert.alert('Wrong Passcode');
        setPasscode('');
      }
    } catch (err) {
      Alert.alert('Authentication Error', 'Could not validate passcode');
      setPasscode('');
    }
  };

  const authenticateUser = async () => {
    try {
      const response = await fetch(api('/api/user'));
      const userData = await response.json();
      if (userData) {
        setUserProfile(userData);
      }
    } catch (err) {
      console.warn('Failed to fetch user profile');
    }
    startFadeAnimation();
  };

  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      Alert.alert('Username Required', 'Please enter your username');
      return;
    }
    if (isRegistering && !email.trim()) {
      Alert.alert('Email Required', 'Please enter your email');
      return;
    }
    setShowPasscode(true);
    if (!isRegistering) {
      fetch(api('/api/user'))
        .then(r => r.json())
        .then(userData => {
          if (userData) {
            setUserProfile(userData);
          }
        })
        .catch(() => {});
    }
  };

  const handleRegister = async (enteredPasscode) => {
    try {
      const response = await fetch(api('/api/user/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: username.trim(), 
          email: email.trim(), 
          passcode: enteredPasscode 
        })
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Account created successfully!');
        setUserProfile({ name: username, email });
        authenticateUser();
      } else {
        Alert.alert('Registration Failed', result.error);
        setPasscode('');
      }
    } catch (err) {
      Alert.alert('Registration Error', 'Could not create account');
      setPasscode('');
    }
  };

  useEffect(() => {
    if (!showPasscode) {
      fetch(api('/api/user'))
        .then(r => r.json())
        .then(userData => {
          if (userData) {
            setUserProfile(userData);
          }
        })
        .catch(() => {});
    }
  }, [showPasscode]);

  if (authenticated) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={styles.container}>
      {loadingRedirect ? (
        <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
          <Text style={styles.redirectText}>Loading...</Text>
        </Animated.View>
      ) : (
        <>
          <Image
            source={require('@/assets/images/user.png')}
            style={styles.avatar}
          />
          <Text style={styles.title}>{showPasscode ? (isRegistering ? 'Create Account' : 'Welcome Back') : (isRegistering ? 'Register' : 'Login')}</Text>
          {showPasscode && <Text style={styles.name}>{userProfile.name}</Text>}

          {!showPasscode ? (
            <>
              <View style={styles.inputContainer}>
                <AntDesign name="user" size={20} color="limegreen" style={styles.inputIcon} />
                <TextInput
                  style={styles.usernameInput}
                  placeholder="Enter username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
              {isRegistering && (
                <View style={styles.inputContainer}>
                  <AntDesign name="mail" size={20} color="limegreen" style={styles.inputIcon} />
                  <TextInput
                    style={styles.usernameInput}
                    placeholder="Enter email"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              )}
              <TouchableOpacity style={styles.continueBtn} onPress={handleUsernameSubmit}>
                <Text style={styles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.switchBtn} onPress={() => setIsRegistering(!isRegistering)}>
                <Text style={styles.switchBtnText}>
                  {isRegistering ? 'Already have an account? Login' : 'New user? Register'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.passcodeRow}>
                <AntDesign name="lock" size={24} color="limegreen" />
                <Text style={styles.passcodeText}>Passcode</Text>
              </View>

              <View style={styles.dots}>
                {[...Array(6)].map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, passcode.length > i && styles.filledDot]}
                  />
                ))}
              </View>

              <TouchableOpacity style={styles.backBtn} onPress={() => { setShowPasscode(false); setPasscode(''); }}>
                <Text style={styles.backBtnText}>← Back to {isRegistering ? 'Registration' : 'Username'}</Text>
              </TouchableOpacity>
            </>
          )}

          {showPasscode && (
            <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map(
              (key, i) => {
                if (key === '') {
                  if (i === 9) {
                    return (
                      <TouchableOpacity key={i} onPress={() => setPasscode('')}>
                        <Text style={styles.signOut}>Clear</Text>
                      </TouchableOpacity>
                    );
                  } else if (i === 11) {
                    return (
                      <TouchableOpacity key={i} onPress={handleFingerprintAuth}>
                        <LinearGradient
                          colors={['purple', 'limegreen']}
                          style={styles.fingerprintButton}
                        >
                          <MaterialCommunityIcons
                            name="fingerprint"
                            size={28}
                            color="white"
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  }
                  return <View key={i} style={{ width: 60 }} />;
                }

                return (
                  <TouchableOpacity key={i} onPress={() => handleKeyPress(key)}>
                    <Text style={styles.key}>{key}</Text>
                  </TouchableOpacity>
                );
              }
            )}
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  name: {
    color: '#ccc',
    fontSize: 18,
    marginVertical: 6,
  },
  passcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  passcodeText: {
    color: '#ccc',
    marginLeft: 8,
    fontSize: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#444',
  },
  filledDot: {
    backgroundColor: '#aaa',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 20,
  },
  key: {
    color: '#fff',
    fontSize: 28,
    width: 60,
    textAlign: 'center',
  },
  signOut: {
    color: 'limegreen',
    fontSize: 18,
    width: 60,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  fingerprintButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redirectText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 20,
    width: 280,
  },
  inputIcon: {
    marginRight: 10,
  },
  usernameInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
  },
  continueBtn: {
    backgroundColor: 'limegreen',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: 10,
    padding: 10,
  },
  backBtnText: {
    color: 'limegreen',
    fontSize: 14,
  },
  switchBtn: {
    marginTop: 15,
    padding: 10,
  },
  switchBtnText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default App;
