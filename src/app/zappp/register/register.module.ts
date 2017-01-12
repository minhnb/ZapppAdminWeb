import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { TranslateModule } from 'ng2-translate';

import { Register } from './register.component';
import { routing } from './register.routing';

import { FacebookLoginModule } from '../../helper/facebook/facebooklogin.module';


@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		NgaModule,
		TranslateModule,
		FacebookLoginModule,
		routing
	],
	declarations: [
		Register
	]
})
export default class RegisterModule { }
