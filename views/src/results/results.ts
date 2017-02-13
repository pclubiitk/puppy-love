import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Person } from '../common/person';
import { DataService } from '../data.service';
import { ToastService } from '../toasts';

const styles   = require('./results.css');
const template = require('./results.html');

@Component({
  selector: 'results',
  template: template,
  styles: [ styles ]
})
export class Results {
  @Input('display') display: EventEmitter<boolean>;

  displayres: boolean = false;
  fetching: boolean = false;

  matches = [];

  constructor(public http: Http,
              public dataservice: DataService,
              public t: ToastService) {
  }

  ngOnInit() {
    this.display.subscribe(x => {
      if (this.displayres === false) {
        this.fetching = true;
        this.fetchresults();
        this.displayres = true;
      }
    });
  }

  fetchresults() {
    this.http.get(Config.matchUrl + '/' + this.dataservice.id)
      .subscribe(
        response => {
          let res;
          try {
            res = JSON.parse(response['_body']);
          } catch (e) {
            this.t.toast('There was an error parsing matches');
            return;
          }

          if (!res || res.matches === undefined) {
            this.t.toast('There was an error fetching matches');
            console.error('Matches');
            console.log(res);
            console.log(res.matches);
            return;
          }
          let tmpres = res.matches.split(' ');
          let finalres = [];
          for (let r of tmpres) {
            for (let p of this.dataservice.choices) {
              if (r === p.roll) {
                finalres.push(r);
                break;
              }
            }
          }

          this.matches = finalres;

          this.fetching = false;
        },
        error => {
          console.error('Could not fetch matches');
          console.error(error);
          this.t.toast('There was an error fetching matches');
          this.matches = [];
          this.fetching = false;
        }
      );
  }

  shutdown() {
    this.displayres = false;
  }
}
