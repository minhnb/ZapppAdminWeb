import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { GoogleLoginComponent } from './googlelogin.component';


@NgModule({
	imports: [
        CommonModule
	],
	declarations: [
		GoogleLoginComponent
	],
	exports: [
		GoogleLoginComponent
	]
})
export class GoogleLoginModule { }
