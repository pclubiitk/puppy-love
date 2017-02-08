import { Routes } from '@angular/router';
import { Home } from './home';
import { Login } from './login';
import { About } from './about';
import { Howto } from './howto';
import { Secure } from './secure';
import { Credits } from './credits';
import { Signup } from './signup';
import { AuthGuard } from './common/auth.guard';

export const routes: Routes = [
  { path: '',        component: Login },
  { path: 'login',   component: Login },
  { path: 'about',   component: About },
  { path: 'howto',   component: Howto},
  { path: 'secure',  component: Secure},
  { path: 'signup',  component: Signup },
  { path: 'credits', component: Credits },
  { path: 'home',    component: Home, canActivate: [AuthGuard] },
  { path: '**',      component: Login },
];
