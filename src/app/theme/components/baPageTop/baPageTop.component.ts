import { Component, ViewEncapsulation, Injector } from '@angular/core';

import { GlobalState } from '../../../global.state';

import { ZapppBaseComponent } from '../../../zappp/baseComponent/base.component';
import { UserService } from '../../../services/user';

@Component({
	selector: 'ba-page-top',
	styles: [require('./baPageTop.scss')],
	template: require('./baPageTop.html'),
	encapsulation: ViewEncapsulation.None,
	providers: [UserService]
})
export class BaPageTop extends ZapppBaseComponent {

	public isScrolled: boolean = false;
	public isMenuCollapsed: boolean = false;

	constructor(private injector: Injector, private _state: GlobalState, private userService: UserService) {
        super(injector);
		this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
			this.isMenuCollapsed = isCollapsed;
		});
	}

	public toggleMenu() {
		this.isMenuCollapsed = !this.isMenuCollapsed;
		this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
		return false;
	}

	public scrolledChanged(isScrolled) {
		this.isScrolled = isScrolled;
	}

	public signOut(event) {
        this.userService.logOut().subscribe(
            res => {
                this.goToLoginPage();
            },
            error => {
                this.goToLoginPage();
            });;
        event.preventDefault();
	}

    goToLoginPage() {
        this.router.navigateByUrl('/login');
    }
}
