import { Component, ViewEncapsulation, Injector } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppConstant } from '../../../../helper/zapppConstant';
var moment = require('moment');

@Component({
	selector: 'delivery-accounts',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./delivererAccounts.scss')],
	template: require('./delivererAccounts.html'),
	providers: [DeliveryService]
})
export class DelivererAccounts extends ZapppBaseComponent {

	tableData = [];
	pageSize: number;
	totalItem: number;
	currentPage: number;

	constructor(private injector: Injector, private deliveryService: DeliveryService) {
		super(injector);
		this.pageSize = ZapppConstant.TABLE_PAGINATION.ITEM_PER_PAGE;
		this.currentPage = 1;
	}

	ngAfterViewInit() {
		this.listDelivererAccounts();
	}

	listDelivererAccounts(start?: number) {
		this.deliveryService.listDelivererAccounts(true, this.pageSize, start).subscribe(
			res => {
				this.totalItem = res.total;
				this.tableData = this.delivererAccountsToDisplay(res.data);
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	delivererAccountsToDisplay(delivererAccounts: Array<any>): Array<any> {
		return delivererAccounts.map(delivererAccount => {
			delivererAccount.formated_created_at = moment.unix(delivererAccount.created_at).format(ZapppConstant.FORMAT_DATETIME);
			delivererAccount.approved = this.isApprovedDeliverer(delivererAccount);
			delivererAccount.phone = delivererAccount.phone_profile ? delivererAccount.phone_profile.number : '';
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

	pageChanged(event) {
		this.currentPage = event;
		this.listDelivererAccounts((this.currentPage - 1) * this.pageSize);
	}
}
