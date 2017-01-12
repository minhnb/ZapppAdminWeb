import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
	{
		path: '**',
		redirectTo: 'login'
	},
    {
		path: '',
		redirectTo: 'pages',
		pathMatch: 'full'
	}
];

export const routing = RouterModule.forRoot(routes, { useHash: false });
