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

	cancelDeliveryRequest(deliveryRequestId: string, reason: string, callback?: (res: any) => void) {
		this.deliveryService.cancelDeliveyRequest(deliveryRequestId, reason).subscribe(
			res => {
				if (callback) {
					callback(res);
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		);
	}

	showCancelRequestPrompt() {
		this.zapppAlert.showPrompt(this.translate.instant('REPORTS.REASON'), this.translate.instant('REPORTS.CANCEL_REQUEST'))
			.then(result => {
				if (!result) {
					this.showCancelRequestPrompt();
					return;
				}
				let reason = result;
				this.cancelDeliveryRequest(this.deliveryRequestId, reason, res => {
					this.getDeliveryRequestById(this.deliveryRequestId);
				});
			})
			.catch(err => {

			});
	}

	isCancelableRequest(): Boolean {
		if (!this.selectedDeliveryRequest.current_status) {
			return false;
		}
		let cancelableStatus = [
			ZapppConstant.DELIVERY_STATUS.NEW,
			ZapppConstant.DELIVERY_STATUS.PENDING,
			ZapppConstant.DELIVERY_STATUS.ACCEPTED,
			ZapppConstant.DELIVERY_STATUS.DELIVERING
		];
		let currentStatus = this.selectedDeliveryRequest.current_status.status;
		return cancelableStatus.indexOf(currentStatus) > -1;
	}
}
