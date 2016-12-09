import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate() {
    // Bypass because backend is properly authenticated
    return true;

    // if (tokenNotExpired()) {
    //   return true;
    // }

    // this.router.navigate(['/login']);
    // return false;
  }
}
