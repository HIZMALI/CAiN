import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ActivityIndicator, Alert, Share } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { File, Paths } from 'expo-file-system';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { generateImage } from '../services/falService';
import { useCredits } from '../state/CreditsContext';
import { useHistoryList } from '../state/HistoryContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ route, navigation }: Props) {
  const { imageUri, preset } = route.params;
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { credits, loading: creditsLoading, consume } = useCredits();
  const { add: addHistory } = useHistoryList();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (creditsLoading) return;

      const ok = await consume(1);
      if (!ok) {
        navigation.replace('Paywall');
        return;
      }

      setLoading(true);
      const res = await generateImage({ imageUri, preset });
      if (cancelled) return;

      if (res.ok && res.url) {
        setResultUrl(res.url);
        try { await addHistory({ inputUri: imageUri, outputUri: res.url, preset }); } catch {}
      } else {
        Alert.alert('Üretim Hatası', res.error ?? 'Bilinmeyen hata');
      }
      setLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [imageUri, preset, creditsLoading]);
  const saveToGallery = async () => {
     if (!resultUrl) return;
     const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
    Alert.alert('İzin gerekli', 'Galeriye kaydetmek için izin ver.');
    return;
    }
    const dest = new File(Paths.document, `cain_${Date.now()}.jpg`);
   await File.downloadFileAsync(resultUrl, dest); // => Promise<File>
  await MediaLibrary.saveToLibraryAsync(dest.uri);
  Alert.alert('Kaydedildi', 'Görsel galeriye kaydedildi.');
     };

  const shareImage = async () => {
    if (!resultUrl) return;
    await Share.share({ url: resultUrl, message: 'CAiN ile ürettim ✨' });
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Sonuç</Text>
      <Text style={s.sub}>Seçilen preset: {preset}</Text>

      {loading ? (
        <View style={[s.preview, s.center]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>CAiN görsel üretiyor...</Text>
        </View>
      ) : resultUrl ? (
        <>
          <Image source={{ uri: resultUrl }} style={s.preview} />
          <View style={s.row}>
            <Button title="Kaydet" onPress={saveToGallery} />
            <Button title="Paylaş" onPress={shareImage} />
          </View>
          <View style={s.row}>
            <Button title="Farklı Tarz" onPress={() => navigation.goBack()} />
            <Button title="Başa Dön" onPress={() => navigation.navigate('Upload')} />
          </View>
          <View style={{ marginTop: 8 }}>
            <Button title="Geçmişi Gör" onPress={() => navigation.navigate('History')} />
          </View>
        </>
      ) : (
        <>
          <View style={[s.preview, s.center]}><Text>Görsel alınamadı.</Text></View>
          <Button title="Tekrar Dene" onPress={() => navigation.replace('Results', { imageUri, preset })} />
        </>
      )}

      <Text style={s.note}>Not: MOCK modda placeholder gösterebilir. Gerçek üretim için .env/app.json içinde MOCK=false ve FAL anahtarını ekleyin.</Text>
      <Text style={{ color: '#666', marginTop: 8 }}>Mevcut kredi: {credits}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600' },
  sub: { color: '#333' },
  preview: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#f2f2f2' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  center: { alignItems: 'center', justifyContent: 'center' },
  note: { color: '#666' },
});
