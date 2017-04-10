import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ZapppHttp } from './zapppHttp';

import { AppConfig } from '../app.config';
import { ZapppConstant } from '../helper/zapppConstant';
import { ZapppUtil } from '../helper/zapppUtil';

@Injectable()
export class LocalizationService {
	private serviceUrl = AppConfig.API_URL + 'localization';
	constructor(private zapppHttp: ZapppHttp) { }

	getLocalizationData(version?: string) {
		let params: any = {
			type: ZapppConstant.WEB_APP
		};
		if (version != undefined) {
			params.current_version = version;
		}
		return this.zapppHttp.get(this.serviceUrl, params);
	}
}
