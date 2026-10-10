import { Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AuthLayoutComponent } from './auth/auth-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './auth.service';

export const routes: Routes = [
	{
		path: '',
		component: AuthLayoutComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'login' },
			{ path: 'login', component: LoginComponent },
			{ path: 'register', component: RegisterComponent },
		],
	},
	{ path: 'account', component: AccountComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: 'login' },
];
