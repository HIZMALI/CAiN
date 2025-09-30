export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Upload: undefined;
  Style: { imageUri: string };
  Results: { imageUri: string; preset: string };
  History: undefined;
  HistoryDetail: {
    id?: string;
    inputUri: string;
    outputUri: string;
    preset?: string;
    createdAt?: number;
  };
  Paywall: undefined;
};
