import { Component, ViewEncapsulation, Injector, ViewChild } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppConstant } from '../../../../helper/zapppConstant';
import { DateTimePicker } from '../../../../helper/datetimepicker';
var moment = require('moment');

@Component({
	selector: 'delivery-accounts',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./delivererAccounts.scss')],
	template: require('./delivererAccounts.html'),
	providers: [DeliveryService]
})
export class DelivererAccounts extends ZapppBaseComponent {

	@ViewChild('fromDateTimePicker') fromDateTimePicker: DateTimePicker;
	@ViewChild('toDateTimePicker') toDateTimePicker: DateTimePicker;
	tableData = [];
	pageSize: number;
	totalItem: number;
	currentPage: number;

	formatDateTime: String;
	fromDate: Date;
	toDate: Date;
	delivererName: String;
	phoneNumber: String;
	status: String = '';
	searchQuery: any = {};

	constructor(private injector: Injector, private deliveryService: DeliveryService) {
		super(injector);
		this.pageSize = ZapppConstant.TABLE_PAGINATION.ITEM_PER_PAGE;
		this.currentPage = 1;
		this.formatDateTime = ZapppConstant.FORMAT_DATETIME;
	}

	ngAfterViewInit() {
		this.listDelivererAccounts();
	}

	listDelivererAccounts(start?: number) {
		let sortBy = '';
		this.deliveryService.listDelivererAccounts(this.searchQuery, sortBy, true, this.pageSize, start).subscribe(
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

	clearSearch() {
		this.fromDateTimePicker.reset();
		this.toDateTimePicker.reset();
		this.delivererName = '';
		this.phoneNumber = '';
		this.status = '';

		if (Object.keys(this.searchQuery).length > 0) {
			this.searchQuery = {};
			this.listDelivererAccounts();
		}
	}

	searchDelivererAccount() {
		this.searchQuery = this.buildSearchQuery();
		this.listDelivererAccounts();
	}

	buildSearchQuery() {
		let search: any = {};
		if (this.fromDate) {
			search.from = moment(this.fromDate).unix();
		}
		if (this.toDate) {
			search.to = moment(this.toDate).unix();
		}
		if (this.delivererName) {
			search.name = this.delivererName;
		}
		if (this.phoneNumber) {
			search.phone_number = this.phoneNumber;
		}
		if (this.status) {
			search.approved = this.status;
		}
		return search;
	}
}
