import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'puppy-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @Input()
  students: any[];
  @ViewChild('searchBox', { read: MatInput }) searchBox: MatInput;
  @Output()
  select = new EventEmitter();

  result = [];

  private latestTerm = '';
  private searchTerms = new Subject<string>();

  constructor() {}

  searchTerm(t: string): void {
    const term = t.trim();
    this.searchTerms.next(term);
  }

  onlyUnique<T>(value: T, index: number, self: Array<T>): boolean {
    return self.indexOf(value) === index;
  }

  ngOnInit(): void {

    this.searchTerms
      .debounceTime(300)        // wait 300ms after each keystroke before considering the term
      .distinctUntilChanged()   // ignore if next search term is same as previous
      .subscribe(term => {
        this.latestTerm = term;
        this.update();
      });

  }

  isAny(arr: Array<String>) {
    return (arr.length === 0 ||
            (arr.length === 1 && arr[0] === 'Any'));
  }

  update(): void {
    if (this.latestTerm.length > 2) {
      this.result = this.getResults(this.students, this.latestTerm);
    } else {
      this.result = [];
    }
  }


  getResults(students: any[], term: string): any[] {

    const escape = (s: string) => {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    const filter = (elem): boolean => {

      if (!(term === null || term === '')) {
        const termregex = new RegExp(escape(term).replace(/\s+/g, ' '), 'i');
        return (termregex.test(elem._id) || termregex.test(elem.email) || termregex.test(elem.name.replace(/\s+/g, ' ')));
      }

      return true;

    };

    // Use forloop instead of filter
    // see https://jsperf.com/javascript-filter-vs-loop
    // return students.filter(filter);
    const resultArray = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      if (filter(student)) {
        resultArray.push(student);
      }
    }
    return resultArray;
  }

  onSelect(event: any) {
    this.searchTerms.next('');
    this.select.emit(event);
    (this.searchBox as any)._elementRef.nativeElement.value = '';
  }
}
