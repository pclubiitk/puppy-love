import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import 'rxjs/add/operator/finally';

import { MainService } from '../../services/main.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: [ './signup.component.scss' ]
})
export class SignupComponent {

  loading = false;

  constructor(private main: MainService,
              private router: Router,
              private snackBar: MatSnackBar) {}

  signup(event: any) {
    this.loading = true;
    this.main.signup(event)
      .finally(() => this.loading = false)
      .subscribe(
        () => this.router.navigate([ 'login' ]),
        (err) => this.snackBar.open(err, '', {
          duration: 3000
        }));
  }

  mail(roll: string) {
    this.loading = true;
    this.main.mail(roll)
      .finally(() => this.loading = false)
      .subscribe(
        (msg) => {
          console.log(msg);
          this.snackBar.open(msg, '', {
            duration: 3000
          })
        });
  }

}
