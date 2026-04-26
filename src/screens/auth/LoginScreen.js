import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ImageBackground
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation is handled automatically by RootNavigator in App.js based on user state
    } catch (err) {
      console.log('LOGIN ERROR:', err.message, err.response?.data);
      const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed Details', `Msg: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground 
        source={require('../../../assets/login_bg.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>📚</Text>
            </View>
            <Text style={styles.title}>E-Library</Text>
            <Text style={styles.subtitle}>Welcome back! Please login.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
              <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40, backgroundColor: 'rgba(30, 58, 95, 0.4)' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 25, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  logo: { fontSize: 50 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 12, textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { fontSize: 16, color: '#e0e0e0', marginTop: 6, fontWeight: '500' },
  form: { backgroundColor: 'rgba(255, 255, 255, 0.92)', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  label: { fontSize: 14, fontWeight: '700', color: '#1e3a5f', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 4, backgroundColor: '#fff', color: '#333' },
  inputError: { borderColor: '#e53e3e' },
  errorText: { color: '#e53e3e', fontSize: 12, marginBottom: 10, fontWeight: '600' },
  button: { backgroundColor: '#1e3a5f', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20, shadowColor: '#1e3a5f', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#444', fontSize: 15 },
  linkBold: { color: '#1e3a5f', fontWeight: '800' },
});
