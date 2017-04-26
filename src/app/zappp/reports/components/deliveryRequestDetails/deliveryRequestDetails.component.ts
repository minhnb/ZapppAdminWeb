import { Component, ViewEncapsulation, Injector, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalState } from '../../../../global.state'
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppConstant } from '../../../../helper/zapppConstant';
import { ZapppUtil } from '../../../../helper/zapppUtil';
import { DateTimePicker } from '../../../../helper/datetimepicker';

import { ModalDirective } from 'ng2-bootstrap';
import { GoogleMapsLoader } from '../../../googleMaps.loader';

var moment = require('moment');

@Component({
	selector: 'delivery-request-details',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./deliveryRequestDetails.scss')],
	template: require('./deliveryRequestDetails.html'),
	providers: [DeliveryService]
})
export class DeliveryRequestDetails extends ZapppBaseComponent {

	selectedDeliveryRequest: any;
	defaultPicture = ZapppConstant.NO_PICTURE;

	private sub: any;
	deliveryRequestId: string;

	constructor(private injector: Injector, private deliveryService: DeliveryService, private _elementRef: ElementRef, private route: ActivatedRoute, private _state: GlobalState) {
		super(injector);
		this.selectedDeliveryRequest = null;
	}

	ngAfterViewInit() {
		this._state.notifyDataChanged('menu.activeLink', { title: 'MENU.DELIVERY_REQUESTS' });
		this.getDeliveryRequestById(this.deliveryRequestId);
	}

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
			this.deliveryRequestId = params['deliveryRequestId'];
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	getDeliveryRequestById(deliveryRequestId: string) {
		this.deliveryService.getDeliveryRequestById(deliveryRequestId).subscribe(
			res => {
				this.selectedDeliveryRequest = res;
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		);
	}
}
