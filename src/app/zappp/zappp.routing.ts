import { Routes, RouterModule }  from '@angular/router';
import { Zappp } from './zappp.component';
import { AuthGuard } from '../helper/auth.guard';
import { AuthLoggedIn } from '../helper/auth.loggedin';

const routes: Routes = [
	{
		path: 'login',
		canActivate: [AuthLoggedIn],
		loadChildren: () => System.import('./login/login.module')
	},
	{
		path: 'register',
		canActivate: [AuthLoggedIn],
		loadChildren: () => System.import('./register/register.module')
	},
	{
		path: '',
		component: Zappp,
		canActivate: [AuthGuard],
		children: [
			{
				path: '', redirectTo: 'dashboard',
				pathMatch: 'full'
			},
			{
				path: 'dashboard',
				loadChildren: () => System.import('./dashboard/dashboard.module')
			},
			{
				path: 'reports',
				loadChildren: () => System.import('./reports/reports.module')
			},
			{
				path: 'tables',
				loadChildren: () => System.import('./tables/tables.module')
			},
			{
				path: 'maps',
				loadChildren: () => System.import('./maps/maps.module')
			}
		]
	}
];

export const routing = RouterModule.forChild(routes);
