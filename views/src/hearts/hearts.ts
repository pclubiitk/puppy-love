import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Person } from '../common/person';
import { Crypto } from '../common/crypto';

const styles   = require('./hearts.css');
const template = require('./hearts.html');

export class NumPair {
  constructor(
    public hearts: number,
    public lastcheck: number) {
  }
}

@Component({
  selector: 'hearts',
  template: template,
  styles: [ styles ]
})
export class Hearts {
  @Input('infoloaded') infoloaded: EventEmitter<NumPair>;
  @Output('infodone') infodone: EventEmitter<NumPair> =
    new EventEmitter<NumPair>();

  @Input('pubkeys') pubkeys;
  @Input('choices') choices: Person[];
  @Input('dataObserver') dataObserver: Observer<any>;
  @Input('crypto') crypto: Crypto;

  hearts: number;
  lastcheck: number;
  constructor(public http: Http) {
    this.hearts = 0;
    this.lastcheck = 0;
  }

  ngOnInit() {
    this.infoloaded.subscribe(info => this.getmorehearts(info));
  }

  getmorehearts(info: NumPair) {
    this.hearts = info.hearts;
    this.lastcheck = info.lastcheck;

    let ctime = new Date().valueOf();
    console.log('here at ' + ctime);

    this.http.get(Config.voteGet + '/' + this.lastcheck)
      .subscribe(
        response => {
          try {
            let resp = JSON.parse(response['_body']);
            this.lastcheck = resp.time;

            console.log(resp);
            for (let vote of resp.votes) {
              try {
                this.crypto.decryptAsym(vote.v);
                this.hearts = this.hearts + 1;
              } catch (err) {
                console.error('Could not catch this vote');
                console.log(vote.v);
              }
            }

            this.infodone.emit(new NumPair(this.hearts, this.lastcheck));
          } catch (err) {
            this.toast('Bad response for votes');
            console.error('Could not parse vote response');
            console.error(err);
          }
        },
        error => this.toast('Could not get votes')
      );
  }

  range(value) {
    let a = [];
    for (let i = 0; i < value; ++i) {
      a.push(i + 1);
    }
    return a;
  }

  toast(val: string) {
    this.dataObserver.next(val);
  }
}
