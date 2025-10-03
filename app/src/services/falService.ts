import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

type GenerateParams = {
  imageUri: string;
  preset: string;
};

export type GenerateResult = {
  ok: boolean;
  url?: string;
  error?: string;
  errorCode?: string;
};

// Preset -> prompt haritalama (ürünü koruyarak arka plan değiştirme)
// Not: Ürün objesi aynı kalır, sadece arka plan ve ışıklandırma değişir
const PRESET_PROMPTS: Record<string, string> = {
  // SEZONLUK
  christmas_table:
    "Keep the exact same product, change background to elegant Christmas table setting with warm golden lighting and festive decorations, professional ecommerce photography, 4K resolution, sharp focus, no people, no text, no watermark",

  // DOĞAL / OUTDOOR
  beach_cafe:
    "Keep the exact same product, change background to beach cafe setting with natural daylight, professional lifestyle photography, high resolution, no people, no logos, ecommerce ready",
  outdoor_picnic:
    "Keep the exact same product, change background to outdoor picnic setting with natural lighting, professional commercial photography, crisp details, no hands, no brand text, catalog quality",
  rustic_wood_table:
    "Keep the exact same product, change background to rustic wooden surface with soft natural lighting, professional catalog photography, sharp details, no props covering product, commercial quality",

  // MODERN / MİNİMAL
  minimal_office:
    "Keep the exact same product, change background to clean white studio setting with soft lighting, professional minimal photography, high contrast, 4K resolution, no harsh reflections, commercial quality",
  pastel_minimal:
    "Keep the exact same product, change background to pastel gradient with soft studio lighting, professional ecommerce photography, controlled reflections, no text, no people, catalog quality",

  // EV / İÇ MEKAN
  cozy_living_room:
    "Keep the exact same product, change background to cozy living room with warm ambient lighting, professional lifestyle photography, 4K resolution, no human presence, catalog quality",
  marble_kitchen:
    "Keep the exact same product, change background to marble surface with natural daylight, professional ecommerce photography, sharp focus, no clutter, commercial quality",
  industrial_loft:
    "Keep the exact same product, change background to industrial setting with dramatic lighting, professional commercial photography, sharp details, no people, no text, catalog quality",

  // BİTKİSEL / BOTANİK
  botanical_studio:
    "Keep the exact same product, change background to botanical elements with soft natural lighting, professional lifestyle photography, sharp focus, 4K resolution, commercial quality",

  // FUTURISTIC / DRAMATIC / LUXURY
  neon_cyberpunk:
    "Keep the exact same product, change background to futuristic setting with dramatic lighting, professional commercial photography, sharp details, no text, catalog quality",
  dark_mood:
    "Keep the exact same product, change background to dark moody studio with dramatic lighting, professional luxury photography, high contrast, sharp focus, no dust, catalog quality",
  luxury_showcase:
    "Keep the exact same product, change background to luxury showcase with elegant backdrop and controlled lighting, professional high-end photography, sharp details, 4K resolution, catalog quality",

  // MARKA / LoRA (genel)
  brand_lora_demo:
    "Keep the exact same product, change background to brand-consistent setting with professional lighting, premium commercial photography, sharp focus, 4K resolution, no text, no watermark, catalog quality",
};

const PLACEHOLDERS: Record<string, string> = {
  christmas_table: 'https://images.unsplash.com/photo-1512386233331-5c180f0b5b4e?q=80&w=1200&auto=format&fit=crop',
  beach_cafe: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1200&auto=format&fit=crop',
  minimal_office: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
  brand_lora_demo: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop',
  cozy_living_room: 'https://images.unsplash.com/photo-1505692794403-34d4982a86e9?q=80&w=1200&auto=format&fit=crop',
  industrial_loft: 'https://images.unsplash.com/photo-1507138451611-3001135909d3?q=80&w=1200&auto=format&fit=crop',
  marble_kitchen: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop',
  rustic_wood_table: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=1200&auto=format&fit=crop',
  botanical_studio: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop',
  neon_cyberpunk: 'https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb?q=80&w=1200&auto=format&fit=crop',
  dark_mood: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop',
  pastel_minimal: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop',
  outdoor_picnic: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop',
  luxury_showcase: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop',
};

export function getPlaceholderForPreset(preset: string): string {
  return PLACEHOLDERS[preset] ?? PLACEHOLDERS.minimal_office;
}

export async function generateImage({ imageUri, preset }: GenerateParams): Promise<GenerateResult> {
  const extra = Constants.expoConfig?.extra as any;
  const MOCK_MODE = !!extra?.MOCK_MODE;
  const FAL_ENDPOINT = extra?.FAL_ENDPOINT as string | undefined;
  const FAL_API_KEY = extra?.FAL_API_KEY as string | undefined;

  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 600));
    return { ok: true, url: getPlaceholderForPreset(preset) };
  }

  if (!FAL_ENDPOINT || !FAL_API_KEY) {
    return {
      ok: false,
      error: 'FAL yapılandırması eksik (.env: FAL_ENDPOINT ve FAL_API_KEY). MOCK_MODE=false iken gereklidir.'
    };
  }

  try {
    // flux dev image-to-image: JSON body ile çalışır
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64' as any,
    });
    const imageDataUri = `data:image/jpeg;base64,${imageBase64}`;

    const body = JSON.stringify({
      image_url: imageDataUri,
      prompt: PRESET_PROMPTS[preset] ?? PRESET_PROMPTS.minimal_office,
      strength: 0.8,
      num_inference_steps: 20,
      guidance_scale: 3.5,
      seed: Math.floor(Math.random() * 1_000_000_000),
    });

    const res = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: { 
        Authorization: `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    const raw = await res.text();
    console.log("FAL response raw:", raw);

    if (!res.ok) {
      if (res.status === 403 && /Exhausted balance/i.test(raw)) {
        return { ok: false, error: `FAL error 403: ${raw}`, errorCode: 'FAL_EXHAUSTED_BALANCE' };
      }
      return { ok: false, error: `FAL error ${res.status}: ${raw}` };
    }

    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return { ok: false, error: 'JSON parse edilemedi: ' + raw };
    }

    const images = data?.images || data?.data?.images;
    const url = images?.[0]?.url
      || data?.image?.url
      || data?.output?.[0]?.url
      || data?.output_url
      || data?.url
      || data?.result?.image_url;

    if (!url) {
      return { ok: false, error: 'FAL response has no image url: ' + JSON.stringify(data) };
    }

    return { ok: true, url };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown error' };
  }
}
