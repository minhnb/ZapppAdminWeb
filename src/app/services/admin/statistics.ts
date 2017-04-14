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
}
