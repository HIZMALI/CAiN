import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../state/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const onSubmit = async () => {
    if (!name.trim() && !email.trim()) {
      Alert.alert('Giriş', 'En az bir isim ya da e-posta gir.');
      return;
    }
    await signIn({ name, email });
    // Giriş sonrası ana akışa yönlendir
    navigation.reset({ index: 0, routes: [{ name: 'Upload' }] });
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>CAiN’e Hoş Geldin</Text>
      <Text style={s.sub}>Hızlı başlamak için isim ve/veya e-posta gir.</Text>

      <TextInput
        placeholder="İsim (opsiyonel)"
        value={name}
        onChangeText={setName}
        style={s.input}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <TextInput
        placeholder="E-posta (opsiyonel)"
        value={email}
        onChangeText={setEmail}
        style={s.input}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      <Button title="Devam Et" onPress={onSubmit} />

      <Text style={s.note}>
        Not: Şimdilik girişler cihazında saklanır (misafir modu). İstediğin zaman çıkış yapabilirsin.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 },
  note: { color: '#666', marginTop: 12 },
});