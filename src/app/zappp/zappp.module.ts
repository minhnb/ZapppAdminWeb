import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './zappp.routing';
import { NgaModule } from '../theme/nga.module';

import { TranslateModule } from 'ng2-translate';
import { Zappp } from './zappp.component';
import { AuthGuard } from '../helper/auth.guard';
import { AuthLoggedIn } from '../helper/auth.loggedin';

@NgModule({
	imports: [
		CommonModule,
		NgaModule,
		TranslateModule,
		routing
	],
	declarations: [Zappp],
	providers: [
		AuthGuard,
		AuthLoggedIn
	]
})
export class ZapppModule {
}
