import { NgModule } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { TranslateModule } from 'ng2-translate';

import { Dashboard } from './dashboard.component';
import { AdminDashboard } from './admin/dashboard.component';
import { routing } from './dashboard.routing';

import { ModalModule } from 'ng2-bootstrap';
import { DateTimePickerModule } from '../../helper/datetimepicker';

import { PopularApp } from './popularApp';
import { PieChart } from './pieChart';
import { TrafficChart } from './trafficChart';
import { UsersMap } from './usersMap';
import { LineChart } from './lineChart';
import { Feed } from './feed';
import { Todo } from './todo';
import { Calendar } from './calendar';
import { CalendarService } from './calendar/calendar.service';
import { FeedService } from './feed/feed.service';
import { LineChartService } from './lineChart/lineChart.service';
import { PieChartService } from './pieChart/pieChart.service';
import { TodoService } from './todo/todo.service';
import { TrafficChartService } from './trafficChart/trafficChart.service';
import { UsersMapService } from './usersMap/usersMap.service';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		NgaModule,
		TranslateModule,
		ModalModule.forRoot(),
		DateTimePickerModule,
		routing
	],
	declarations: [
		PopularApp,
		PieChart,
		TrafficChart,
		UsersMap,
		LineChart,
		Feed,
		Todo,
		Calendar,
		AdminDashboard,
		Dashboard
	],
	providers: [
		CalendarService,
		FeedService,
		LineChartService,
		PieChartService,
		TodoService,
		TrafficChartService,
		UsersMapService
	]
})
export default class DashboardModule { }
