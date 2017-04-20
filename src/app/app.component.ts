import './app.loader.ts';
import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { GlobalState } from './global.state';
import { BaImageLoaderService, BaThemePreloader, BaThemeSpinner } from './theme/services';
import { layoutPaths } from './theme/theme.constants';
import { BaThemeConfig } from './theme/theme.config';

import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { ZapppAlert } from './helper/zapppAlert';
import { ZapppConstant } from './helper/zapppConstant';
import { ZapppUtil } from './helper/zapppUtil';

import { LocalizationService } from './services/localization';
import { UserService } from './services/user';

/*
 * App Component
 * Top Level Component
 */
@Component({
	selector: 'app',
	encapsulation: ViewEncapsulation.None,
	styles: [require('normalize.css'), require('./app.scss')],
	template: `
    <main [ngClass]="{'menu-collapsed': isMenuCollapsed}" baThemeRun>
      <div class="additional-bg"></div>
      <router-outlet></router-outlet>
    </main>
  `,
	providers: [LocalizationService, UserService]
})
export class App {

	isMenuCollapsed: boolean = false;

	constructor(private _state: GlobalState,
		private _imageLoader: BaImageLoaderService,
		private _spinner: BaThemeSpinner,
		private _config: BaThemeConfig,
		private viewContainerRef: ViewContainerRef,
		private translate: TranslateService,
		private zapppAlert: ZapppAlert,
		private router: Router,
		private localizationService: LocalizationService,
		private userService: UserService) {

		this._loadImages();

		this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
			this.isMenuCollapsed = isCollapsed;
		});

		translate.addLangs(['en']);
		translate.setDefaultLang('en');
		translate.use('en');

		zapppAlert.setDefaultViewContainer(viewContainerRef);
		this.loadLocalizationData();
		if (localStorage.getItem(ZapppConstant.ACCESS_TOKEN)) {
            this.loadUserInfo();
        }
	}

	public ngAfterViewInit(): void {
		// hide spinner once all loaders are completed
		BaThemePreloader.load().then((values) => {
			this._spinner.hide();
		});
	}

	private _loadImages(): void {
		// register some loaders
		BaThemePreloader.registerLoader(this._imageLoader.load(layoutPaths.images.root + 'sky-bg.jpg'));
	}

	loadLocalizationData() {
		this.localizationService.getLocalizationData().subscribe(
			res => {
				let data = res.data;
				let currentLangs = this.translate.getLangs();
				Object.keys(data).forEach(langKey => {
					if (currentLangs.indexOf(langKey) == -1) {
						return;
					}
					this.translate.getTranslation(langKey).subscribe(
						translateData => {
							let langData = translateData['SYNC'];
							Object.keys(data[langKey]).forEach(key => {
								let value = data[langKey][key];
								if (value) {
									langData[key] = data[langKey][key];
								}
							});
							this.translate.setTranslation(langKey, translateData);
						},
						error => {
							console.log('Get translation data failed');
						}
					)

				});
			},
			error => {
				console.log('Load localization data failed');
			}
		)
	}

	loadUserInfo() {
		this.userService.getUserInfo().subscribe(
			res => {
				if (!ZapppUtil.isValidUserRole(res.roles)) {
					localStorage.clear();
					this.router.navigate(['/login']);
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

}
