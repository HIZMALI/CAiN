import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

const W = Dimensions.get('window').width;

const SLIDES = [
  { key: 's1', title: 'CAiN = Can + AI', desc: 'Ürün fotoğrafını farklı temalarda saniyeler içinde dönüştür.' },
  { key: 's2', title: 'Preset Kütüphanesi', desc: 'Kafe, stüdyo, noel masası… 1 dokunuşla sahneyi değiştir.' },
  { key: 's3', title: 'Paylaş & Büyü', desc: 'Kaydet, paylaş; e-ticaret görsellerini tek bir yerden üret.' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const listRef = useRef<FlatList>(null);
  const [idx, setIdx] = useState(0);
  const [dontShow, setDontShow] = useState(true);

  const go = async (to?: number) => {
    const next = typeof to === 'number' ? to : idx + 1;
    if (next < SLIDES.length) {
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIdx(next);
    } else {
      if (dontShow) await AsyncStorage.setItem('cain/onboardingDone', '1');
      navigation.replace('Auth');
    }
  };

  return (
    <View style={s.container}>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={SLIDES}
        keyExtractor={(i) => i.key}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
        renderItem={({ item }) => (
          <View style={[s.slide, { width: W }]}>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={s.dots}>
        {SLIDES.map((_, i) => <View key={i} style={[s.dot, i === idx && s.dotActive]} />)}
      </View>

      <View style={s.row}>
        <Pressable onPress={() => setDontShow(!dontShow)}>
          <Text style={s.checkbox}>{dontShow ? '☑︎' : '☐'} Bir daha gösterme</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => go(SLIDES.length - 1)}><Text style={s.link}>Atla</Text></Pressable>
          <Pressable onPress={() => go()}><Text style={s.btn}>{idx === SLIDES.length - 1 ? 'Başla' : 'İleri →'}</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingVertical: 24 },
  slide: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  desc: { fontSize: 16, color: '#444', textAlign: 'center' },
  dots: { flexDirection: 'row', alignSelf: 'center', gap: 6, marginVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  dotActive: { backgroundColor: '#111' },
  row: { marginTop: 'auto', paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkbox: { color: '#333' },
  link: { color: '#666', fontWeight: '600' },
  btn: { color: '#fff', backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, overflow: 'hidden' }
});
