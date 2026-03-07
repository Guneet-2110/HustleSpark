'use client';

import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

/**
 * Uploads a base64 encoded image to Firebase Storage.
 * @param base64Url The data URI (e.g., 'data:image/png;base64,...').
 * @param path The destination path in storage.
 * @returns The public download URL.
 */
export async function uploadBase64Image(
  base64Url: string,
  path: string
): Promise<string> {
  const storage = getStorage(getApp());
  const storageRef = ref(storage, path);
  // Using data_url format to handle base64 with mime type
  await uploadString(storageRef, base64Url, 'data_url');
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
