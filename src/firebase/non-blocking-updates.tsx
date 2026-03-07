'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * Initiates a setDoc operation. Surfaces permission errors contextually.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  setDoc(docRef, data, options || {}).catch(async (error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: options && 'merge' in options ? 'update' : 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext)
    );
  });
}

/**
 * Initiates an addDoc operation. Surfaces permission errors contextually.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  addDoc(colRef, data).catch(async (error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext)
    );
  });
}

/**
 * Initiates an updateDoc operation. Surfaces permission errors contextually.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data).catch(async (error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext)
    );
  });
}

/**
 * Initiates a deleteDoc operation. Surfaces permission errors contextually.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef).catch(async (error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext)
    );
  });
}
