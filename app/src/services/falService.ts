// src/services/falService.ts
import { PRESETS } from '../screens/StyleScreen';
import { fal } from '@fal-ai/client';

// ENV (expo: app.json -> extra.* üzerinden veya process.env)
const MOCK = String(process.env.EXPO_PUBLIC_MOCK_MODE ?? 'true') === 'true';
const FAL_KEY = process.env.EXPO_PUBLIC_FAL_KEY || '';

if (FAL_KEY) {
  fal.config({ credentials: FAL_KEY });
}

function buildPrompt(preset: string) {
  const p = PRESETS.find((x) => x.key === preset);
  return p?.stylePrompt ?? 'clean ecommerce studio';
}

export async function generateImage({ imageUri, preset }: { imageUri: string; preset: string; }) {
  try {
    if (MOCK) {
      return { ok: true, url: 'https://picsum.photos/1024?random=' + Math.random() };
    }

    // 1) yerel görseli blob’a çevir
    const blob = await (await fetch(imageUri)).blob();
    // 2) FAL storage’a yükle → URL al
    const file = new File([blob] as any, 'input.jpg', { type: blob.type || 'image/jpeg' } as any) as any;
    const inputUrl = await fal.storage.upload(file); // returns https URL

    // 3) image-to-image endpoint (USO)
    const { data } = await fal.subscribe('fal-ai/uso/image-to-image', {
      input: {
        image_url: inputUrl,
        prompt: buildPrompt(preset),
        guidance_scale: 3.5,
      }
    });

    // data.images[0].url benzeri
    const url = (data as any)?.images?.[0]?.url ?? (data as any)?.image?.url;
    if (!url) throw new Error('FAL response missing url');
    return { ok: true, url };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}
