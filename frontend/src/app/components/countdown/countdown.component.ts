import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
import { interval } from 'rxjs/observable/interval';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'puppy-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: [ './countdown.component.scss' ]
})
export class CountdownComponent implements OnInit {
  current: string;
  subs: Subscription;

  ngOnInit() {
    this.updateCurrent();
    this.subs = interval(1000).subscribe(() => this.updateCurrent());
  }

  ngOnDestroy() {
    if (this.subs)
      this.subs.unsubscribe();
  }

  updateCurrent() {
    const eventdate = moment([2019, 1, 8]);
    const todaysdate = moment();
    const totalSeconds = eventdate.diff(todaysdate, 'seconds');
    const seconds = totalSeconds % 60;
    const totalminutes = Math.floor(totalSeconds / 60);
    const minutes = totalminutes % 60;
    const hours = Math.floor(totalminutes / 60);
    let hourString = "" + hours;
    let minuteString = "" + minutes;
    let secondsString = "" + seconds;
    if (hourString.length < 2) {
      hourString = "0" + hourString;
    }
    if (minuteString.length < 2) {
      minuteString = "0" + minuteString;
    }
    if (secondsString.length < 2) {
      secondsString = "0" + secondsString;
    }
    this.current = `${ hourString }:${ minuteString }:${ secondsString }`;
  }

}
