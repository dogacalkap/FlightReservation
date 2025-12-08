import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
