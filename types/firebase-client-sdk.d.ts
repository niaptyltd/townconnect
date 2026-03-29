declare module "firebase/auth" {
  export const getAuth: any;
  export const onAuthStateChanged: any;
  export const createUserWithEmailAndPassword: any;
  export const signInWithEmailAndPassword: any;
  export const signOut: any;
  export const updateProfile: any;
}

declare module "firebase/firestore" {
  export const getFirestore: any;
  export const collection: any;
  export const deleteDoc: any;
  export const doc: any;
  export const getDoc: any;
  export const getDocs: any;
  export const query: any;
  export const setDoc: any;
  export const where: any;
}

declare module "firebase/storage" {
  export const getStorage: any;
  export const getDownloadURL: any;
  export const ref: any;
  export const uploadBytes: any;
}
