
import 'dotenv/config';

export default {
  expo: {
    name: "CAiN",
    slug: "cain",
    version: "1.0.0",

    // ANDROID ÖNEMLİ: Benzersiz paket adı
    android: {
      package: "com.hizmali.cain",   
      versionCode: 1
    },

    extra: {
      FAL_API_KEY: process.env.FAL_API_KEY,
      FAL_ENDPOINT: process.env.FAL_ENDPOINT,
      MOCK_MODE: process.env.MOCK_MODE === 'true',
      EXPO_PUBLIC_ADAPTY_SDK_KEY: process.env.EXPO_PUBLIC_ADAPTY_SDK_KEY,
      EXPO_PUBLIC_ADAPTY_PLACEMENT_ID: "cain_credits",

      // FAL public
      EXPO_PUBLIC_FAL_KEY: process.env.EXPO_PUBLIC_FAL_KEY,

      // EAS projectId
      eas: {
        projectId: "5e9ee4b5-7874-410b-8207-69dc112e52ac",
      },
    },
  },
};
