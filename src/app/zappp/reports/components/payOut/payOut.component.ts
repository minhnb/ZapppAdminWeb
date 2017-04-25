import { Component, ViewEncapsulation, Injector, ViewChild } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppConstant } from '../../../../helper/zapppConstant';
import { DateTimePicker } from '../../../../helper/datetimepicker';
var moment = require('moment');
declare const XLSX: any;
declare const alasql: any;

@Component({
	selector: 'pay-out',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./payOut.scss')],
	template: require('./payOut.html'),
	providers: [DeliveryService]
})
export class PayOut extends ZapppBaseComponent {

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

	lastFromDate: Date;
	lastToDate: Date;

	tableHeader: Array<string> = [];
	totalAmount: string = '';

	constructor(private injector: Injector, private deliveryService: DeliveryService) {
		super(injector);
		this.pageSize = ZapppConstant.TABLE_PAGINATION.ITEM_PER_PAGE;
		this.currentPage = 1;
		this.formatDateTime = ZapppConstant.FORMAT_DATE;
		this.totalItem = 0;

		this.tableHeader = [
			this.translate.instant('REPORTS.ZAPPPER'),
			this.translate.instant('REPORTS.PHONE'),
			this.translate.instant('REPORTS.EARNINGS')
		];
	}

	ngAfterViewInit() {
		this.initFromDateToDate();
		this.searchDelivererAccount();
	}

	listDelivererPayOut(start?: number) {
		let sortBy = '';
		this.deliveryService.getDelivererPayOut(this.searchQuery, sortBy, true, this.pageSize, start).subscribe(
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
		this.deliveryService.getDelivererPayOut(this.searchQuery, sortBy, false, null, 0).subscribe(
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

	convertPayOutDataToTableData(payOutData: Array<any>): Array<any> {
		let result = [];
		payOutData.forEach(item => {
			let row = [];
			row.push(item.deliverer ? item.deliverer.name : '');
			row.push(item.deliverer && item.deliverer.phone_profile ? item.deliverer.phone_profile.number : '');
			row.push(item.payout ? this.displayFare(item.payout.amount, item.payout.currency) : '');
			result.push(row);
		});
		return result;
	}

	pageChanged(event) {
		this.currentPage = event;
		this.listDelivererPayOut((this.currentPage - 1) * this.pageSize);
	}

	clearSearch() {
		this.fromDateTimePicker.reset();
		this.toDateTimePicker.reset();
		this.delivererQuery = '';

		if (Object.keys(this.searchQuery).length > 0) {
			this.searchQuery = {};
			this.listDelivererPayOut();
		}
	}

	searchDelivererAccount() {
		this.lastFromDate = this.fromDate;
		this.lastToDate = this.toDate;
		this.searchQuery = this.buildSearchQuery();
		this.listDelivererPayOut();
	}

	buildSearchQuery() {
		let search: any = {};
		if (this.lastFromDate) {
			search.from = moment(this.lastFromDate).format(ZapppConstant.SERVER_FORMAT_DATE);
		}
		if (this.lastToDate) {
			search.to = moment(this.lastToDate).format(ZapppConstant.SERVER_FORMAT_DATE);
		}
		if (this.delivererQuery) {
			search.query = this.delivererQuery;
		}
		return search;
	}

	initFromDateToDate() {
		let thisMoment = moment();
		this.toDate = thisMoment.toDate();
		let mondayInWeek = 1;
		let currentDayInWeek = thisMoment.days();
		this.fromDate = thisMoment.clone().subtract(currentDayInWeek - mondayInWeek, 'days').toDate();
		this.fromDateTimePicker.setDate(this.fromDate);
		this.toDateTimePicker.setDate(this.toDate);
	}

	exportPayOutData() {
		this.searchQuery = this.buildSearchQuery();
		this.listAllDelivererPayOut(res => {
			let exportData = this.convertPayOutDataToTableData(res.data);
			let totalAmount = this.displayFare(res.meta.total_amount, res.meta.currency);
			this.exportPayOutDataToExcel(exportData, totalAmount);
		});
	}

	exportPayOutDataToExcel(payOutData: Array<any>, totalAmount: string) {
		let maxColumns = this.tableHeader.length > 2 ? this.tableHeader.length : 3;
		let colKeys = this.initColKeys(maxColumns);

		let settledDateText = this.translate.instant('REPORTS.SETTLED_DATE');
		let settledDateTtitleRow = this.createExcelRow([settledDateText], colKeys);

		let fromText = this.translate.instant('GLOBAL.FROM') + ': ' + moment(this.fromDate).format(ZapppConstant.SERVER_FORMAT_DATE_WITH_SPLASH);
		let toText = this.translate.instant('GLOBAL.TO') + ': ' + moment(this.toDate).format(ZapppConstant.SERVER_FORMAT_DATE_WITH_SPLASH);
		let settledDateRow = this.createExcelRow([fromText, toText], colKeys);

		let headerRow = this.createExcelRow(this.tableHeader, colKeys);
		let blankRow = this.createExcelRow([], colKeys);

		let data = [settledDateTtitleRow, settledDateRow, blankRow, headerRow];
		payOutData.forEach(row => {
			data.push(this.createExcelRow(row, colKeys));
		});

		let totalAmountRow = this.createExcelRow([], colKeys);
		totalAmountRow[colKeys[colKeys.length - 1]] = totalAmount;
		data.push(totalAmountRow);

		let noteText = this.translate.instant('REPORTS.NOTE_COMMISSION');
		let lastRow = this.createExcelRow([noteText], colKeys);
		data.push(lastRow);

		let fileName = 'Payout_' + moment(this.lastFromDate).format(ZapppConstant.SERVER_FORMAT_DATE) + '_' + moment(this.lastToDate).format(ZapppConstant.SERVER_FORMAT_DATE);
		alasql("SELECT * INTO XLSX('" + fileName + ".xlsx',{ headers: false}) FROM ? ", [data]);
	}

	goToPayOutDetails(delivererId) {
		let linkArray = ['reports/pay-out-details', delivererId, moment(this.lastFromDate).format(ZapppConstant.SERVER_FORMAT_DATE), moment(this.lastToDate).format(ZapppConstant.SERVER_FORMAT_DATE)];
		let link = linkArray.join('/');
		// this.router.navigate(linkArray);
		window.open(link);
	}
}
