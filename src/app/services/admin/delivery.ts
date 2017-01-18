import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ZapppHttp } from '../zapppHttp';

import { AppConfig } from '../../app.config';
import { ZapppConstant } from '../../helper/zapppConstant';

@Injectable()
export class DeliveryService {
	private serviceUrl = AppConfig.API_URL + 'admin';
	constructor(private zapppHttp: ZapppHttp) { }

	listDeliveryAccounts(): Observable<any> {
		return this.zapppHttp.get(this.serviceUrl + '/delivery_accounts');
	}

	listDeliveryRequests(): Observable<any> {
		return this.zapppHttp.get(this.serviceUrl + '/delivery_requests');
	}
}
