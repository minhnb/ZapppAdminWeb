import { Component, ViewEncapsulation, Input} from '@angular/core';

@Component({
	selector: 'delivery-request-location-info',
	encapsulation: ViewEncapsulation.None,
    template: `
	<div class="col-xs-12 request-info" *ngIf="locationInfo">
		<div class="row user-info">
			<div class="col-xs-6 col-lg-4 col-xlg-3">{{ 'GLOBAL.ADDRESS' | translate }}</div>
			<div class="col-xs-6 col-lg-8 col-xlg-9">{{ locationInfo.full_address }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-6 col-lg-4 col-xlg-3">Longitude</div>
			<div class="col-xs-6 col-lg-8 col-xlg-9">{{ locationInfo.long }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-6 col-lg-4 col-xlg-3">Latitude</div>
			<div class="col-xs-6 col-lg-8 col-xlg-9">{{ locationInfo.lat }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-6 col-lg-4 col-xlg-3">{{ 'REPORTS.USER_NAME' | translate }}</div>
			<div class="col-xs-6 col-lg-8 col-xlg-9">{{ locationInfo.user_name }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-6 col-lg-4 col-xlg-3">{{ 'REPORTS.USER_PHONE_NUMBER' | translate }}</div>
			<div class="col-xs-6 col-lg-8 col-xlg-9">{{ locationInfo.user_phone_number }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-6 col-lg-4 col-xlg-3">{{ 'REPORTS.USER_COMPANY' | translate }}</div>
			<div class="col-xs-6 col-lg-8 col-xlg-9">{{ locationInfo.user_company }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-6 col-lg-4 col-xlg-3">{{ 'GLOBAL.NOTE' | translate }}</div>
			<div class="col-xs-6 col-lg-8 col-xlg-9">{{ locationInfo.note }}</div>
		</div>
	</div>
  `
})
export class DeliveryRequestLocationInfo {
    @Input() locationInfo: any = null;

    constructor() {

    }
}
