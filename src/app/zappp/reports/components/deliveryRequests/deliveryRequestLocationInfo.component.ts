import { Component, ViewEncapsulation, Input} from '@angular/core';

@Component({
	selector: 'delivery-request-location-info',
	encapsulation: ViewEncapsulation.None,
    template: `
	<div class="col-xs-12 request-info" *ngIf="locationInfo">
		<div class="row user-info">
			<div class="col-xs-4 col-sm-3 col-md-2">{{ 'GLOBAL.ADDRESS' | translate }}</div>
			<div class="col-xs-8 col-sm-9 col-md-10">{{ locationInfo.full_address }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-4 col-sm-3 col-md-2">Longitude</div>
			<div class="col-xs-8 col-sm-9 col-md-10">{{ locationInfo.long }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-4 col-sm-3 col-md-2">Latitude</div>
			<div class="col-xs-8 col-sm-9 col-md-10">{{ locationInfo.lat }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-4 col-sm-3 col-md-2">{{ 'REPORTS.USER_COMPANY' | translate }}</div>
			<div class="col-xs-8 col-sm-9 col-md-10">{{ locationInfo.user_company }}</div>
		</div>
		<div class="row user-info">
			<div class="col-xs-4 col-sm-3 col-md-2">{{ 'GLOBAL.NOTE' | translate }}</div>
			<div class="col-xs-8 col-sm-9 col-md-10">{{ locationInfo.note }}</div>
		</div>
	</div>
  `
})
export class DeliveryRequestLocationInfo {
    @Input() locationInfo: any = null;

    constructor() {

    }
}
