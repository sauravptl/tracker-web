import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, where, collectionData, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Project {
  id?: string;
  name: string;
  description: string;
  orgId: string;
  createdAt: any;
  updatedAt: any;
  managerId?: string; // userId
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private firestore = inject(Firestore);
  private _projectsCollection?: CollectionReference;

  private get projectsCollection(): CollectionReference {
    if (!this._projectsCollection) {
      this._projectsCollection = collection(this.firestore, 'projects');
    }
    return this._projectsCollection;
  }

  getProjects(orgId: string): Observable<Project[]> {
    const q = query(this.projectsCollection, where('orgId', '==', orgId));
    return collectionData(q, { idField: 'id' }) as Observable<Project[]>;
  }

  getProject(id: string): Observable<Project | undefined> {
    const docRef = doc(this.firestore, `projects/${id}`);
    return new Observable(observer => {
      import('@angular/fire/firestore').then(({ onSnapshot }) => {
        return onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            observer.next({ id: snap.id, ...snap.data() } as Project);
          } else {
            observer.next(undefined);
          }
        }, error => observer.error(error));
      });
    });
  }

  async createProject(project: Project): Promise<string> {
    const docRef = await addDoc(this.projectsCollection, project);
    return docRef.id;
  }

  async updateProject(projectId: string, data: Partial<Project>): Promise<void> {
    const docRef = doc(this.projectsCollection, projectId);
    return updateDoc(docRef, { ...data, updatedAt: new Date() });
  }

  async deleteProject(projectId: string): Promise<void> {
    const docRef = doc(this.projectsCollection, projectId);
    return deleteDoc(docRef);
  }
}
