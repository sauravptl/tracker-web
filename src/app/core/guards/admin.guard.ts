import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const router = inject(Router);

    return authService.user$.pipe(
        take(1),
        switchMap(user => {
            if (!user) {
                router.navigate(['/login']);
                return of(false);
            }
            return userService.getUserProfileStream(user.uid).pipe(
                take(1),
                map(profile => {
                    if (profile?.role === 'admin') {
                        return true;
                    } else {
                        router.navigate(['/dashboard']);
                        return false;
                    }
                })
            );
        })
    );
};
