import { Routes, RouterModule }  from '@angular/router';

import { Reports } from './reports.component';
import { DelivererAccounts } from './components/delivererAccounts/delivererAccounts.component';
import { DeliveryRequests } from './components/deliveryRequests/deliveryRequests.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
	{
		path: '',
		component: Reports,
		children: [
			{ path: 'deliverer-accounts', component: DelivererAccounts },
			{ path: 'delivery-requests', component: DeliveryRequests }
		]
	}
];

export const routing = RouterModule.forChild(routes);
