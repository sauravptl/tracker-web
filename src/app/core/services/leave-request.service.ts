import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type LeaveType = 'SICK' | 'VACATION' | 'PERSONAL';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id?: string;
  userId: string;
  orgId: string;
  startDate: any; // Timestamp or Date
  endDate: any; // Timestamp or Date
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private firestore = inject(Firestore);
  private leavesCollection = collection(this.firestore, 'leaveRequests');

  async createLeaveRequest(request: LeaveRequest): Promise<string> {
    const docRef = await addDoc(this.leavesCollection, request);
    return docRef.id;
  }

  getMyRequests(userId: string): Observable<LeaveRequest[]> {
    const q = query(
      this.leavesCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<LeaveRequest[]>;
  }

  getOrgRequests(orgId: string): Observable<LeaveRequest[]> {
    const q = query(
      this.leavesCollection,
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<LeaveRequest[]>;
  }

  async updateStatus(requestId: string, status: LeaveStatus): Promise<void> {
    const docRef = doc(this.leavesCollection, requestId);
    return updateDoc(docRef, { status });
  }
}
