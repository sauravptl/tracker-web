import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, where, collectionData, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo: string[]; // userIds
  status: TaskStatus;
  priority: TaskPriority;
  orgId: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore = inject(Firestore);
  private _tasksCollection?: CollectionReference;

  private get tasksCollection(): CollectionReference {
    if (!this._tasksCollection) {
      this._tasksCollection = collection(this.firestore, 'tasks');
    }
    return this._tasksCollection;
  }

  getTasks(orgId: string): Observable<Task[]> {
    const q = query(this.tasksCollection, where('orgId', '==', orgId));
    return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
  }

  getMyTasks(userId: string): Observable<Task[]> {
    const q = query(
      this.tasksCollection,
      where('assignedTo', 'array-contains', userId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
  }

  async createTask(task: Task): Promise<string> {
    const docRef = await addDoc(this.tasksCollection, task);
    return docRef.id;
  }

  async updateTask(taskId: string, data: Partial<Task>): Promise<void> {
    const docRef = doc(this.tasksCollection, taskId);
    return updateDoc(docRef, data);
  }

  async deleteTask(taskId: string): Promise<void> {
    const docRef = doc(this.tasksCollection, taskId);
    return deleteDoc(docRef);
  }
}
