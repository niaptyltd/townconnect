import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { firebaseAdminConfig } from "@/firebase/config";

export function getFirebaseAdminDb() {
  if (
    !firebaseAdminConfig.projectId ||
    !firebaseAdminConfig.clientEmail ||
    !firebaseAdminConfig.privateKey
  ) {
    throw new Error("Firebase Admin credentials are missing.");
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: firebaseAdminConfig.projectId,
          clientEmail: firebaseAdminConfig.clientEmail,
          privateKey: firebaseAdminConfig.privateKey
        })
      });

  return getFirestore(app);
}

export function getFirebaseAdminAuth() {
  if (
    !firebaseAdminConfig.projectId ||
    !firebaseAdminConfig.clientEmail ||
    !firebaseAdminConfig.privateKey
  ) {
    throw new Error("Firebase Admin credentials are missing.");
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: firebaseAdminConfig.projectId,
          clientEmail: firebaseAdminConfig.clientEmail,
          privateKey: firebaseAdminConfig.privateKey
        })
      });

  return getAuth(app);
}
