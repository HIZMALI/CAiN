import React, { useRef } from 'react';
import { View, Image, StyleSheet, PanResponder, Animated } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'HistoryDetail'>;

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export default function HistoryDetailScreen({ route }: Props) {
  const { inputUri, outputUri } = route.params;
  const x = useRef(new Animated.Value(0.5)).current; // 0..1
  const startRef = useRef(0.5); // drag başlangıcındaki değer

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Mevcut animasyon değerini public API ile oku
        x.stopAnimation((v) => {
          startRef.current = typeof v === 'number' ? v : startRef.current;
        });
      },
      onPanResponderMove: (_, g) => {
        const next = clamp(startRef.current + g.dx / 300);
        x.setValue(next);
      },
    })
  ).current;

  const clipWidth = x.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={s.container} {...pan.panHandlers}>
      <Image source={{ uri: inputUri }} style={s.img} />
      <Animated.View style={[s.overlay, { width: clipWidth }]}>
        <Image source={{ uri: outputUri }} style={s.img} />
      </Animated.View>
      <Animated.View
        style={[
          s.handle,
          { left: x.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  img: { width: '100%', aspectRatio: 1 },
  overlay: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
  handle: { position: 'absolute', width: 3, backgroundColor: '#fff', top: 0, bottom: 0 },
});
