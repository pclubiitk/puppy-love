import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  AboutComponent,
  HowItWorksComponent,
  HowToComponent,
  LoginComponent,
  MainComponent,
} from './containers';

const routes: Routes = [{
  path: '', component: MainComponent, children: [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'about', component: AboutComponent },
    { path: 'how-it-works', component: HowItWorksComponent },
    { path: 'howto', component: HowToComponent },
    { path: 'login', component: LoginComponent },
  ]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
