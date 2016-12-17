import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Person } from '../common/person';

const styles   = require('./choices.css');
const template = require('./choices.html');

@Component({
  selector: 'choices',
  template: template,
  styles: [ styles ]
})
export class Choices {
  @Input('people') people: Person[];

  @Output('person-remove')
  selectedItem: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

  itemClicked(event) {
    this.selectedItem.emit(event.target.id.split('-')[1].trim());
  }
}
