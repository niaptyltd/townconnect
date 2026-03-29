import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { firebaseConfig, isFirebaseConfigured } from "@/firebase/config";

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseApp = app;
export const firebaseAuth = app ? getAuth(app) : null;
export const firebaseDb = app ? getFirestore(app) : null;
export const firebaseStorage = app ? getStorage(app) : null;
