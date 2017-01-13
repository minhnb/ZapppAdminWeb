import { ZapppBaseComponent } from '../baseComponent/base.component';

import { Component, Injector, ViewEncapsulation, ViewContainerRef } from '@angular/core';
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

	public form: FormGroup;
	public email: AbstractControl;
	public password: AbstractControl;
	public submitted: boolean = false;

	public stepOneLoginByPhoneForm: FormGroup;
	public phoneNumber: AbstractControl;
	public stepTwoLoginByPhoneStepTwoForm: FormGroup;
	public pinCode: AbstractControl;

	public isShowStepTwoLoginByPhoneForm: boolean = false;

	requestId: string;
	formattedPhoneNumber: string;

	constructor(private injector: Injector, private userService: UserService, fb: FormBuilder) {
		super(injector);
		// this.prepareLoginByEmailForm(fb);
		this.prepareStepOneLoginByPhoneForm(fb);
		this.prepareStepTwoLoginByPhoneForm(fb);
	}

	prepareLoginByEmailForm(fb: FormBuilder) {
		this.form = fb.group({
			'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
			'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
		});

		this.email = this.form.controls['email'];
		this.password = this.form.controls['password'];
	}

	prepareStepOneLoginByPhoneForm(fb: FormBuilder) {
		this.stepOneLoginByPhoneForm = fb.group({
			'phoneNumber': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(6)])]
		});

		this.phoneNumber = this.stepOneLoginByPhoneForm.controls['phoneNumber'];
	}

	prepareStepTwoLoginByPhoneForm(fb: FormBuilder) {
		this.stepTwoLoginByPhoneStepTwoForm = fb.group({
			'pinCode': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(4)])]
		});

		this.pinCode = this.stepTwoLoginByPhoneStepTwoForm.controls['pinCode'];
	}

	public onSubmit(values: Object): void {
		this.submitted = true;
		if (this.form.valid) {
			let email = this.email.value;
			let password = this.password.value;
			this.userService.logIn(email, password).subscribe(
				res => {
					this.router.navigateByUrl('/dashboard');
				},
				error => {
					this.zapppAlert.showError(error.message);
				});
		}
	}

	public getPinCode(values: Object): void {
		if (this.stepOneLoginByPhoneForm.valid) {
			let phoneNumber = this.phoneNumber.value;
			let countryCode = "VN";
			this.userService.getPinCode(phoneNumber, countryCode).subscribe(
				res => {
					this.requestId = res.request_id;
					this.formattedPhoneNumber = res.phone_number;
					this.isShowStepTwoLoginByPhoneForm = true;
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
		if (this.stepOneLoginByPhoneForm.valid) {
			let pinCode = this.pinCode.value;
			let countryCode = "VN";
			this.userService.logInPhone(this.formattedPhoneNumber, this.requestId, pinCode).subscribe(
				res => {
					this.router.navigateByUrl('/dashboard');
				},
				error => {
					this.zapppAlert.showError(error.message);
				});
		}
	}

	public showStepTwoLoginByPhoneForm(event) {
		this.isShowStepTwoLoginByPhoneForm = true;
		event.preventDefault();
	}

	public hideStepTwoLoginByPhoneForm(event) {
		this.isShowStepTwoLoginByPhoneForm = false;
		event.preventDefault();
	}
}
