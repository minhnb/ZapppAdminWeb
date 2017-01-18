import { Routes, RouterModule }  from '@angular/router';

import { Reports } from './reports.component';
import { DeliveryAccounts } from './components/deliveryAccounts/deliveryAccounts.component';
import { DeliveryRequests } from './components/deliveryRequests/deliveryRequests.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
	{
		path: '',
		component: Reports,
		children: [
			{ path: 'delivery-accounts', component: DeliveryAccounts },
			{ path: 'delivery-requests', component: DeliveryRequests }
		]
	}
];

export const routing = RouterModule.forChild(routes);
