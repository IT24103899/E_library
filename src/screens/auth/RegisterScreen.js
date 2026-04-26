import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      console.log('REGISTER ERROR:', err.message);
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={['#1e3a5f', '#2a5298', '#1a2a6c']}
        style={styles.backgroundImage}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logo}>📚</Text>
              </View>
              <Text style={styles.title}>Join E-Library</Text>
              <Text style={styles.subtitle}>Create an account to start reading</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Create a password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
                <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 25, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  logo: { fontSize: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 12, textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
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
