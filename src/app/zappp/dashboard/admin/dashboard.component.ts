import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { ZapppBaseComponent } from '../../baseComponent/base.component';
import { StatisticService } from '../../../services/admin/statistics';
import { ZapppUtil } from '../../../helper/zapppUtil';

@Component({
	selector: 'admin-dashboard',
	encapsulation: ViewEncapsulation.None,
	template: require('./dashboard.html'),
	providers: [StatisticService]
})
export class AdminDashboard extends ZapppBaseComponent {

	delivererStatistic: any;
	senderReceiverStatistic: any;
	deliveryRequestStatistic: any;

	listStatistic: Array<any> = [];

	constructor(private injector: Injector, private statisticService: StatisticService) {
        super(injector);

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

		this.loadStatistics();
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

	displayStatisticValue(value: number): any {
		if (value == 0) {
			return value.toString();
		}
		return ZapppUtil.formatNumber(value);
	}
}
