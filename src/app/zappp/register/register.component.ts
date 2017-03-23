import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator, EqualPasswordsValidator } from '../../theme/validators';

import { ZapppBaseComponent } from '../baseComponent/base.component';
import { UserService } from '../../services/user';
import { ZapppConstant } from '../../helper/zapppConstant';
import { DateTimePicker } from '../../helper/datetimepicker';
import { BaPictureUploader } from '../../theme/components/baPictureUploader';

@Component({
	selector: 'register',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./register.scss')],
	template: require('./register.html'),
    providers: [UserService]
})
export class Register extends ZapppBaseComponent {

	public form: FormGroup;
	public firstName: AbstractControl;
	public lastName: AbstractControl;
	public email: AbstractControl;
	public username: AbstractControl;
	public password: AbstractControl;
	public repeatPassword: AbstractControl;
	public passwords: FormGroup;
	public idNumber: AbstractControl;
	public gender: AbstractControl;
	public phoneNumber: AbstractControl;
	public country: AbstractControl;
	public homeAddress: AbstractControl;
	public swiftCode: AbstractControl;
	public accountNumber: AbstractControl;

	@ViewChild('birthdayDateTimePicker') birthdayDateTimePicker: DateTimePicker;
	@ViewChild('photoPreview') photoPreview: BaPictureUploader;

	public submitted: boolean = false;
	public birthdayDay: Date;
	public avatar_base64: String = '';

	public checkboxPropertiesMapping = {
		model: 'checked',
		value: 'name',
		label: 'name',
		baCheckboxClass: 'class'
    };
	public defaultPicture = 'assets/img/theme/no-photo.png';
	public checkboxModel: Array<any>;
	formatDateTime: String;

	constructor(private injector: Injector, private userService: UserService, fb: FormBuilder) {
        super(injector);

		this.formatDateTime = ZapppConstant.FORMAT_DATE;
		this.checkboxModel = [
			{
				name: this.translate.instant('TRANSPORTATION.WALK'),
				checked: false,
				class: 'col-md-4'
			},
			{
				name: this.translate.instant('TRANSPORTATION.BICYCLE'),
				checked: false,
				class: 'col-md-4'
			}, {
				name: this.translate.instant('TRANSPORTATION.VEHICLE'),
				checked: false,
				class: 'col-md-4'
			}
		];
		this.form = fb.group({
			'firstName': ['', Validators.compose([Validators.required])],
			'lastName': ['', Validators.compose([Validators.required])],
			'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
			'username': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern(ZapppConstant.PATTERN.VALID_USERNAME)])],
			'passwords': fb.group({
				'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
				'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
			}, { validator: EqualPasswordsValidator.validate('password', 'repeatPassword') }),
			'idNumber': ['', Validators.compose([Validators.required])],
			'gender': ['', Validators.compose([Validators.required])],
			'phoneNumber': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(6)])],
			'country': ['', Validators.compose([Validators.required])],
			'homeAddress': ['', Validators.compose([Validators.required])],
			'swiftCode': ['', Validators.compose([Validators.required])],
			'accountNumber': ['', Validators.compose([Validators.required])],
		});

		this.firstName = this.form.controls['firstName'];
		this.lastName = this.form.controls['lastName'];
		this.username = this.form.controls['username'];
		this.email = this.form.controls['email'];
		this.passwords = <FormGroup>this.form.controls['passwords'];
		this.password = this.passwords.controls['password'];
		this.repeatPassword = this.passwords.controls['repeatPassword'];
		this.idNumber = this.form.controls['idNumber'];
		this.gender = this.form.controls['gender'];
		this.phoneNumber = this.form.controls['phoneNumber'];
		this.country = this.form.controls['country'];
		this.homeAddress = this.form.controls['homeAddress'];
		this.swiftCode = this.form.controls['swiftCode'];
		this.accountNumber = this.form.controls['accountNumber'];
	}

	public onSubmit(values: Object): void {
		this.submitted = true;
		if (!this.form.valid) {
            return;
		}
		if (!this.avatar_base64 || !this.birthdayDay) {
			return;
		}
		if (!this.availableTransportationHasCheck()) {
			this.zapppAlert.showError(this.translate.instant('SYNC.STR_ERR_MISSING_VEHICLE'));
		}
		// let email = this.email.value;
		// let password = this.password.value;
		// let firstName = this.firstName.value;
		// let lastName = this.lastName.value;
		// let user = {
		// 	email: email,
		// 	firstName: firstName,
		// 	lastName: lastName,
		// 	password: password
		// };
		// this.userService.signUp(user).subscribe(
		// 	res => {
		// 		console.log(res);
		// 		this.zapppAlert.showInfo('Sign up successfully');
		// 	},
		// 	error => {
		// 		this.zapppAlert.showError(error.message);
		// 	});
	}

	availableTransportationHasCheck(): boolean {
		for (let i = 0; i < this.checkboxModel.length; i++) {
			let checkbox = this.checkboxModel[i];
			if (checkbox.checked) {
				return true;
			}
		}
		return false;
	}
}
