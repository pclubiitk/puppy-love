import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { MainService } from '../services/main.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(private router: Router,
              private main: MainService) {}

  canActivate() {
    if (!this.main.loggedIn) {
      this.router.navigate([ '/login' ]);
    }
    return this.main.loggedIn;
  }
}
