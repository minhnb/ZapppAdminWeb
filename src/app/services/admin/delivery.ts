import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ZapppHttp } from '../zapppHttp';

import { AppConfig } from '../../app.config';
import { ZapppConstant } from '../../helper/zapppConstant';

@Injectable()
export class DeliveryService {
	private serviceUrl = AppConfig.API_URL + 'admin';
	constructor(private zapppHttp: ZapppHttp) { }

	listDelivererAccounts(): Observable<any> {
		return this.zapppHttp.get(this.serviceUrl + '/deliverers');
	}

	listDeliveryRequests(): Observable<any> {
		return this.zapppHttp.get(this.serviceUrl + '/delivery_requests');
	}

	listDelivererNearBy(latitude: number, longitude: number, maxDistance: number): Observable<any> {
		let params = {
			lat: latitude,
			long: longitude,
			max_distance: maxDistance
		}
		return this.zapppHttp.get(this.serviceUrl + '/deliverer_location', params);
	}

	approveDeliverer(delivererId: string, approved: Boolean): Observable<any> {
		let body = {
			approved: approved
		};
		let url = this.serviceUrl + '/users/' + delivererId + '/roles/' + ZapppConstant.USER_ROLE.DELIVERER;
		return this.zapppHttp.put(url, body);
	}
}
