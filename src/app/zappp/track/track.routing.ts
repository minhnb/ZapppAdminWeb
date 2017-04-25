import { Routes, RouterModule }  from '@angular/router';

import { DeliverersMap } from './components/deliverersMap/deliverersMap.component';

const routes: Routes = [
	{
		path: '',
		component: DeliverersMap
	}
];

export const routing = RouterModule.forChild(routes);
