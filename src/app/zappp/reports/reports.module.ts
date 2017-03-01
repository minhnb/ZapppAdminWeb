import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { TranslateModule } from 'ng2-translate';
import { NgaModule } from '../../theme/nga.module';
import { ModalModule } from 'ng2-bootstrap';
import { Ng2PaginationModule } from 'ng2-pagination';

import { routing } from './reports.routing';
import { Reports } from './reports.component';
import { DelivererAccounts } from './components/delivererAccounts/delivererAccounts.component';
import { DeliveryRequests } from './components/deliveryRequests/deliveryRequests.component';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		NgaModule,
		ModalModule.forRoot(),
		Ng2PaginationModule,
		routing
	],
	declarations: [
		Reports,
		DelivererAccounts,
		DeliveryRequests
	],
	providers: [

	]
})
export default class ReportsModule { }
