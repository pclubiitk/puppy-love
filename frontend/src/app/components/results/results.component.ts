import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

import { of } from 'rxjs/observable/of';
import { catchError, switchMap } from 'rxjs/operators';
import { MainService, Stats } from '../../services/main.service';

function ImageURL(rollnum: string, userid: string) {
    const iitkhome = `http://home.iitk.ac.in/~${ userid }/dp`;
    const oaimage = `https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${ rollnum }_0.jpg`;
    return `url("${ iitkhome }"), url("${ oaimage }")`;
}

@Component({
  selector: 'puppy-results',
  templateUrl: './results.component.html',
  styleUrls: [ './results.component.scss' ]
})
export class ResultsComponent implements OnInit {

  user$: any;
  matches: any[];
  stats: Stats;

  colorScheme = {
    domain: ['#C2024F', '#04BBBF', '#D2D945', '#FCB13F', '#FF594F']
  };

  constructor(private main: MainService,
              private sanitizer: DomSanitizer,
              private snackbar: MatSnackBar) {}

  ngOnInit() {
    this.user$ = this.main.user$;
    this.doSubmit();
    this.getStats();
  }

  get url() {
    const currentUser = {
      ...this.main.user$.value
    };
    return this.sanitizer.bypassSecurityTrustStyle(ImageURL(currentUser._id, currentUser.email));
  }

  get registrations() {
    const stats = this.stats;
    const totalMales = stats.othermales + stats.y15males + stats.y16males + stats.y17males + stats.y18males;
    const totalFemales = stats.otherfemales + stats.y15females + stats.y16females + stats.y17females + stats.y18females;
    return [{
      name: 'Males',
      value: totalMales,
    }, {
      name: 'Females',
      value: totalFemales,
    }];
  }

  get hearts() {
    const stats = this.stats;
    const totalMaleHearts = stats.othermaleHearts + stats.y15maleHearts + stats.y16maleHearts + stats.y17maleHearts + stats.y18maleHearts;
    const totalFemaleHearts = stats.otherfemaleHearts + stats.y15femaleHearts + stats.y16femaleHearts + stats.y17femaleHearts + stats.y18femaleHearts;
    return [{
      name: 'Males',
      value: totalMaleHearts,
    }, {
      name: 'Females',
      value: totalFemaleHearts,
    }];
  }
  get fhearts() {
    const stats = this.stats;
    return [{
      name: 'Others',
      value: stats.otherfemaleHearts,
    }, {
      name: 'Y15',
      value: stats.y15femaleHearts,
    }, {
      name: 'Y16',
      value: stats.y16femaleHearts,
    }, {
      name: 'Y17',
      value: stats.y17femaleHearts,
    }, {
      name: 'Y18',
      value: stats.y18femaleHearts,
    }].reverse();

  }

  get mhearts() {
    const stats = this.stats;
    return [{
      name: 'Others',
      value: stats.othermaleHearts,
    }, {
      name: 'Y15',
      value: stats.y15maleHearts,
    }, {
      name: 'Y16',
      value: stats.y16maleHearts,
    }, {
      name: 'Y17',
      value: stats.y17maleHearts,
    }, {
      name: 'Y18',
      value: stats.y18maleHearts,
    }].reverse();
  }

  get fregs() {
    const stats = this.stats;
    return [{
      name: 'Others',
      value: stats.otherfemales,
    }, {
      name: 'Y15',
      value: stats.y15females,
    }, {
      name: 'Y16',
      value: stats.y16females,
    }, {
      name: 'Y17',
      value: stats.y17females,
    }, {
      name: 'Y18',
      value: stats.y18females,
    }].reverse();

  }

  get mregs() {
    const stats = this.stats;
    return [{
      name: 'Others',
      value: stats.othermales,
    }, {
      name: 'Y15',
      value: stats.y15males,
    }, {
      name: 'Y16',
      value: stats.y16males,
    }, {
      name: 'Y17',
      value: stats.y17males,
    }, {
      name: 'Y18',
      value: stats.y18males,
    }].reverse();
  }

  maleHearts(user) {
    return user.data.received.filter((x) => x.genderOfSender === '1');
  }

  femaleHearts(user) {
    return user.data.received.filter((x) => x.genderOfSender === '0');
  }

  doSubmit() {
    const user = this.user$.value;
    this.main.submit().pipe(
      catchError((err) => of(console.error(err))),
      switchMap(() => this.main.matches()),
    ).subscribe(
      (match) => {
        if (match.matches === '') {
          this.matches = [];
        } else {
          this.matches = match.matches.split(' ').map(x => this.main.people.filter(p => p._id === x)[0]);
        }
      },
      (error) => this.snackbar.open(error, '', { duration: 3000 })
    );
  }

  getStats() {
    this.main.stats().subscribe((x) => this.stats = x);
  }

  onLogout() {
    location.reload();
  }
}
