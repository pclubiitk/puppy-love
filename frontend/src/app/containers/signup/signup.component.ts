import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MainService } from '../../services/main.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: [ './signup.component.scss' ]
})
export class SignupComponent {

  constructor(private main: MainService,
              private router: Router,
              private snackBar: MatSnackBar) {}

  signup(event: any) {
    this.main.signup(event)
      .subscribe(
        () => this.router.navigate([ 'login' ]),
        (err) => this.snackBar.open(err, '', {
          duration: 3000
        }));
  }

  mail(roll: string) {
    this.main.mail(roll)
      .subscribe(
        (msg) => {
          console.log(msg);
          this.snackBar.open(msg, '', {
            duration: 3000
          })
        });
  }

}
