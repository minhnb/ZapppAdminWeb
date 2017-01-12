import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { FacebookLoginComponent } from './facebooklogin.component';


@NgModule({
	imports: [
        CommonModule
	],
	declarations: [
		FacebookLoginComponent
	],
	exports: [
		FacebookLoginComponent
	]
})
export class FacebookLoginModule { }
