import { Component, ViewEncapsulation, Input} from '@angular/core';

@Component({
	selector: 'delivery-request-user-info',
	encapsulation: ViewEncapsulation.None,
    template: `
	<div class="col-xs-12" *ngIf="userInfo">
	  <div class="col-xs-12 col-md-3">
		<div class="picture-group">
		  <div class="picture-wrapper">
			<img *ngIf="userInfo.avatar && userInfo.avatar.url" src="{{ userInfo.avatar.url }}">
			<img *ngIf="!(userInfo.avatar && userInfo.avatar.url)" src="{{ defaultPicture }}">
		  </div>
		</div>
	  </div>
	  <div class="col-xs-12 col-md-9">
		<div class="row user-info">
		  <div class="col-xs-4">{{ 'GLOBAL.FULL_NAME' | translate }}</div>
		  <div class="col-xs-8">{{ userInfo.name }}</div>
		</div>
		<div class="row user-info">
		  <div class="col-xs-4">{{ 'GLOBAL.EMAIL' | translate }}</div>
		  <div class="col-xs-8">{{ userInfo.email_profile ? userInfo.email_profile.email : '' }}</div>
		</div>
		<div class="row user-info">
		  <div class="col-xs-4">{{ 'GLOBAL.PHONE_NUMBER' | translate }}</div>
		  <div class="col-xs-8">{{ userInfo.phone_profile ? userInfo.phone_profile.number : '' }}</div>
		</div>
		<div class="row user-info">
		  <div class="col-xs-4">{{ 'GLOBAL.RATING' | translate }}</div>
		  <div class="col-xs-8">{{ userInfo[ratingKey] }}</div>
		</div>
	  </div>
  `
})
export class DeliveryRequestUserInfo {
    @Input() userInfo: any = null;
    @Input() defaultPicture: string = '';
    @Input() ratingKey: string = 'sender_rating';

    constructor() {

    }
}
