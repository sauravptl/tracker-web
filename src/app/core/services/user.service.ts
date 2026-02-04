import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, query, where, collectionData, CollectionReference } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'manager' | 'employee';
  status?: 'pending' | 'active' | 'rejected';
  orgId?: string;
  deptId?: string;
  isClockedIn?: boolean;
  currentSessionStart?: any; // Timestamp or Date
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private _usersCollection?: CollectionReference;

  private get usersCollection(): CollectionReference {
    if (!this._usersCollection) {
      this._usersCollection = collection(this.firestore, 'users');
    }
    return this._usersCollection;
  }

  async createUserProfile(user: UserProfile): Promise<void> {
    const docRef = doc(this.usersCollection, user.uid);
    return setDoc(docRef, user);
  }

  getUserProfile(uid: string): Observable<UserProfile | undefined> {
    const docRef = doc(this.usersCollection, uid);
    return from(getDoc(docRef).then(snap => snap.data() as UserProfile));
  }

  getOrgUsers(orgId: string): Observable<UserProfile[]> {
    const q = query(this.usersCollection, where('orgId', '==', orgId));
    return collectionData(q, { idField: 'uid' }) as Observable<UserProfile[]>;
  }

  updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(this.usersCollection, uid);
    return updateDoc(docRef, data);
  }
}
