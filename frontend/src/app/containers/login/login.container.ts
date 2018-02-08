import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import 'rxjs/add/operator/finally';

import { MainService } from '../../services/main.service';

@Component({
  templateUrl: './login.container.html',
  styleUrls: [ './login.container.scss' ]
})
export class LoginComponent {

  loading = false;

  constructor(private main: MainService,
              private router: Router,
              private snackBar: MatSnackBar) {}

  onLogin(login: { roll: string, password: string }) {
    this.loading = true;
    this.main.login(login.roll, login.password)
      .finally(() => this.loading = false)
      .subscribe(
        () => this.router.navigate([ 'home' ]),
        (err) => this.snackBar.open(err, '', {
          duration: 3000
        }));
  }

}
