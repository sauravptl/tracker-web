import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface ExpenseClaim {
  id?: string;
  userId: string;
  orgId: string;
  amount: number;
  currency: string;
  description: string;
  date: any; // Timestamp or Date
  status: ExpenseStatus;
  receiptUrl?: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private firestore = inject(Firestore);
  private expensesCollection = collection(this.firestore, 'expenseClaims');

  async createExpense(claim: ExpenseClaim): Promise<string> {
    const docRef = await addDoc(this.expensesCollection, claim);
    return docRef.id;
  }

  getMyExpenses(userId: string): Observable<ExpenseClaim[]> {
    const q = query(
      this.expensesCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<ExpenseClaim[]>;
  }

  getOrgExpenses(orgId: string): Observable<ExpenseClaim[]> {
    const q = query(
      this.expensesCollection,
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<ExpenseClaim[]>;
  }

  async updateStatus(claimId: string, status: ExpenseStatus): Promise<void> {
    const docRef = doc(this.expensesCollection, claimId);
    return updateDoc(docRef, { status });
  }
}
