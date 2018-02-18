import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/toPromise';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { Crypto } from '../crypto';

export interface Stats {
  otherfemaleHearts: number;
  y17femaleHearts: number;
  y16femaleHearts: number;
  y15femaleHearts: number;
  y14femaleHearts: number;
  othermaleHearts: number;
  y17maleHearts: number;
  y16maleHearts: number;
  y15maleHearts: number;
  y14maleHearts: number;
  otherfemales: number;
  y17females: number;
  y16females: number;
  y15females: number;
  y14females: number;
  othermales: number;
  y17males: number;
  y16males: number;
  y15males: number;
  y14males: number;
}

interface LoginData {
  _id: string;
  name: string;
  email: string;
  gender: string;
  privKey: sjcl.SjclCipherEncrypted;
  pubKey: string;
  data: sjcl.SjclCipherEncrypted;
  submitted: boolean;
  matches: string;
}

interface MatchInfo {
  _id: string;
  matches: string;
}

interface Person {
  _id: string;
  name: string;
  email: string;
}

interface Heart {
  v: string;
  data: string;
}

interface Declare {
  _id: string;
  t0: string;
  t1: string;
  t2: string;
  t3: string;
}

interface ReceivedHeart {
  v: sjcl.SjclCipherEncrypted;
  genderOfSender: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  gender: string;
  submitted: boolean;
  crypto: Crypto;
  data: {
    choices: Person[],
    hearts: Heart[],
    lastCheck: number,
    received: ReceivedHeart[],
  }
}

@Injectable()
export class MainService {

  user$: BehaviorSubject<User> = new BehaviorSubject(null);
  matches$: BehaviorSubject<MatchInfo> = new BehaviorSubject(null);
  loggedIn = false;

  pubKeys: Map<string, string> = new Map();
  people: Person[];

  constructor(private http: HttpClient) {
    this.http.get<Person[]>('/api/list/all').subscribe((res) => {
      this.people = res;
    });
  }

  private getInfo(username:string, password: string) {
    const info = this.http.get<LoginData>('/api/users/data/info')
      .pipe(
        map(x => {
          const crypto = new Crypto(password);
          crypto.deserializePriv(crypto.decryptSym(x.privKey));
          crypto.deserializePub(x.pubKey);
          const data = Crypto.toJson(crypto.decryptSym(x.data));
          return {
            _id: x._id,
            name: x.name,
            email: x.email,
            gender: x.gender,
            submitted: x.submitted,
            crypto,
            data: {
              choices: data.choices || [],
              hearts: data.hearts || [],
              lastCheck: data.lastCheck || 0,
              received: data.received || [],
            }
          };
        }),
        tap((user) => this.user$.next(user)),
        tap(() => this.loggedIn = true)
      );
    return info;
  }

  private declareChoices(pubkeys: Map<string, string>) {
    const user = this.user$.value;
    let declarePayload = {'_id': user._id};
    let declarevalues = [];
    let heartvalues = [];
    let cnt = 0;
    for (let p of user.data.choices) {
      if (!pubkeys.has(p._id)) {
        console.log('Nk for ' + p._id);
        cnt = cnt + 1;
        continue;
      }
      const pubk = pubkeys.get(p._id);

      // Now calculate the heart values
      const cry = new Crypto();
      cry.deserializePub(pubk);
      heartvalues.push({
        'v': cry.encryptAsym(Crypto.getRand(1)),
        'data': cnt.toString(),
        'genderOfSender': user.gender,
      });

      const pairId = (user._id > p._id ? (user._id + '-' + p._id) : (p._id + '-' + user._id));
      declarevalues.push(Crypto.hash(pairId + '-' + user.crypto.diffieHellman(pubk)));
      cnt = cnt + 1;
    }

    // Trim down choices to 4
    let count = Math.min(4, cnt);
    for (let i = 0; i < count; i++) {
      declarePayload['t' + i] = declarevalues[i];
    }
    for (let i = count; i < 4; i++) {
      declarePayload['t' + i] = '';
    }

    return this.http.post('/api/users/data/submit/' + user._id, {
      hearts: heartvalues,
      tokens: declarePayload
    }).pipe (
      tap(() => console.log('Saved hearts: ' + heartvalues.length + ' and declare values: ' + count)),
    );

  }

  private getPubKeys() {
    return this.http.get('/api/list/pubkey')
      .pipe (
        map(items => {
          const pubkeys: Map<string, string> = new Map();
          for (let i in items) {
            pubkeys.set(items[i]['_id'], items[i]['pubKey']);
          }
          return pubkeys;
        })
      );
  }

  public getHearts(user: User) {
    return this.http.get<{ time: number, votes: ReceivedHeart[] }>('/api/hearts/get/' + (+user.data.lastCheck) + '/' + user._id)
      .pipe(
        map((hearts) => {
          const nuser = {
            ...user
          };
          nuser.data.lastCheck = hearts.time;
          const userhearts = nuser.data.received;
          for(let vote of hearts.votes) {
            const attempt = user.crypto.decryptAsym(vote.v);
            if (!attempt) {
              continue;
            }
            userhearts.push(vote);
          }
          nuser.data.received = userhearts;
          return nuser;
        }),
        tap((nuser) => this.user$.next(nuser)),
        tap(() => this.save())
      );
  }

  public submit() {
    return this.getPubKeys().pipe(
      switchMap((pub) => this.declareChoices(pub)),
      tap(() => this.save()),
      tap(() => {
        this.user$.next({
          ...this.user$.value,
          submitted: true,
        });
      })
    );
  }

  public login(username: string, _password: string) {
    const password = Crypto.hash(_password);
    return this.http.post('/api/session/login', { username, password }).pipe(
      switchMap(() => this.getInfo(username, _password)),
      switchMap((user) => this.getHearts(user)),
      catchError((err) => {
        console.log(err);
        if (err.error instanceof Error) {
          // A client-side or network error occurred. Handle it accordingly.
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          if (err.status === 202) {
            return of('');
          } else if (err.status === 403) {
            return Observable.throw('It seems you entered a wrong password');
          } else if (err.status === 404) {
            return Observable.throw('Your roll number is wrong. Please use your IITK roll no.');
          }
        }
        return Observable.throw('An Error Occurred!! Please try again.');
      })
    );
  }

  public signup(body: any) {
    return this.http.post('/api/users/login/first', body).pipe(
      catchError((err) => Observable.throw('Wrong Authentication Code!! Try Again'))
    );
  }

  public mail(roll: string): Observable<string> {
    return this.http.get('/api/users/mail/' + roll).pipe(
      map(() => 'Mail sent to your @iitk ID !'),
      catchError((err) => {
        if (err.error instanceof Error) {
          // A client-side or network error occurred. Handle it accordingly.
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          if (err.status === 202) {
            return of('Mail sent to your @iitk ID !');
          } else if (err.status === 404) {
            return of('Your information was not found in our database. Please send us a mail at pclubiitk@gmail.com');
          } else if (err.status === 400) {
            return of('You have already registered');
          }
        }
        return of('There was an error. Let us know at pclubiitk@gmail.com');
      })
    );
  }

  public matches(): Observable<MatchInfo> {
    const user = this.user$.value;
    return this.http.get<MatchInfo>('/api/users/data/match/' + user._id).pipe(
      tap(x => this.matches$.next(x)),
      catchError((err) => {
        console.error(err);
        return Observable.throw('There was an error. Please try again.');
      })
    );
  }

  public stats(): Observable<Stats> {
    return this.http.get<Stats>('/api/stats').pipe(
      catchError((err) => {
        console.error(err);
        return Observable.throw('There was an error. Please try again.');
      }),
    );
  }

  save(): Promise<any> {
    const user = this.user$.value;
    const data = user.data;
    console.log(data);
    const encData = user.crypto.encryptSym(Crypto.fromJson(data));
    return this.http.post('/api/users/data/update/' + user._id, {
      data: encData,
    }).toPromise();
  }

}
