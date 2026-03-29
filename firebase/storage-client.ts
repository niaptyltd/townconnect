import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { firebaseStorage } from "@/firebase/client";

export async function uploadFile(path: string, file: File) {
  if (!firebaseStorage) {
    throw new Error("Firebase Storage has not been configured.");
  }

  const fileRef = ref(firebaseStorage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
