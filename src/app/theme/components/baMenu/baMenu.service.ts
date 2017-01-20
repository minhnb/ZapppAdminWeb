import { Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { ZapppConstant } from '../../../helper/zapppConstant';

@Injectable()
export class BaMenuService {

	protected _currentMenuItem = {};
    private userRole: string;

	constructor(private _router: Router) {
        this.userRole = localStorage.getItem(ZapppConstant.ROLE);
	}

	public convertRoutesToMenus(routes: Routes): any[] {
		let items = this._convertArrayToItems(routes);
		return this._skipEmpty(items);
	}

	public getCurrentItem(): any {
		return this._currentMenuItem;
	}

	public selectMenuItem(menuItems: any[]): any[] {
		let items = [];
		menuItems.forEach((item) => {
			this._selectItem(item);

			if (item.selected) {
				this._currentMenuItem = item;
			}

			if (item.children && item.children.length > 0) {
				item.children = this.selectMenuItem(item.children);
			}
			items.push(item);
		});
		return items;
	}

	protected _skipEmpty(items: any[]): any[] {
		let menu = [];
		items.forEach((item) => {
			let menuItem;
			if (item.skip) {
				if (item.children && item.children.length > 0) {
					menuItem = item.children;
				}
			} else {
				menuItem = item;
			}

			if (menuItem) {
				menu.push(menuItem);
			}
		});

		return [].concat.apply([], menu);
	}

	protected _convertArrayToItems(routes: any[], parent?: any): any[] {
		let items = [];
		routes.forEach((route) => {
			items.push(this._convertObjectToItem(route, parent));
		});
		return items;
	}

	protected _convertObjectToItem(object, parent?: any): any {
		let item: any = {};
		if (object.data && object.data.menu) {
			// this is a menu object
			item = object.data.menu;
			item.route = object;
            if (!this.isAcceptedMenu(object, this.userRole)) {
                item.hidden = true;
            }
			delete item.route.data.menu;
		} else {
			item.route = object;
			item.skip = true;
		}

		// we have to collect all paths to correctly build the url then
		if (Array.isArray(item.route.path)) {
			item.route.paths = item.route.path;
		} else {
			item.route.paths = parent && parent.route && parent.route.paths ? parent.route.paths.slice(0) : ['/'];
			if (!!item.route.path) item.route.paths.push(item.route.path);
		}

		if (object.children && object.children.length > 0) {
			item.children = this._convertArrayToItems(object.children, item);
		}

		let prepared = this._prepareItem(item);

		// if current item is selected or expanded - then parent is expanded too
		if ((prepared.selected || prepared.expanded) && parent) {
			parent.expanded = true;
		}

		return prepared;
	}

	protected _prepareItem(object: any): any {
		if (!object.skip) {
			object.target = object.target || '';
			object.pathMatch = object.pathMatch || 'full';
			return this._selectItem(object);
		}

		return object;
	}

	protected _selectItem(object: any): any {
		object.selected = this._router.isActive(this._router.createUrlTree(object.route.paths), object.pathMatch === 'full');
		return object;
	}

	isAcceptedMenu(menu: any, userRole: string): Boolean {
		if (!menu.roles) {
			return true;
		}
		if (menu.roles.indexOf(userRole) > -1) {
			return true;
		}
		if (menu.roles.indexOf('all') > -1) {
			return true;
		}
		return false;
	}
}
