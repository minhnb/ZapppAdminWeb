import { Routes, RouterModule }  from '@angular/router';

import { Localization } from './components/localization';
import { Settings } from './settings.component';

const routes: Routes = [
	{
		path: '',
		component: Settings,
		children: [
			{ path: 'localization', component: Localization }
		]
	}
];

export const routing = RouterModule.forChild(routes);
