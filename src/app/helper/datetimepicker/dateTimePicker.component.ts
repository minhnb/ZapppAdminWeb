import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, HostListener, ElementRef, TemplateRef, Renderer, ViewContainerRef } from '@angular/core';
import { PopoverDirective, PopoverConfig } from 'ng2-bootstrap/popover';
import { ComponentLoader, ComponentLoaderFactory } from 'ng2-bootstrap/component-loader';
import { DateTimePickerComponent } from '../../../../helper/datetimepicker';

var moment = require('moment');

@Component({
	selector: 'datetime-picker-popover-container',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[class]': '"popover in popover-bottom bottom left"',
		role: 'tooltip',
		style: 'display:block;'
	},
	template: `
        <div class="popover-arrow arrow"></div>
        <h3 class="popover-title" *ngIf="title">{{title}}</h3><div class="popover-content"><ng-content></ng-content></div>
    `
})
export class DateTimePickerPopoverContainerComponent {
	@Input() public placement: string;
	@Input() public title: string;

	public constructor(config: PopoverConfig) {
		Object.assign(this, config);
	}
}

@Component({
    selector: 'datetimepicker',
    template: require('./dateTimePicker.html'),
    styles: [require('./dateTimePicker.scss')],
    encapsulation: ViewEncapsulation.None,
})
export class DateTimePicker {
    @Input() dateTimeModel: Date;
    @Input() formatDateTime: String;
    @Input() placeholder: String;
    @Output() dateTimeModelChange: EventEmitter<{}> = new EventEmitter();

    @ViewChild('dateTimePickerPopOver') dateTimePickerPopOver: PopoverDirective;
    @ViewChild('dateTimePickerContainer') dateTimePickerContainer: ElementRef;
    @ViewChild('dateTimePickerPopOverTemplate') dateTimePickerPopOverTemplate: TemplateRef<any>;

    @Input() activeDate: Date;
    @Input() customClass: any;
    @Input() dateDisabled: any;
    @Input() datepickerMode: String = 'day';
    @Input() formatDay: String = 'DD';
    @Input() formatDayHeader: String = 'dd';
    @Input() formatDayTitle: String = 'MMMM YYYY';
    @Input() formatMonth: String = 'MMM';
    @Input() formatMonthTitle: String = 'YYYY';
    @Input() formatYear: String = 'YYYY';
    @Input() initDate: Date;
    @Input() maxDate: Date;
    @Input() maxMode: String = 'year';
    @Input() minDate: Date;
    @Input() minMode: String = 'day';
    @Input() monthColLimit: number = 4;
    @Input() onlyCurrentMonth: boolean;
    @Input() shortcutPropagation: boolean = true;
    @Input() showWeeks: boolean;
    @Input() startingDay: number = 0;
    @Input() yearColLimit: number = 4;
    @Input() yearRange: number = 12;

	@Input() arrowkeys: boolean = true;
	@Input() hourStep: number = 1;
	@Input() maxTime: number;
	@Input() meridians: string[] = ['AM', 'PM'];
	@Input() minTime: number;
	@Input() minuteStep: number = 5;
	@Input() mousewheel: boolean = true;
	@Input() readonlyInput: boolean = false;
	@Input() showMeridian: boolean = true;
	@Input() showSpinners: boolean = true;

    @Input() hideTimePicker: boolean;

    popover: ComponentLoader<DateTimePickerPopoverContainerComponent>;
	timeModel: Date = new Date();
	dateTimeModelFormatted: String;

	public touched: boolean = false;

    @HostListener('document:click', ['$event'])
	documentClick(event) {
        if (!this._elementRef.nativeElement.contains(event.target)) {
            this.hideDateTimePicker();
        }
	}

    constructor(private _elementRef: ElementRef, private _renderer: Renderer, private _viewContainerRef: ViewContainerRef,
        private _config: PopoverConfig, private cis: ComponentLoaderFactory) {
		this.popover = cis
            .createLoader<DateTimePickerPopoverContainerComponent>(_elementRef, _viewContainerRef, _renderer)
            .provide({ provide: PopoverConfig, useValue: _config });
		this.resetTimeModel();
	}

	resetTimeModel() {
		this.timeModel.setHours(0);
		this.timeModel.setMinutes(0);
		this.timeModel.setSeconds(0);
	}

    showDateTimePicker(event) {
        if (this.popover.isShown) {
			return;
        }

        this.popover
			.attach(DateTimePickerPopoverContainerComponent)
			.to('body')
			.position({ attachment: 'bottom left' })
			.show({
				content: this.dateTimePickerPopOverTemplate
			});
    }

    selectDate(event) {
        // this.dateTimeModel = event;
		this.updateDateModelFormatted();
        this.dateTimeModelChange.emit(this.dateTimeModel);
    }

    hideDateTimePicker() {
        if (this.popover.isShown) {
            this.popover.hide();
			this.touched = true;
        }
    }

    preventHidePopOver(event) {
        event.stopPropagation();
    }

	handleTimePickerChanged(event) {
		this.updateDateModelFormatted();
		this.dateTimeModelChange.emit(this.dateTimeModel);
	}

	updateDateModelFormatted() {
		if (this.dateTimeModel) {
			this.dateTimeModel.setHours(this.timeModel.getHours());
			this.dateTimeModel.setMinutes(this.timeModel.getMinutes());
			this.dateTimeModel.setSeconds(this.timeModel.getSeconds());
			this.dateTimeModelFormatted = moment(this.dateTimeModel).format(this.formatDateTime || 'MM/DD/YYYY HH:mm');
		}
	}

	public reset() {
		this.resetTimeModel();
		this.dateTimeModel = null;
		this.dateTimeModelFormatted = '';
		this.dateTimeModelChange.emit(this.dateTimeModel);
		this.touched = false;
	}
}
