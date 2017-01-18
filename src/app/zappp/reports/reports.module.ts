import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { TranslateModule } from 'ng2-translate';
import { NgaModule } from '../../theme/nga.module';

import { routing } from './reports.routing';
import { Reports } from './reports.component';
import { DeliveryAccounts } from './components/deliveryAccounts/deliveryAccounts.component';
import { DeliveryRequests } from './components/deliveryRequests/deliveryRequests.component';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		NgaModule,
		routing
	],
	declarations: [
		Reports,
		DeliveryAccounts,
		DeliveryRequests
	],
	providers: [

	]
})
export default class ReportsModule { }
