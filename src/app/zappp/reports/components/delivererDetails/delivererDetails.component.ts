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
	selector: 'deliverer-details',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./delivererDetails.scss')],
	template: require('./delivererDetails.html'),
	providers: [DeliveryService]
})
export class DelivererDetails extends ZapppBaseComponent {

	selectedDeliverer: any;
	defaultPicture = ZapppConstant.NO_PICTURE;

	private sub: any;
	delivererId: string;

	constructor(private injector: Injector, private deliveryService: DeliveryService, private _elementRef: ElementRef, private route: ActivatedRoute, private _state: GlobalState) {
		super(injector);
		this.selectedDeliverer = null;
	}

	ngAfterViewInit() {
		this._state.notifyDataChanged('menu.activeLink', { title: 'MENU.DELIVERER' });
		this.getDelivererById(this.delivererId);
	}

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
			this.delivererId = params['delivererId'];
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	isActiveDeliverer(): boolean {
		return ZapppUtil.userHasRole(this.selectedDeliverer.roles, ZapppConstant.USER_ROLE.DELIVERER);
	}

	displayBirthday(birthday: string): string {
		return moment(birthday).format(ZapppConstant.SERVER_FORMAT_DATE_WITH_SPLASH);
	}

	displayVehicle(vehicles: Array<string>): string {
		if (!vehicles || vehicles.length == 0) {
			return '';
		}
		return vehicles.join(', ');
	}

	getDelivererById(delivererId: string) {
		this.deliveryService.getDelivererInfo(delivererId).subscribe(
			res => {
				this.selectedDeliverer = res.deliverer;
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		);
	}

	activateDeliverer(delivererId: string) {
		this.deliveryService.approveDeliverer(delivererId, true).subscribe(
			res => {
				this.selectedDeliverer = res;
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		);
	}

	deactivateDeliverer(delivererId: string) {
		this.zapppAlert.showConfirm(this.translate.instant('CONFIRM.DEACTIVATE_DELIVERER', { "name": this.selectedDeliverer.name }))
			.then(result => {
				this.deliveryService.approveDeliverer(delivererId, false).subscribe(
					res => {
						this.selectedDeliverer = res;
					},
					error => {
						this.zapppAlert.showError(error.message);
					}
				)
			})
			.catch(err => {

			});
	}
}
