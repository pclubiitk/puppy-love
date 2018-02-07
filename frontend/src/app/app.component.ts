import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'puppy-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    public snackBar: MatSnackBar,
    private updates: SwUpdate,
  ) {}

  ngOnInit() {
    this.updates.available.subscribe(event => {
      const snackBarRef = this.snackBar.open(
        'Updated content is available',
        'Reload',
        {
          duration: 3000
        }
      );
      snackBarRef.onAction().subscribe(() => {
        this.updates.activateUpdate().then(() => location.reload(true));
      });
    });
    this.updates.activated.subscribe(event => {
      this.snackBar.open(
        'Content is now available offline!',
        '',
        {
          duration: 1000
        }
      );
    });
  }
}
