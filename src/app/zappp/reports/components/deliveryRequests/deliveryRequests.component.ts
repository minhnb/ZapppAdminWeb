import { Component, ViewEncapsulation, Injector } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';

@Component({
	selector: 'delivery-requests',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./deliveryRequests.scss')],
	template: require('./deliveryRequests.html'),
	providers: [DeliveryService]
})
export class DeliveryRequests extends ZapppBaseComponent {

	tableData = [];

	constructor(private injector: Injector, private deliveryService: DeliveryService) {
		super(injector);
		this.listDeliveryRequests();
	}

	listDeliveryRequests() {
		this.deliveryService.listDeliveryRequests().subscribe(
			res => {
				this.tableData = this.deliveryRequestsToDisplay(res);
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	getFare(amount: number, currency: string): string {
		if (!amount) return "";
        var result = (amount / 100.0).toFixed(2);
		if (currency === 'usd') {
			return "$" + result;
		}
		return [result, currency].filter(Boolean).join(' ');
	}

	getAddressLocation(locationData: any): string {
		let street = [locationData.street_number, locationData.street_name].filter(Boolean).join(' ');
		let result = [street, locationData.city, locationData.country];
		return result.filter(Boolean).join(', ');
	}

	deliveryRequestsToDisplay(deliveryRequests: Array<any>): Array<any> {
		return deliveryRequests.map(deliveryRequest => {
			if (!deliveryRequest.creator) {
				deliveryRequest.sender = { name: "" };
			} else {
				deliveryRequest.sender = deliveryRequest.creator;
				if (!deliveryRequest.sender.name) {
					deliveryRequest.sender.name = "";
				}
			}
			if (!deliveryRequest.deliverer) {
				deliveryRequest.deliverer = { name: "" };
			} else {
				if (!deliveryRequest.deliverer.name) {
					deliveryRequest.deliverer.name = "";
				}
			}

			deliveryRequest.pick_up_place = this.getAddressLocation(deliveryRequest.pickup_location);
			deliveryRequest.destination = this.getAddressLocation(deliveryRequest.destination_location);


			deliveryRequest.fare = "";
			if (deliveryRequest.quotation && deliveryRequest.quotation.amount) {
				deliveryRequest.fare = this.getFare(deliveryRequest.quotation.amount, deliveryRequest.quotation.currency);
			}

			deliveryRequest.status = "";
			if (deliveryRequest.current_status && deliveryRequest.current_status.status) {
				deliveryRequest.status = deliveryRequest.current_status.status;
			}

			return deliveryRequest;
		});
	}
}
