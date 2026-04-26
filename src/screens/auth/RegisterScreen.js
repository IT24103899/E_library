import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ImageBackground
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/(?=.*[A-Z])(?=.*\d)/.test(password))
      e.password = 'Password must contain uppercase letter and number';
    if (!confirm) e.confirm = 'Please confirm your password';
    else if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      // Navigation is handled automatically by RootNavigator in App.js based on user state
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the E-Library community</Text>
          </View>

          <View style={styles.form}>
            {[
              { label: 'Full Name', value: name, setter: setName, key: 'name', placeholder: 'Enter your full name' },
              { label: 'Email', value: email, setter: setEmail, key: 'email', placeholder: 'Enter your email', keyboard: 'email-address' },
            ].map(({ label, value, setter, key, placeholder, keyboard }) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={[styles.input, errors[key] && styles.inputError]}
                  placeholder={placeholder}
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={setter}
                  keyboardType={keyboard || 'default'}
                  autoCapitalize={key === 'email' ? 'none' : 'words'}
                  autoCorrect={false}
                />
                {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Min 6 chars, uppercase & number"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, errors.confirm && styles.inputError]}
                placeholder="Re-enter your password"
                placeholderTextColor="#999"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
              {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, backgroundColor: 'rgba(30, 58, 95, 0.4)' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: { backgroundColor: '#fff', padding: 12, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  logo: { fontSize: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 12, textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { fontSize: 15, color: '#e0e0e0', marginTop: 4, fontWeight: '500' },
  form: { backgroundColor: 'rgba(255, 255, 255, 0.92)', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#1e3a5f', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, backgroundColor: '#fff', color: '#333' },
  inputError: { borderColor: '#e53e3e' },
  errorText: { color: '#e53e3e', fontSize: 12, marginTop: 4, fontWeight: '600' },
  button: { backgroundColor: '#1e3a5f', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16, shadowColor: '#1e3a5f', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#444', fontSize: 14 },
  linkBold: { color: '#1e3a5f', fontWeight: '800' },
});
