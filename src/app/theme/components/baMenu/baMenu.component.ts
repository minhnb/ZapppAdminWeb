import {Component, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {Router, Routes, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Rx';

import {BaMenuService} from './baMenu.service';
import {GlobalState} from '../../../global.state';

@Component({
	selector: 'ba-menu',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./baMenu.scss')],
	template: require('./baMenu.html'),
	providers: [BaMenuService]
})
export class BaMenu {

	@Input() menuRoutes: Routes = [];
	@Input() sidebarCollapsed: boolean = false;
	@Input() menuHeight: number;

	@Output() expandMenu = new EventEmitter<any>();

	public menuItems: any[];
	public showHoverElem: boolean;
	public hoverElemHeight: number;
	public hoverElemTop: number;
	protected _onRouteChange: Subscription;
	public outOfArea: number = -200;

	constructor(private _router: Router, private _service: BaMenuService, private _state: GlobalState) {
		this._onRouteChange = this._router.events.subscribe((event) => {

			if (event instanceof NavigationEnd) {
				if (this.menuItems) {
					this.selectMenuAndNotify();
				} else {
					// on page load we have to wait as event is fired before menu elements are prepared
					setTimeout(() => this.selectMenuAndNotify());
				}
			}
		});
	}

	public selectMenuAndNotify(): void {
		if (this.menuItems) {
			this.menuItems = this._service.selectMenuItem(this.menuItems);
			let currentMenuItem = this._service.getCurrentItem();
			if (Object.keys(currentMenuItem).length > 0) {
				this._state.notifyDataChanged('menu.activeLink', currentMenuItem);
			}
		}
	}

	public ngOnInit(): void {
		this.menuItems = this._service.convertRoutesToMenus(this.menuRoutes);
		this.menuItems.map(menuItem => {
			let paths = [];
			menuItem.route.paths.forEach(path => {
				if (path.indexOf('/') > 0) {
					let splitedPath = path.split('/');
					splitedPath.forEach(childrenPath => {
						paths.push(childrenPath);
					});
				} else {
					paths.push(path);
				}
			});
			menuItem.route.paths = paths;
			return menuItem;
		});
	}

	public ngOnDestroy(): void {
		this._onRouteChange.unsubscribe();
	}

	public hoverItem($event): void {
		this.showHoverElem = true;
		this.hoverElemHeight = $event.currentTarget.clientHeight;
		// TODO: get rid of magic 66 constant
		this.hoverElemTop = $event.currentTarget.getBoundingClientRect().top - 66;
	}

	public toggleSubMenu($event): boolean {
		var submenu = jQuery($event.currentTarget).next();

		if (this.sidebarCollapsed) {
			this.expandMenu.emit(null);
			if (!$event.item.expanded) {
				$event.item.expanded = true;
			}
		} else {
			$event.item.expanded = !$event.item.expanded;
			submenu.slideToggle();
		}

		return false;
	}
}
