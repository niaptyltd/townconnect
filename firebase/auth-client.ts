import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { firebaseAuth, firebaseDb } from "@/firebase/client";
import type { RegisterInput, SessionUser } from "@/types";

export async function firebaseSignIn(email: string, password: string) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth has not been configured.");
  }

  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);

  if (!firebaseDb) {
    throw new Error("Firestore has not been configured.");
  }

  const snapshot = await getDoc(doc(firebaseDb, "users", credential.user.uid));
  if (!snapshot.exists()) {
    await signOut(firebaseAuth);
    throw new Error("Your TownConnect profile could not be found. Please contact support.");
  }

  const session = snapshot.data() as SessionUser;
  if (!session.isActive) {
    await signOut(firebaseAuth);
    throw new Error("Your account is inactive. Please contact support.");
  }

  return {
    session,
    idToken: await credential.user.getIdToken()
  };
}

export async function firebaseRegister(payload: RegisterInput) {
  if (!firebaseAuth || !firebaseDb) {
    throw new Error("Firebase is not configured.");
  }

  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    payload.email,
    payload.password
  );

  await updateProfile(credential.user, {
    displayName: payload.fullName
  });

  const now = new Date().toISOString();
  const userProfile: SessionUser & { createdAt: string; updatedAt: string } = {
    id: credential.user.uid,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
    townId: payload.townId,
    province: payload.province,
    phone: payload.phone,
    whatsappNumber: payload.whatsappNumber,
    profileImage: "",
    isActive: true,
    referredByCode: payload.referredByCode || "",
    signupSource: payload.referredByCode ? "referral" : "organic",
    onboardingStatus: "self_signup",
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(firebaseDb, "users", credential.user.uid), userProfile);
  return {
    session: userProfile,
    idToken: await credential.user.getIdToken()
  };
}

export async function firebaseLogout() {
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}
