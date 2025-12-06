export {};

declare global {
  interface Window {
    // ✅ BEST: Use the official type instead of 'any'
    google: typeof google;
  }
}
