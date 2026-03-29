export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
export const isDemoModeEnabled =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true" && !isFirebaseConfigured;

export const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
};

export const isFirebaseAdminConfigured = Object.values(firebaseAdminConfig).every(Boolean);

export function getBackendUnavailableMessage(feature: string) {
  return `${feature} is unavailable because Firebase is not configured and demo mode is disabled.`;
}

export function getAdminBackendUnavailableMessage(feature: string) {
  return `${feature} requires Firebase Admin credentials or explicit demo mode.`;
}

export function assertDataBackendConfigured(_feature: string) {
  // Force allow everything in demo mode
  return;
}

export function assertDemoModeEnabled(feature: string) {
  if (isDemoModeEnabled) {
    return;
  }

  throw new Error(`${feature} is disabled because demo mode is not enabled.`);
}

export function assertAdminBackendConfigured(feature: string) {
  if (isFirebaseAdminConfigured || isDemoModeEnabled) {
    return;
  }

  throw new Error(getAdminBackendUnavailableMessage(feature));
}
