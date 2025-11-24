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
    TouchableOpacity,
    View,
} from 'react-native';
import { api } from '@/constants/Backend';

const App = () => {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingRedirect, setLoadingRedirect] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: 'John Doe', email: 'johndoe@example.com' });
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
        validatePasscode(newPasscode);
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

  useEffect(() => {
    fetch(api('/api/user'))
      .then(r => r.json())
      .then(userData => {
        if (userData) {
          setUserProfile(userData);
        }
      })
      .catch(() => {});
  }, []);

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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.name}>{userProfile.name}</Text>

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
});

export default App;
