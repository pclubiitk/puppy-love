import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Crypto } from '../common/crypto';

const styles   = require('./credits.css');
const template = require('./credits.html');

@Component({
  selector: 'credits',
  template: template,
  styles: [ styles ]
})
export class Credits {
  constructor(public router: Router, public http: Http) {
  }

  homepage() {
    this.router.navigate(['home']);
  }
}
