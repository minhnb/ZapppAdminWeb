import { NgModule } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { TranslateModule } from 'ng2-translate';
import { Ng2PaginationModule } from 'ng2-pagination';
import { ModalModule, TabsModule } from 'ng2-bootstrap';

import { routing } from './settings.routing';
import { Settings } from './settings.component';
import { Localization } from './components/localization';
import { LocalizationTable } from './components/localization/localizationTable.component';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		NgaModule,
		TranslateModule,
		Ng2PaginationModule,
		ModalModule.forRoot(),
		TabsModule.forRoot(),
		routing
	],
	declarations: [
		Settings,
		Localization,
		LocalizationTable
	],
	providers: [

	]
})
export default class SettingsModule { }
