import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type NotificationType = 
  | 'purchase' 
  | 'delivery' 
  | 'confirmation' 
  | 'dispute' 
  | 'approved'
  | 'message'
  | 'review';

export async function createNotification(
  firestore: any,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  if (!firestore || !userId) return;
  try {
    await addDoc(collection(firestore, 'notifications'), {
      userId,
      type,
      title,
      message,
      link: link || '/profile',
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('Failed to create notification:', e);
  }
}