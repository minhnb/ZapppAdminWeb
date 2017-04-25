import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ZapppHttp } from '../zapppHttp';

import { AppConfig } from '../../app.config';
import { ZapppConstant } from '../../helper/zapppConstant';
import { ZapppUtil } from '../../helper/zapppUtil';

@Injectable()
export class LocalizationService {
	private serviceUrl = AppConfig.API_URL + 'admin';
	constructor(private zapppHttp: ZapppHttp) { }

	getLocalizationData(type: string, version?: string) {
		let params: any = {
			type: type
		};
		if (version != undefined) {
			params.version = version;
		}
		return this.zapppHttp.get(this.serviceUrl + '/localization', params);
	}

	updateLocalizationData(type: string, data: any, version?: string): Observable<any> {
		let body = {
			type: type,
			data: data
		};
		return this.zapppHttp.post(this.serviceUrl + '/localization', body);
	}

	getListLocalizationDataVersion(type: string) {
		let params: any = {
			type: type
		};
		return this.zapppHttp.get(this.serviceUrl + '/localization/list', params);
	}
}
