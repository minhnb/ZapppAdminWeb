import { Component, ViewEncapsulation, Input} from '@angular/core';

@Component({
	selector: 'delivery-request-location-info',
	encapsulation: ViewEncapsulation.None,
    template: `
	<div class="col-xs-12 request-info" *ngIf="locationInfo">
		<div class="row user-info">
			<div class="col-xs-4">{{ 'GLOBAL.ADDRESS' | translate }}</div>
			<div class="col-xs-8">{{ locationInfo.full_address }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-4">Longitude</div>
			<div class="col-xs-8">{{ locationInfo.long }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-4">Latitude</div>
			<div class="col-xs-8">{{ locationInfo.lat }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-4">{{ 'REPORTS.USER_COMPANY' | translate }}</div>
			<div class="col-xs-8">{{ locationInfo.user_company }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-4">{{ 'GLOBAL.NOTE' | translate }}</div>
			<div class="col-xs-8">{{ locationInfo.note }}</div>
		</div>
	</div>
  `
})
export class DeliveryRequestLocationInfo {
    @Input() locationInfo: any = null;

    constructor() {

    }
}
