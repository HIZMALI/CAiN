import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Style'>;

export type Preset = {
  key: string;
  label: string;
  stylePrompt: string;   // FAL için “stil” (results’ta birleşecek)
};

export const PRESETS: Preset[] = [
  { key: 'studio_white', label: 'Stüdyo (Beyaz)', stylePrompt: 'clean white ecommerce studio backdrop, soft shadows, seamless paper, product hero shot' },
  { key: 'marble_counter', label: 'Mermer Tezgâh', stylePrompt: 'luxury marble countertop, soft daylight, minimal decor' },
  { key: 'wood_rustic', label: 'Rustik Ahşap', stylePrompt: 'warm rustic wooden table, cozy natural light, farmhouse vibes' },
  { key: 'minimal_office', label: 'Minimal Ofis', stylePrompt: 'minimal office desk, muted tones, soft ambient light, modern props' },
  { key: 'beach_cafe', label: 'Sahil Kafe', stylePrompt: 'sunny beach cafe table, bokeh background, seaside ambiance' },
  { key: 'christmas_table', label: 'Noel Masası', stylePrompt: 'festive christmas table, warm lights, pine branches, cozy holiday mood' },
  { key: 'pastel_corner', label: 'Pastel Köşe', stylePrompt: 'pastel photoshoot corner, soft gradient wall, aesthetic instagram setup' },
  { key: 'ny_loft', label: 'NY Loft', stylePrompt: 'industrial New York loft, large windows, brick wall, moody light' },
  { key: 'stone_nature', label: 'Doğal Taş', stylePrompt: 'outdoor stone surface, diffused daylight, natural plants' },
];

export default function StyleScreen({ route, navigation }: Props) {
  const { imageUri } = route.params;

  return (
    <View style={s.container}>
      <Text style={s.title}>Bir tarz seç</Text>

      <FlatList
        data={PRESETS}
        numColumns={3}
        keyExtractor={(i) => i.key}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => navigation.navigate('Results', { imageUri, preset: item.key })}>
            <Text style={s.cardText}>{item.label}</Text>
          </Pressable>
        )}
      />

      <Text style={s.hint}>Seçtiğin tarza göre CAiN görsel üretecek.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600' },
  hint: { color: '#666' },
  card: { flex: 1, minHeight: 90, borderRadius: 12, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center' },
  cardText: { fontWeight: '700', textAlign: 'center', paddingHorizontal: 6 }
});
