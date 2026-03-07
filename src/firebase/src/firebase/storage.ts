'use client';

import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

export async function uploadBase64Image(
  base64Url: string,
  path: string
): Promise<string> {
  const storage = getStorage(getApp());
  const storageRef = ref(storage, path);
  await uploadString(storageRef, base64Url, 'data_url');
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}