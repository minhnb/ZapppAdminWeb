import { ZapppBaseComponent } from '../baseComponent/base.component';

import { Component, Injector, ViewEncapsulation, ViewContainerRef, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator } from '../../theme/validators';
import { UserService } from '../../services/user';
import { ZapppConstant } from '../../helper/zapppConstant';

@Component({
	selector: 'login',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./login.scss')],
	template: require('./login.html'),
	providers: [UserService]
})
export class Login extends ZapppBaseComponent {

	public stepOneLoginByPhoneForm: FormGroup;
	public phoneNumber: AbstractControl;
	public countryCode: AbstractControl;
	public stepTwoLoginByPhoneStepTwoForm: FormGroup;
	public pinCode: AbstractControl;

	public isShowStepTwoLoginByPhoneForm: boolean = false;

	@ViewChild('inputPhoneNumber') inputPhoneNumber: ElementRef;
	@ViewChild('inputPinCode') inputPinCode: ElementRef;

	formattedPhoneNumber: string;

	constructor(private injector: Injector, private userService: UserService, fb: FormBuilder) {
		super(injector);
		this.prepareStepOneLoginByPhoneForm(fb);
		this.prepareStepTwoLoginByPhoneForm(fb);
	}

	ngAfterViewInit() {
		this.setFocusInput(this.inputPhoneNumber);
	}

	prepareStepOneLoginByPhoneForm(fb: FormBuilder) {
		this.stepOneLoginByPhoneForm = fb.group({
			'phoneNumber': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(6)])],
			'countryCode': ['', Validators.compose([Validators.required])]
		});

		this.phoneNumber = this.stepOneLoginByPhoneForm.controls['phoneNumber'];
		this.countryCode = this.stepOneLoginByPhoneForm.controls['countryCode'];
		this.countryCode.setValue("HK");
	}

	prepareStepTwoLoginByPhoneForm(fb: FormBuilder) {
		this.stepTwoLoginByPhoneStepTwoForm = fb.group({
			'pinCode': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(4)])]
		});

		this.pinCode = this.stepTwoLoginByPhoneStepTwoForm.controls['pinCode'];
	}

	public getPinCode(values: Object): void {
		if (this.stepOneLoginByPhoneForm.valid) {
			let phoneNumber = this.phoneNumber.value;
			let countryCode = this.countryCode.value;
			this.userService.getPinCode(phoneNumber, countryCode).subscribe(
				res => {
					this.formattedPhoneNumber = res.phone_number;
					this.showStepTwoLoginByPhoneForm();
				},
				error => {
					let errorMessage = error.message;
					if (error.status == 400) {
						errorMessage = this.translate.instant('ERROR.LOGIN_BY_PHONE.BAD_REQUEST');
					}
					this.zapppAlert.showError(errorMessage);
				});
		}
	}

	public sendPinCode(values: Object): void {
		if (this.stepTwoLoginByPhoneStepTwoForm.valid) {
			let pinCode = this.pinCode.value;
			let countryCode = "VN";
			this.userService.logInPhone(this.formattedPhoneNumber, pinCode).subscribe(
				res => {
					this.router.navigateByUrl('/dashboard');
				},
				error => {
					this.zapppAlert.showError(error.message);
				});
		}
	}

	public showStepTwoLoginByPhoneForm(event?) {
		this.isShowStepTwoLoginByPhoneForm = true;
		this.pinCode.reset();
		this.setFocusInput(this.inputPinCode);
		if (event) {
			event.preventDefault();
		}
	}

	public hideStepTwoLoginByPhoneForm(event?) {
		this.isShowStepTwoLoginByPhoneForm = false;
		this.setFocusInput(this.inputPhoneNumber);
		if (event) {
			event.preventDefault();
		}
	}
}
