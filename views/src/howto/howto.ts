import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Crypto } from '../common/crypto';

const styles   = require('./howto.css');
const template = require('./howto.html');

@Component({
  selector: 'howto',
  template: template,
  styles: [ styles ]
})
export class Howto {
  constructor(public router: Router, public http: Http) {
  }

  homepage() {
    this.router.navigate(['home']);
  }
}
