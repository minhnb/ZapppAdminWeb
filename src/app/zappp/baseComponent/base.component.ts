import { Component, Injector, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ZapppAlert } from '../../helper/zapppAlert';
import { TranslateService } from 'ng2-translate';
import { BaThemeSpinner } from '../../theme/services';

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
}
