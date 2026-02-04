import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User, UserCredential, sendPasswordResetEmail } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Signal to expose the current user state
  userSignal = signal<User | null>(null);

  // Observable for traditional reactive flows
  user$ = user(this.auth);

  constructor() {
    // Sync signal with observable
    this.user$.subscribe(u => this.userSignal.set(u));
  }

  register(email: string, pass: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, pass));
  }

  login(email: string, pass: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, pass));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }
}
