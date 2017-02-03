import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing } from './track.routing';
import { Track } from './track.component';
import { DeliverersMap } from './components/deliverersMap/deliverersMap.component';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		NgaModule,
		routing
	],
	declarations: [
		Track,
		DeliverersMap
	],
	providers: [

	]
})
export default class TrackModule { }
