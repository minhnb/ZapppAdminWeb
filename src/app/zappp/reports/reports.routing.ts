import { Routes, RouterModule }  from '@angular/router';

import { Reports } from './reports.component';
import { DelivererAccounts } from './components/delivererAccounts';
import { DeliveryRequests } from './components/deliveryRequests';
import { PayOut } from './components/payOut';
import { PayOutDetails } from './components/payOutDetails';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
	{
		path: '',
		component: Reports,
		children: [
			{ path: 'deliverer-accounts', component: DelivererAccounts },
			{ path: 'delivery-requests', component: DeliveryRequests },
			{ path: 'pay-out-to-zappper', component: PayOut },
			{ path: 'pay-out-details/:deliveryId/:from/:to', component: PayOutDetails }
		]
	}
];

export const routing = RouterModule.forChild(routes);
