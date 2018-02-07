import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoggedInGuard } from './guards/logged-in.guard';
import { LoggedOutGuard } from './guards/logged-out.guard';

import {
  AboutComponent,
  HowItWorksComponent,
  HowToComponent,
  LoginComponent,
  MainComponent,
  SignupComponent,
  HomeComponent,
} from './containers';

const routes: Routes = [{
  path: '', component: MainComponent, children: [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'about', component: AboutComponent },
    { path: 'how-it-works', component: HowItWorksComponent },
    { path: 'howto', component: HowToComponent },
    { path: 'login', component: LoginComponent, canActivate: [ LoggedOutGuard ] },
    { path: 'signup', component: SignupComponent, canActivate: [ LoggedOutGuard ] },
  ]
}, { path: 'home', component: HomeComponent, canActivate: [ LoggedInGuard ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
