import { Routes, RouterModule }  from '@angular/router';

import { Reports } from './reports.component';
import { DelivererAccounts } from './components/delivererAccounts';
import { DelivererDetails } from './components/delivererDetails';
import { DeliveryRequests } from './components/deliveryRequests';
import { DeliveryRequestDetails } from './components/deliveryRequestDetails';
import { PayOut } from './components/payOut';
import { PayOutDetails } from './components/payOutDetails';

const routes: Routes = [
	{
		path: '',
		component: Reports,
		children: [
			{ path: 'deliverer-accounts', component: DelivererAccounts },
			{ path: 'deliverer/:delivererId', component: DelivererDetails },
			{ path: 'delivery-requests', component: DeliveryRequests },
			{ path: 'delivery-request-details/:deliveryRequestId', component: DeliveryRequestDetails },
			{ path: 'pay-out-to-zappper', component: PayOut },
			{ path: 'pay-out-details/:deliveryId/:from/:to', component: PayOutDetails }
		]
	}
];

export const routing = RouterModule.forChild(routes);
