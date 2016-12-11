import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';

const styles   = require('./search.css');
const template = require('./search.html');

@Component({
  selector: 'search',
  template: template,
  styles: [ styles ]
})
export class Search {
  @Input('placeholder') placeholder: string;
  @Input('md-items') suggestions: string[];
  @Input('md-content') content: string;

  @Output('md-search-text-change')
  textChange: EventEmitter<any> = new EventEmitter();

  @Output('md-search-text')
  searchText: EventEmitter<string> = new EventEmitter<string>();

  @Output('md-selected-item-change')
  selectedItem: EventEmitter<string> = new EventEmitter<string>();

  @Output('md-click-handler')
  clickEvent: EventEmitter<Event> = new EventEmitter<Event>();

  displayCompletions: boolean;

  // From here:
  // http://stackoverflow.com/questions/37034625/
  @HostListener('focusout', ['$event'])
  focusout(event) {
    setTimeout(() => this.displayCompletions = false, 300);
  }

  constructor() {
    this.content = '';
  }

  keyPressHandler(event: KeyboardEvent) {
    this.content = (<HTMLInputElement>event.target).value;
    this.textChange.emit(event);
    this.searchText.emit(this.content);
    this.displayCompletions = true;
  }

  clickHandler(event) {
    this.clickEvent.emit(event);
    this.displayCompletions = true;
  }

  itemClicked(event) {
    this.selectedItem.emit(event.target.innerText);
    this.displayCompletions = false;
  }
}
