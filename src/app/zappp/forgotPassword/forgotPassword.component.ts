import { ZapppBaseComponent } from '../baseComponent/base.component';

import { Component, Injector, ViewEncapsulation, ViewContainerRef, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EqualPasswordsValidator } from '../../theme/validators';
import { UserService } from '../../services/user';
import { ZapppConstant } from '../../helper/zapppConstant';

@Component({
	selector: 'forgot-password',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./forgotPassword.scss')],
	template: require('./forgotPassword.html'),
	providers: [UserService]
})
export class ForgotPassword extends ZapppBaseComponent {

	public stepOneResetPasswordByPhoneForm: FormGroup;
	public phoneNumber: AbstractControl;
	public countryCode: AbstractControl;
	public stepTwoResetPasswordByPhoneForm: FormGroup;
	public pinCode: AbstractControl;
	public stepThreeResetPasswordByPhoneForm: FormGroup;
	public password: AbstractControl;
	public repeatPassword: AbstractControl;
	public passwords: FormGroup;

	public resetPasswordByPhoneFormStepCount: number = 1;

	@ViewChild('inputPhoneNumber') inputPhoneNumber: ElementRef;
	@ViewChild('inputPinCode') inputPinCode: ElementRef;
	@ViewChild('inputPassword') inputPassword: ElementRef;

	formattedPhoneNumber: string;
	phoneSignature: string;

	constructor(private injector: Injector, private userService: UserService, private formBuilder: FormBuilder) {
		super(injector);
		this.prepareStepOneResetPasswordByPhoneForm();
		this.prepareStepTwoResetPasswordByPhoneForm();
		this.prepareStepThreeResetPasswordByPhoneForm();
	}

	ngAfterViewInit() {
		this.setFocusInput(this.inputPhoneNumber);
	}

	prepareStepOneResetPasswordByPhoneForm() {
		this.stepOneResetPasswordByPhoneForm = this.formBuilder.group({
			'phoneNumber': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(6)])],
			'countryCode': ['', Validators.compose([Validators.required])]
		});

		this.phoneNumber = this.stepOneResetPasswordByPhoneForm.controls['phoneNumber'];
		this.countryCode = this.stepOneResetPasswordByPhoneForm.controls['countryCode'];
		this.countryCode.setValue("HK");
	}

	prepareStepTwoResetPasswordByPhoneForm() {
		this.stepTwoResetPasswordByPhoneForm = this.formBuilder.group({
			'pinCode': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(4)])]
		});

		this.pinCode = this.stepTwoResetPasswordByPhoneForm.controls['pinCode'];
	}

	prepareStepThreeResetPasswordByPhoneForm() {
		this.stepThreeResetPasswordByPhoneForm = this.formBuilder.group({
			'passwords': this.formBuilder.group({
				'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
				'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
			}, { validator: EqualPasswordsValidator.validate('password', 'repeatPassword') }),
		});

		this.passwords = <FormGroup>this.stepThreeResetPasswordByPhoneForm.controls['passwords'];
		this.password = this.passwords.controls['password'];
		this.repeatPassword = this.passwords.controls['repeatPassword'];
	}

	getPinCode(): void {
		if (this.stepOneResetPasswordByPhoneForm.valid) {
			let phoneNumber = this.phoneNumber.value;
			let countryCode = this.countryCode.value;
			this.userService.getPinCode(phoneNumber, countryCode).subscribe(
				res => {
					this.formattedPhoneNumber = res.phone_number;
					this.showStepTwoResetPasswordByPhoneForm();
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

	sendPinCode(): void {
		if (this.stepTwoResetPasswordByPhoneForm.valid) {
			let pinCode = this.pinCode.value;
			this.userService.verifyPhoneNumber(this.formattedPhoneNumber, pinCode).subscribe(
				res => {
					this.phoneSignature = res.phone_signature;
					this.showStepThreeResetPasswordByPhoneForm();
				},
				error => {
					if (error.code == 'ExpiredSmsCode') {
						this.showPopUpResendPinCode();
					} else {
						this.zapppAlert.showError(error.message);
					}
				});
		}
	}

	showStepOneResetPasswordByPhoneForm(event?) {
		this.resetPasswordByPhoneFormStepCount = 1;
		this.prepareStepOneResetPasswordByPhoneForm();
		this.setFocusInput(this.inputPhoneNumber);
		if (event) {
			event.preventDefault();
		}
	}

	showStepTwoResetPasswordByPhoneForm(event?) {
		this.resetPasswordByPhoneFormStepCount = 2;
		this.prepareStepTwoResetPasswordByPhoneForm();
		this.setFocusInput(this.inputPinCode);
		if (event) {
			event.preventDefault();
		}
	}

	showStepThreeResetPasswordByPhoneForm(event?) {
		this.resetPasswordByPhoneFormStepCount = 3;
		this.prepareStepThreeResetPasswordByPhoneForm();
		this.setFocusInput(this.inputPassword);
		if (event) {
			event.preventDefault();
		}
	}

	resetPassword() {
		if (this.stepThreeResetPasswordByPhoneForm.valid) {
			let password = this.password.value;
			this.userService.resetPassword(this.phoneSignature, password).subscribe(
				res => {
					this.afterResetPassword();
				},
				error => {
					this.zapppAlert.showError(error.message);
				});
		}
	}

	afterResetPassword() {
		this.zapppAlert.showInfo(this.translate.instant('SYNC.STR_MSG_PASSWORD_CHANGED_SUCCESS'))
			.then(result => {
				this.router.navigateByUrl('/login');
			})
			.catch(err => {
				this.router.navigateByUrl('/login');
			});
	}

	showPopUpResendPinCode() {
		this.zapppAlert.showConfirm(this.translate.instant('SYNC.STR_SERVER_ERR_EXPIRED_PASSWORD_RESET_CODE'), null, this.translate.instant('BUTTONS.RESEND'))
			.then(result => {
				this.getPinCode();
			})
			.catch(err => {

			})
	}
}
