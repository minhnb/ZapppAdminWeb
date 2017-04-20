import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ZapppHttp } from '../zapppHttp';

import { AppConfig } from '../../app.config';
import { ZapppConstant } from '../../helper/zapppConstant';
import { ZapppUtil } from '../../helper/zapppUtil';

@Injectable()
export class StatisticService {
	private serviceUrl = AppConfig.API_URL + 'admin';
	constructor(private zapppHttp: ZapppHttp) { }

	getStatisticsCounting() {
		return this.zapppHttp.get(this.serviceUrl + '/stats/counting');
	}

	getDeliveryRequestStatistics(days?: number, from?: string, to?: string) {
		let params = {
			days: days,
			from: from,
			to: to
		}
		return this.zapppHttp.get(this.serviceUrl + '/stats/delivery_request_by_date', params);
	}
}
