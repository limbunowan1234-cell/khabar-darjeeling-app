// app/auth.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SIZES } from '../src/utils/theme';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { Alert.alert('Error', 'Fill in all fields'); return; }
    setLoading(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password, name.trim());
      router.back();
    } catch (err) {
      Alert.alert(mode === 'login' ? 'Login Failed' : 'Registration Failed', err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.brand}>
          <Text style={styles.brandHindi}>खबर दार्जिलिंग</Text>
          <Text style={styles.brandTag}>Your hills, your news</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.toggle}>
            {['login', 'register'].map(m => (
              <TouchableOpacity key={m} style={[styles.toggleBtn, mode === m && styles.toggleActive]} onPress={() => setMode(m)}>
                <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>{m === 'login' ? 'Sign In' : 'Register'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={COLORS.textMuted} autoCapitalize="words" />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passWrap}>
              <TextInput style={styles.passInput} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPass} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Text>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>}
          </TouchableOpacity>

          <Text style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.switchLink} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Register' : 'Sign in'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  brand: { alignItems: 'center', paddingVertical: 40, gap: 6 },
  brandHindi: { color: COLORS.primary, fontSize: SIZES.xxxl, fontWeight: '900' },
  brandTag: { color: COLORS.textSecondary, fontSize: SIZES.md },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: 24, gap: 16 },
  toggle: { flexDirection: 'row', backgroundColor: COLORS.surfaceElevated, borderRadius: SIZES.radiusFull, padding: 3 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: SIZES.radiusFull, alignItems: 'center' },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleText: { color: COLORS.textSecondary, fontSize: SIZES.sm, fontWeight: '600' },
  toggleTextActive: { color: '#fff', fontWeight: '700' },
  field: { gap: 6 },
  label: { color: COLORS.textSecondary, fontSize: SIZES.sm, fontWeight: '600' },
  input: { backgroundColor: COLORS.surfaceElevated, color: COLORS.text, fontSize: SIZES.base, paddingVertical: 12, paddingHorizontal: 16, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border },
  passWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceElevated, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, paddingRight: 12 },
  passInput: { flex: 1, color: COLORS.text, fontSize: SIZES.base, paddingVertical: 12, paddingHorizontal: 16 },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: SIZES.radiusFull, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: SIZES.base, fontWeight: '800' },
  switchText: { color: COLORS.textSecondary, fontSize: SIZES.sm, textAlign: 'center' },
  switchLink: { color: COLORS.primary, fontWeight: '700' },
});
