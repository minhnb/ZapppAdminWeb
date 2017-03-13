import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatepickerModule } from 'ng2-bootstrap/datepicker';
import { TimepickerModule } from 'ng2-bootstrap/timepicker';
import { PopoverModule } from 'ng2-bootstrap/popover';

import { DateTimePicker } from './dateTimePicker.component';
import { DateTimePickerPopoverContainerComponent } from './dateTimePicker.component';

@NgModule({
	declarations: [
		DateTimePicker,
		DateTimePickerPopoverContainerComponent
	],
	imports: [
        FormsModule,
		CommonModule,
		DatepickerModule.forRoot(),
		TimepickerModule.forRoot(),
		PopoverModule.forRoot()
    ],
	exports: [
		DateTimePicker
	],
	entryComponents: [DateTimePickerPopoverContainerComponent]
})

export class DateTimePickerModule {

}
