import { Component, Injector, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { ZapppBaseComponent } from '../../baseComponent/base.component';
import { StatisticService } from '../../../services/admin/statistics';
import { ZapppUtil } from '../../../helper/zapppUtil';
import { ZapppConstant } from '../../../helper/zapppConstant';
import { BaThemeConfigProvider, colorHelper, layoutPaths } from '../../../theme';
import { ModalDirective } from 'ng2-bootstrap';
import { DateTimePicker } from '../../../helper/datetimepicker';

var moment = require('moment');

@Component({
	selector: 'admin-dashboard',
	encapsulation: ViewEncapsulation.None,
	template: require('./dashboard.html'),
	providers: [StatisticService]
})
export class AdminDashboard extends ZapppBaseComponent {

	@ViewChild('deliveryRequestDateModal') deliveryRequestDateModal: ModalDirective;

	delivererStatistic: any;
	senderReceiverStatistic: any;
	deliveryRequestStatistic: any;

	listStatistic: Array<any> = [];

	chartData: any;
	chart: any;

	updateDataTimer: any;
	refreshTime: number = 15 * 60 * 1000;
	activeButtonNumber: number = 0;

	formatDate: String;
	fromDate: Date;
	toDate: Date;
	lastFromDate: Date;
	lastToDate: Date;
	@ViewChild('fromDateTimePicker') fromDateTimePicker: DateTimePicker;
	@ViewChild('toDateTimePicker') toDateTimePicker: DateTimePicker;

	constructor(private injector: Injector, private statisticService: StatisticService, private _baConfig: BaThemeConfigProvider) {
        super(injector);

		this.formatDate = ZapppConstant.FORMAT_DATE;

		this.initListStatistic();
		this.chartData = this.initChartLineData();
		this.autoUpdateDashboard();
		this.loadDeliveryRequestStatistics();
	}

	ngOnDestroy() {
		this.clearAutoUpdateDashboardTimer();
	}

	initListStatistic() {
		this.delivererStatistic = {
			header: this.translate.instant('STATISTIC.DELIVERERS'),
			boxes: [
				{
					title: this.translate.instant('STATISTIC.DELIVERING'),
					value: 0,
					class: "col-xs-4"
				},
				{
					title: this.translate.instant('STATISTIC.AVAILABLE'),
					value: 0,
					class: "col-xs-4"
				},
				{
					title: this.translate.instant('STATISTIC.TOTAL'),
					value: 0,
					class: "col-xs-4"
				}
			]
		}
		this.senderReceiverStatistic = {
			header: this.translate.instant('STATISTIC.SENDERS_AND_RECEIVERS'),
			boxes: [
				{
					title: this.translate.instant('STATISTIC.TOTAL'),
					value: 0,
					class: "col-xs-12"
				}
			]
		}
		this.deliveryRequestStatistic = {
			header: this.translate.instant('STATISTIC.DELIVERY_REQUESTS'),
			boxes: [
				{
					title: this.translate.instant('STATISTIC.LOOKING_FOR_ZAPPPER'),
					value: 0,
					class: "col-xs-6"
				},
				{
					title: this.translate.instant('STATISTIC.TOTAL'),
					value: "0",
					class: "col-xs-6"
				}
			]
		}

		this.listStatistic = [this.delivererStatistic, this.senderReceiverStatistic, this.deliveryRequestStatistic];
	}

	initChartLineData() {

		var layoutColors = this._baConfig.get().colors;
		var graphColor = this._baConfig.get().colors.custom.dashboardLineChart;

		return {
			type: 'serial',
			theme: 'blur',
			marginTop: 15,
			marginRight: 15,
			responsive: {
				'enabled': true
			},
			dataProvider: [
			],
			categoryField: 'date',
			categoryAxis: {
				parseDates: true,
				gridAlpha: 0,
				color: layoutColors.defaultText,
				axisColor: layoutColors.defaultText
			},
			valueAxes: [
				{
					minVerticalGap: 50,
					gridAlpha: 0,
					color: layoutColors.defaultText,
					axisColor: layoutColors.defaultText
				}
			],
			graphs: [
				{
					id: 'g0',
					bullet: 'none',
					useLineColorForBulletBorder: true,
					lineColor: colorHelper.hexToRgbA(graphColor, 0.3),
					lineThickness: 1,
					negativeLineColor: layoutColors.danger,
					type: 'smoothedLine',
					valueField: 'value0',
					fillAlphas: 1,
					fillColorsField: 'lineColor'
				},
				{
					id: 'g1',
					bullet: 'none',
					useLineColorForBulletBorder: true,
					lineColor: colorHelper.hexToRgbA(graphColor, 0.15),
					lineThickness: 1,
					negativeLineColor: layoutColors.danger,
					type: 'smoothedLine',
					valueField: 'value',
					fillAlphas: 1,
					fillColorsField: 'lineColor'
				}
			],
			chartCursor: {
				categoryBalloonDateFormat: 'MM YYYY',
				categoryBalloonColor: '#4285F4',
				categoryBalloonAlpha: 0.7,
				cursorAlpha: 0,
				valueLineEnabled: true,
				valueLineBalloonEnabled: true,
				valueLineAlpha: 0.5
			},
			dataDateFormat: 'MM YYYY',
			export: {
				enabled: true
			},
			creditsPosition: 'bottom-right',
			zoomOutButton: {
				backgroundColor: '#fff',
				backgroundAlpha: 0
			},
			zoomOutText: '',
			pathToImages: layoutPaths.images.amChart
		};
    }

	initChart(chart: any) {
		this.chart = chart;
    }

	loadDashboardData() {
		this.loadStatistics();
	}

	autoUpdateDashboard() {
		this.loadDashboardData();
		this.updateDataTimer = setTimeout(() => {
			this.autoUpdateDashboard();
		}, this.refreshTime);
	}

	clearAutoUpdateDashboardTimer() {
		if (this.updateDataTimer) {
			clearTimeout(this.updateDataTimer);
			this.updateDataTimer = null;
		}
	}

	loadStatistics() {
		this.statisticService.getStatisticsCounting().subscribe(
			res => {
				this.senderReceiverStatistic.boxes[0].value = res.senders ? res.senders.total : 0;

				this.delivererStatistic.boxes[0].value = res.deliverers ? res.deliverers.delivering : 0;
				this.delivererStatistic.boxes[1].value = res.deliverers ? res.deliverers.available : 0;
				this.delivererStatistic.boxes[2].value = res.deliverers ? res.deliverers.total : 0;

				this.deliveryRequestStatistic.boxes[0].value = res.delivery_requests ? res.delivery_requests.Pending : 0;
				this.deliveryRequestStatistic.boxes[1].value = res.delivery_requests ? res.delivery_requests.total : 0;
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	loadDeliveryRequestStatistics(days: number = 7) {
		this.statisticService.getDeliveryRequestStatistics(days).subscribe(
			res => {
				this.updateChartDataProvider(res);
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	loadDeliveryRequestStatisticsFromDateToDate(fromDate: string, toDate: string, callback: (res: any) => void) {
		this.statisticService.getDeliveryRequestStatistics(null, fromDate, toDate).subscribe(
			res => {
				this.updateChartDataProvider(res);
				callback(res);
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	updateChartDataProvider(res: any) {
		let updatedChartDataProvider: Array<any> = [];
		Object.keys(res).forEach(key => {
			let date = new Date(key);
			let value = res[key];
			updatedChartDataProvider.push({ date: date, value: value });
		});
		updatedChartDataProvider.sort((a: any, b: any): number => {
			if (a.date < b.date) {
				return -1;
			}
			if (a.date > b.date) {
				return 1;
			}
			return 0;
		});
		this.chart.dataProvider = updatedChartDataProvider;
		this.chart.validateData();
	}

	loadDeliveryRequestByLastDays(lastDays: number, buttonNumber: number) {
		this.activeButtonNumber = buttonNumber;
		this.loadDeliveryRequestStatistics(lastDays);
	}

	displayStatisticValue(value: number): any {
		if (value == 0) {
			return value.toString();
		}
		return ZapppUtil.formatNumber(value);
	}

	showDeliveryRequestDateModal() {
		this.deliveryRequestDateModal.show();
		this.fromDateTimePicker.setDate(this.lastFromDate);
		this.toDateTimePicker.setDate(this.lastToDate);
	}

	loadDeliveryRequestFromDateToDate(buttonNumber: number) {
		if (!this.fromDate || !this.toDate) {
			return;
		}
		this.activeButtonNumber = buttonNumber;
		let fromDate = moment(this.fromDate).format(ZapppConstant.SERVER_FORMAT_DATE);
		let toDate = moment(this.toDate).format(ZapppConstant.SERVER_FORMAT_DATE);
		this.lastFromDate = this.fromDate;
		this.lastToDate = this.toDate;
		this.loadDeliveryRequestStatisticsFromDateToDate(fromDate, toDate, (res) => {
			this.deliveryRequestDateModal.hide();
		});
	}

}
