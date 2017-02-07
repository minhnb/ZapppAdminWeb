import { Component, ViewEncapsulation, Injector } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppConstant } from '../../../../helper/zapppConstant';

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
			delivererAccount.approved = this.isApprovedDeliverer(delivererAccount);
			return delivererAccount;
		});
	}

	isApprovedDeliverer(delivererAccount: any): Boolean {
		if (delivererAccount.roles) {
			for (let i = 0; i < delivererAccount.roles.length; i++) {
				let role = delivererAccount.roles[i];
				if (role.name == ZapppConstant.USER_ROLE.DELIVERER) {
					return role.approved;
				}
			}
		}
		return false;
	}

	activateDeliverer(deliverer: any) {
		let delivererId = deliverer.id;
		this.deliveryService.approveDeliverer(delivererId, true).subscribe(
			res => {
				deliverer.approved = true;
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	deactivateDeliverer(deliverer: any) {
		this.zapppAlert.showConfirm(this.translate.instant('CONFIRM.DEACTIVATE_DELIVERER', { "name": deliverer.name }))
			.then(result => {
				let delivererId = deliverer.id;
				this.deliveryService.approveDeliverer(delivererId, false).subscribe(
					res => {
						deliverer.approved = false;
					},
					error => {
						this.zapppAlert.showError(error.message);
					}
				)
			})
			.catch(err => {

			})
	}
}
