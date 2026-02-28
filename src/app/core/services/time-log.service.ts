import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, query, where, orderBy, limit, collectionData, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface TimeLog {
  id?: string;
  userId: string;
  taskId?: string;
  startTime: any; // Timestamp or Date
  endTime?: any; // Timestamp or Date
  duration: number; // in seconds
  orgId: string;
  type?: 'work' | 'break';
}

@Injectable({
  providedIn: 'root'
})
export class TimeLogService {
  private firestore = inject(Firestore);
  private _timeLogsCollection?: CollectionReference;

  private get timeLogsCollection(): CollectionReference {
    if (!this._timeLogsCollection) {
      this._timeLogsCollection = collection(this.firestore, 'timeLogs');
    }
    return this._timeLogsCollection;
  }

  async createTimeLog(log: TimeLog): Promise<string> {
    const docRef = await addDoc(this.timeLogsCollection, log);
    return docRef.id;
  }

  getRecentLogs(userId: string, limitCount: number = 10): Observable<TimeLog[]> {
    const q = query(
      this.timeLogsCollection,
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      limit(limitCount)
    );
    return collectionData(q, { idField: 'id' }) as Observable<TimeLog[]>;
  }

  getTodayLogs(userId: string): Observable<TimeLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      this.timeLogsCollection,
      where('userId', '==', userId),
      where('startTime', '>=', today),
      where('startTime', '<', tomorrow)
    );
    return collectionData(q, { idField: 'id' }) as Observable<TimeLog[]>;
  }

  getWeekLogs(userId: string): Observable<TimeLog[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    const q = query(
      this.timeLogsCollection,
      where('userId', '==', userId),
      where('startTime', '>=', lastWeek),
      where('startTime', '<=', today)
    );
    return collectionData(q, { idField: 'id' }) as Observable<TimeLog[]>;
  }

  getLogsInRange(userId: string, startDate: Date, endDate: Date): Observable<TimeLog[]> {
    const q = query(
      this.timeLogsCollection,
      where('userId', '==', userId),
      where('startTime', '>=', startDate),
      where('startTime', '<=', endDate),
      orderBy('startTime', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<TimeLog[]>;
  }
}
