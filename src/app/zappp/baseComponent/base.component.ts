import { Component, Injector, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ZapppAlert } from '../../helper/zapppAlert';
import { TranslateService } from 'ng2-translate';
import { BaThemeSpinner } from '../../theme/services';
import { ZapppConstant } from '../../helper/zapppConstant';

var moment = require('moment');

@Component({

})
export class ZapppBaseComponent {
	public zapppAlert: ZapppAlert;
	public router: Router;
	public translate: TranslateService;
	public _spinner: BaThemeSpinner;
	constructor(injector: Injector) {
		this.zapppAlert = injector.get(ZapppAlert);
		this.router = injector.get(Router);
		this.translate = injector.get(TranslateService);
		this._spinner = injector.get(BaThemeSpinner);
	}

	setFocusInput(elementRef: ElementRef) {
		setTimeout(function() {
			elementRef.nativeElement.focus();
		}, 0);
	}

	timeStampToDateTime(timeStamp: number): string {
		return moment.unix(timeStamp).format(ZapppConstant.FORMAT_DATETIME);
	}
	timeStampToDateTimeWithSecond(timeStamp: number): string {
		return moment.unix(timeStamp).format(ZapppConstant.FORMAT_DATETIME_WITH_SECOND);
	}
	distanceToKm(distance: number): number {
		return distance / 1000;
	}
	displayDuration(duration: number): string {
		let durationData = moment.duration(duration, 'seconds');
		let hours = durationData.hours();
		let minutes = durationData.minutes();
		let seconds = durationData.seconds();
		let result = [];
		if (hours) {
			result.push(hours);
			if (hours > 1) {
				result.push('hours');
			} else {
				result.push('hour');
			}
		}
		result.push(minutes);
		if (minutes > 1) {
			result.push('minutes');
		} else {
			result.push('minute');
		}
		result.push(seconds);
		if (seconds > 1) {
			result.push('seconds');
		} else {
			result.push('second');
		}
		return result.filter(Boolean).join(' ');
	}
}
