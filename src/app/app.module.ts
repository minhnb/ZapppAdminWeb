import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';

import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { routing } from './app.routing';

// App is our top level component
import { App } from './app.component';
import { AppState, InternalStateType } from './app.service';
import { GlobalState } from './global.state';
import { NgaModule } from './theme/nga.module';
import { SharedModule } from './shared/shared.module';
import { PagesModule } from './pages/pages.module';
import { ZapppModule } from './zappp/zappp.module';

// Application wide providers
const APP_PROVIDERS = [
	AppState,
	GlobalState
];

type StoreType = {
	state: InternalStateType,
	restoreInputValues: () => void,
	disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
	bootstrap: [App],
	declarations: [
		App
	],
	imports: [ // import Angular's modules
		BrowserModule,
		HttpModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		NgaModule.forRoot(),
		TranslateModule.forRoot({
			provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
            deps: [Http]
		}),
		ModalModule.forRoot(),
		BootstrapModalModule,
		SharedModule,
		ZapppModule,
		routing
	],
	providers: [ // expose our Services and Providers into Angular's dependency injection
		ENV_PROVIDERS,
		APP_PROVIDERS
	]
})

export class AppModule {

	constructor(public appRef: ApplicationRef, public appState: AppState) {
	}

	hmrOnInit(store: StoreType) {
		if (!store || !store.state) return;
		console.log('HMR store', JSON.stringify(store, null, 2));
		// set state
		this.appState._state = store.state;
		// set input values
		if ('restoreInputValues' in store) {
			let restoreInputValues = store.restoreInputValues;
			setTimeout(restoreInputValues);
		}
		this.appRef.tick();
		delete store.state;
		delete store.restoreInputValues;
	}

	hmrOnDestroy(store: StoreType) {
		const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
		// save state
		const state = this.appState._state;
		store.state = state;
		// recreate root elements
		store.disposeOldHosts = createNewHosts(cmpLocation);
		// save input values
		store.restoreInputValues = createInputTransfer();
		// remove styles
		removeNgStyles();
	}

	hmrAfterDestroy(store: StoreType) {
		// display new elements
		store.disposeOldHosts();
		delete store.disposeOldHosts;
	}
}
