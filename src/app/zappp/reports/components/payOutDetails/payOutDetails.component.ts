import { Component, ViewEncapsulation, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalState } from '../../../../global.state';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppConstant } from '../../../../helper/zapppConstant';
import { DateTimePicker } from '../../../../helper/datetimepicker';
var moment = require('moment');
declare const XLSX: any;
declare const alasql: any;

@Component({
	selector: 'pay-out-details',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./payOutDetails.scss')],
	template: require('./payOutDetails.html'),
	providers: [DeliveryService]
})
export class PayOutDetails extends ZapppBaseComponent {

	@ViewChild('fromDateTimePicker') fromDateTimePicker: DateTimePicker;
	@ViewChild('toDateTimePicker') toDateTimePicker: DateTimePicker;
	tableData = [];
	pageSize: number;
	totalItem: number;
	currentPage: number;

	formatDateTime: String;
	fromDate: Date;
	toDate: Date;
	delivererQuery: String;
	searchQuery: any = {};

	tableHeader: Array<string> = [];
	totalAmount: string = '';

	private sub: any;
	delivererId: string;
	from: string;
	to: string;

	constructor(private injector: Injector, private deliveryService: DeliveryService, private route: ActivatedRoute, private _state: GlobalState) {
		super(injector);
		this.pageSize = ZapppConstant.TABLE_PAGINATION.ITEM_PER_PAGE;
		this.currentPage = 1;
		this.formatDateTime = ZapppConstant.FORMAT_DATE;
		this.totalItem = 0;

		this.tableHeader = [
			this.translate.instant('REPORTS.DELIVERY_ID'),
			this.translate.instant('REPORTS.SENDER_PHONE'),
			this.translate.instant('REPORTS.RECEIVER_PHONE'),
			this.translate.instant('REPORTS.DELIVERY_CREATED'),
			this.translate.instant('REPORTS.CHARGED'),
			this.translate.instant('REPORTS.SETTLED'),
			this.translate.instant('REPORTS.COST'),
			this.translate.instant('REPORTS.RATING')
		];
	}

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
			this.delivererId = params['deliveryId'];
			this.from = params['from'];
			this.to = params['to'];
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	ngAfterViewInit() {
		this._state.notifyDataChanged('menu.activeLink', { title: 'MENU.PAY_OUT_DETAILS' });
		this.queryPayOutDetails();
	}

	listPayOutDetails(start?: number) {
		let sortBy = '';
		this.deliveryService.getDelivererPayOutByDelivererId(this.delivererId, this.searchQuery, sortBy, true, this.pageSize, start).subscribe(
			res => {
				this.totalItem = res.total;
				this.tableData = res.data;
				this.totalAmount = this.displayFare(res.meta.total_amount, res.meta.currency);
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	listAllDelivererPayOut(callback?: (res: any) => void) {
		let sortBy = '';
		this.deliveryService.getDelivererPayOutByDelivererId(this.delivererId, this.searchQuery, sortBy, false, null, 0).subscribe(
			res => {
				if (callback) {
					callback(res);
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	convertPayOutDataToTableData(payOutDetailsData: Array<any>): Array<any> {
		let result = [];
		payOutDetailsData.forEach(item => {
			let row = [];
			row.push(item.delivery_request ? item.delivery_request.id : '');
			row.push(item.delivery_request && item.delivery_request.creator && item.delivery_request.creator.phone_profile ? item.delivery_request.creator.phone_profile.number : '');
			row.push(item.delivery_request && item.delivery_request.destination_location ? item.delivery_request.destination_location.user_phone_number : '');
			row.push(item.delivery_request ? this.timeStampToDateTimeWithSecond(item.delivery_request.created_at) : '');
			row.push(item.delivery_request && item.delivery_request.payment_status ? this.timeStampToDateTimeWithSecond(item.delivery_request.payment_status.created_at) : '');
			row.push(item.delivery_request && item.delivery_request.payment_status ? this.timeStampToDateTimeWithSecond(item.delivery_request.payment_status.modified_at) : '');
			row.push(item.payout ? this.displayFare(item.payout.amount, item.payout.currency) : '');
			row.push(item.rating != undefined ? item.rating : '');
			result.push(row);
		});
		return result;
	}

	pageChanged(event) {
		this.currentPage = event;
		this.listPayOutDetails((this.currentPage - 1) * this.pageSize);
	}

	clearSearch() {
		this.fromDateTimePicker.reset();
		this.toDateTimePicker.reset();
		this.delivererQuery = '';

		if (Object.keys(this.searchQuery).length > 0) {
			this.searchQuery = {};
			this.listPayOutDetails();
		}
	}

	queryPayOutDetails() {
		this.searchQuery = this.buildSearchQuery();
		this.listPayOutDetails();
	}

	buildSearchQuery() {
		let search: any = {};
		if (this.from) {
			search.from = this.from;
		}
		if (this.to) {
			search.to = this.to;
		}
		return search;
	}

	exportPayOutDetailsData() {
		this.searchQuery = this.buildSearchQuery();
		this.listAllDelivererPayOut(res => {
			let zappper = res.meta.deliverer;
			let exportData = this.convertPayOutDataToTableData(res.data);
			let totalAmount = this.displayFare(res.meta.total_amount, res.meta.currency);
			this.exportPayOutDetailsDataToExcel(zappper, exportData, totalAmount);
		});
	}

	exportPayOutDetailsDataToExcel(zappper: any, payOutDetailsData: Array<any>, totalAmount: string) {
		let maxColumns = this.tableHeader.length > 2 ? this.tableHeader.length : 3;
		let colKeys = this.initColKeys(maxColumns);

		let zappperText = this.translate.instant('REPORTS.ZAPPPER');
		let zappperRow = this.createExcelRow([zappperText, zappper.name], colKeys);

		let phoneText = this.translate.instant('REPORTS.PHONE');
		let phoneRow = this.createExcelRow([phoneText, zappper.phone_profile ? zappper.phone_profile.number : ''], colKeys);

		let settledDateText = this.translate.instant('REPORTS.TRANSACTION_SETTLED_DATE');
		let fromText = this.translate.instant('GLOBAL.FROM') + ': ' + moment(this.fromDate).format(ZapppConstant.SERVER_FORMAT_DATE_WITH_SPLASH);
		let toText = this.translate.instant('GLOBAL.TO') + ': ' + moment(this.toDate).format(ZapppConstant.SERVER_FORMAT_DATE_WITH_SPLASH);
		let settledDateRow = this.createExcelRow([settledDateText, fromText, toText], colKeys);

		let headerRow = this.createExcelRow(this.tableHeader, colKeys);
		let blankRow = this.createExcelRow([], colKeys);

		let data = [zappperRow, phoneRow, settledDateRow, blankRow, blankRow, headerRow];
		payOutDetailsData.forEach(row => {
			data.push(this.createExcelRow(row, colKeys));
		});

		data.push(blankRow);

		let totalCostText = this.translate.instant('REPORTS.COST_TOTAL');
		let totalAmountRow = this.createExcelRow([totalCostText, totalAmount], colKeys);
		data.push(totalAmountRow);

		data.push(blankRow);

		let noteText = this.translate.instant('REPORTS.NOTE_COMMISSION');
		let lastRow = this.createExcelRow([noteText], colKeys);
		data.push(lastRow);

		let fileName = 'Payout_' + moment(this.fromDate).format(ZapppConstant.SERVER_FORMAT_DATE) + '_' + moment(this.toDate).format(ZapppConstant.SERVER_FORMAT_DATE);
		alasql("SELECT * INTO XLSX('" + fileName + ".xlsx',{ headers: false}) FROM ? ", [data]);
	}
}
