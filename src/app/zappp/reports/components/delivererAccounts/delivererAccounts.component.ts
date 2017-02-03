import { Component, ViewEncapsulation, Injector } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';

@Component({
	selector: 'delivery-accounts',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./delivererAccounts.scss')],
	template: require('./delivererAccounts.html'),
	providers: [DeliveryService]
})
export class DelivererAccounts extends ZapppBaseComponent {

	tableData = [];

	constructor(private injector: Injector, private deliveryService: DeliveryService) {
		super(injector);
	}

	ngAfterViewInit() {
		this.listDelivererAccounts();
	}

	listDelivererAccounts() {
		this.deliveryService.listDelivererAccounts().subscribe(
			res => {
				this.tableData = this.delivererAccountsToDisplay(res);
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	delivererAccountsToDisplay(delivererAccounts: Array<any>): Array<any> {
		return delivererAccounts.map(delivererAccount => {
			return delivererAccount;
		});
	}
}
