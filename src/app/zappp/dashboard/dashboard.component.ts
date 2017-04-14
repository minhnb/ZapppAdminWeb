import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { ZapppBaseComponent } from '../baseComponent/base.component';
import { ZapppUtil } from '../../helper/zapppUtil';
@Component({
	selector: 'dashboard',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./dashboard.scss')],
	template: require('./dashboard.html')
})
export class Dashboard extends ZapppBaseComponent {

	constructor(private injector: Injector) {
        super(injector);
	}

	isAdmin(): boolean {
		return ZapppUtil.isAdmin();
	}

}
