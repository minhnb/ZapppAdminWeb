import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ZapppAlert } from '../../helper/zapppAlert';
import { TranslateService } from 'ng2-translate';

@Component({

})
export class ZapppBaseComponent {
	public zapppAlert: ZapppAlert;
	public router: Router;
	public translate: TranslateService;
	constructor(injector: Injector) {
		this.zapppAlert = injector.get(ZapppAlert);
		this.router = injector.get(Router);
		this.translate = injector.get(TranslateService);
	}
}
