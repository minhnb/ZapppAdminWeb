import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { ZapppBaseComponent } from '../../baseComponent/base.component';

@Component({
	selector: 'admin-dashboard',
	encapsulation: ViewEncapsulation.None,
	template: require('./dashboard.html')
})
export class AdminDashboard extends ZapppBaseComponent {

	delivererStatistic: any;
	senderReceiverStatistic: any;
	deliveryRequestStatistic: any;

	listStatistic: Array<any> = [];

	constructor(private injector: Injector) {
        super(injector);

		this.delivererStatistic = {
			header: this.translate.instant('STATISTIC.DELIVERERS'),
			boxes: [
				{
					title: this.translate.instant('STATISTIC.DELIVERING'),
					value: 120,
					class: "col-xs-4"
				},
				{
					title: this.translate.instant('STATISTIC.AVAILABLE'),
					value: 30,
					class: "col-xs-4"
				},
				{
					title: this.translate.instant('STATISTIC.TOTAL'),
					value: 150,
					class: "col-xs-4"
				}
			]
		}
		this.senderReceiverStatistic = {
			header: this.translate.instant('STATISTIC.SENDERS_AND_RECEIVERS'),
			boxes: [
				{
					title: this.translate.instant('STATISTIC.TOTAL'),
					value: 150,
					class: "col-xs-12"
				}
			]
		}
		this.deliveryRequestStatistic = {
			header: this.translate.instant('STATISTIC.DELIVERY_REQUESTS'),
			boxes: [
				{
					title: this.translate.instant('STATISTIC.LOOKING_FOR_ZAPPPER'),
					value: 20,
					class: "col-xs-6"
				},
				{
					title: this.translate.instant('STATISTIC.TOTAL'),
					value: "1,256,908",
					class: "col-xs-6"
				}
			]
		}

		this.listStatistic = [this.delivererStatistic, this.senderReceiverStatistic, this.deliveryRequestStatistic];
	}

}
