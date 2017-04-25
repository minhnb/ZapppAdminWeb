import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ZapppHttp } from '../zapppHttp';

import { AppConfig } from '../../app.config';
import { ZapppConstant } from '../../helper/zapppConstant';
import { ZapppUtil } from '../../helper/zapppUtil';

@Injectable()
export class DeliveryService {
	private serviceUrl = AppConfig.API_URL + 'admin';
	constructor(private zapppHttp: ZapppHttp) { }

	listDelivererAccounts(search: any, sortBy?: any, paging?: Boolean, limit?: number, offset?: number): Observable<any> {
		let params = ZapppUtil.buildQueryParams(search, sortBy, paging, limit, offset);
		return this.zapppHttp.get(this.serviceUrl + '/deliverers', params);
	}

	listDeliveryRequests(search: any, sortBy?: any, paging?: Boolean, limit?: number, offset?: number): Observable<any> {
		let params = ZapppUtil.buildQueryParams(search, sortBy, paging, limit, offset);
		return this.zapppHttp.get(this.serviceUrl + '/delivery_requests', params);
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

	searchDeliverer(keyword: string): Observable<any> {
		let params = {
			query: keyword
		}
		return this.zapppHttp.get(this.serviceUrl + '/deliverer_location', params);
	}

	getDelivererLocation(delivererId: string) {
		return this.zapppHttp.get(this.serviceUrl + '/deliverers/' + delivererId);
	}

	getDeliveryRequestLocation(deliveryRequestId: string, timestamp?: number) {
		let params = {};
		if (timestamp) {
			params = {
				from: timestamp
			}
		}
		return this.zapppHttp.get(this.serviceUrl + '/delivery_requests/' + deliveryRequestId + '/delivery_path', params);
	}

	getDeliveryRequestById(deliveryRequestId: string) {
		return this.zapppHttp.get(this.serviceUrl + '/delivery_requests/' + deliveryRequestId);
	}

	getDelivererPayOut(search: any, sortBy?: any, paging?: Boolean, limit?: number, offset?: number) {
		let params = ZapppUtil.buildQueryParams(search, sortBy, paging, limit, offset);
		return this.zapppHttp.get(this.serviceUrl + '/payout', params);
	}
	getDelivererPayOutByDelivererId(delivererId: string, search: any, sortBy?: any, paging?: Boolean, limit?: number, offset?: number) {
		let params = ZapppUtil.buildQueryParams(search, sortBy, paging, limit, offset);
		return this.zapppHttp.get(this.serviceUrl + '/payout/' + delivererId, params);
	}
}
