import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, query, where, collectionData, updateDoc, docData, CollectionReference } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

export interface Organization {
  id?: string;
  name: string;
  ownerId: string;
  logoUrl?: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private firestore = inject(Firestore);
  private _orgsCollection?: CollectionReference;

  private get orgsCollection(): CollectionReference {
    if (!this._orgsCollection) {
      this._orgsCollection = collection(this.firestore, 'organizations');
    }
    return this._orgsCollection;
  }

  async createOrganization(org: Organization): Promise<string> {
    const docRef = doc(this.orgsCollection);
    await setDoc(docRef, { ...org, id: docRef.id });
    return docRef.id;
  }

  getOrganization(orgId: string): Observable<Organization | undefined> {
    const docRef = doc(this.firestore, 'organizations', orgId);
    return docData(docRef, { idField: 'id' }) as Observable<Organization>;
  }

  getUserOrganizations(userId: string): Observable<Organization[]> {
    const q = query(this.orgsCollection, where('ownerId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Organization[]>;
  }

  getAllOrganizations(): Observable<Organization[]> {
    return collectionData(this.orgsCollection, { idField: 'id' }) as Observable<Organization[]>;
  }

  searchOrganizations(term: string): Observable<Organization[]> {
    const q = query(
      this.orgsCollection,
      where('name', '>=', term),
      where('name', '<=', term + '\uf8ff')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Organization[]>;
  }

  async updateOrganization(orgId: string, data: Partial<Organization>): Promise<void> {
    const docRef = doc(this.firestore, 'organizations', orgId);
    return updateDoc(docRef, data);
  }
}
