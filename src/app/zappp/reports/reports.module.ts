import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule }  from '@angular/common';
import { TranslateModule } from 'ng2-translate';
import { NgaModule } from '../../theme/nga.module';
import { ModalModule } from 'ng2-bootstrap';
import { Ng2PaginationModule } from 'ng2-pagination';
import { DateTimePickerModule } from '../../helper/datetimepicker';

import { routing } from './reports.routing';
import { Reports } from './reports.component';
import { DelivererAccounts } from './components/delivererAccounts/delivererAccounts.component';
import { DeliveryRequests } from './components/deliveryRequests/deliveryRequests.component';
import { DeliveryRequestUserInfo } from './components/deliveryRequests/deliveryRequestUserInfo.component';
import { DeliveryRequestLocationInfo } from './components/deliveryRequests/deliveryRequestLocationInfo.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		TranslateModule,
		NgaModule,
		ModalModule.forRoot(),
		Ng2PaginationModule,
		DateTimePickerModule,
		routing
	],
	declarations: [
		Reports,
		DelivererAccounts,
		DeliveryRequests,
		DeliveryRequestUserInfo,
		DeliveryRequestLocationInfo
	],
	providers: [

	]
})
export default class ReportsModule { }
