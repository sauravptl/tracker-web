import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { UserService } from '../services/user.service';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const pendingApprovalGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const userService = inject(UserService);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    switchMap(currentUser => {
      if (!currentUser) {
        // Let authGuard handle redirection to login
        return of(true);
      }

      return userService.getUserProfile(currentUser.uid).pipe(
        map(profile => {
          if (profile?.status === 'pending') {
            router.navigate(['/pending-approval']);
            return false;
          }

          if (profile?.status === 'rejected') {
            router.navigate(['/login']); // Or show an error
            return false;
          }

          return true;
        })
      );
    })
  );
};
