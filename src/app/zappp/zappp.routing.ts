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
		path: 'admin/login',
		canActivate: [AuthLoggedIn],
		loadChildren: () => System.import('./admin/login/login.module')
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
				path: 'track',
				loadChildren: () => System.import('./track/track.module')
			},
			{
				path: 'settings',
				loadChildren: () => System.import('./settings/settings.module')
			}
		]
	}
];

export const routing = RouterModule.forChild(routes);
