import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { TranslateModule } from 'ng2-translate';

import { Login } from './login.component';
import { routing } from './login.routing';
// import { FacebookLoginModule } from '../../helper/facebook/facebooklogin.module';
// import { GoogleLoginModule } from '../../helper/google/googlelogin.module';


@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		NgaModule,
		TranslateModule,
		// FacebookLoginModule,
		// GoogleLoginModule,
		routing
	],
	declarations: [
		Login
	]
})
export default class LoginModule { }
