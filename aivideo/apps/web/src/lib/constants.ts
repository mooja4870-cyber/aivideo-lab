export const APP_NAME = "AI Video Lab";
export const APP_TAGLINE = "주제 한 줄로 숏폼 영상 자동 제작";

export const SUPPORTED_LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" }
] as const;

export const PRICING_TIERS = [
  { id: "starter", name: "스타터", credits: 10, priceKrw: 24900 },
  { id: "pro", name: "프로", credits: 30, priceKrw: 69900 },
  { id: "scale", name: "스케일", credits: 80, priceKrw: 199000 }
] as const;

export const API_FALLBACKS = {
  workerUrl: "https://api.example.com/generate",
  callbackBaseUrl: "https://app.example.com",
  r2PublicBase: "https://pub.example.com"
} as const;
