import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { ZapppBaseComponent } from '../baseComponent/base.component';

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

}
