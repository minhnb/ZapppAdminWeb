import { Routes, RouterModule }  from '@angular/router';

import { Reports } from './reports.component';
import { DelivererAccounts } from './components/delivererAccounts';
import { DeliveryRequests } from './components/deliveryRequests';
import { PayOut } from './components/payOut';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
	{
		path: '',
		component: Reports,
		children: [
			{ path: 'deliverer-accounts', component: DelivererAccounts },
			{ path: 'delivery-requests', component: DeliveryRequests },
			{ path: 'pay-out-to-zappper', component: PayOut }
		]
	}
];

export const routing = RouterModule.forChild(routes);
