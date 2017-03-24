import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator, EqualPasswordsValidator } from '../../theme/validators';

import { ZapppBaseComponent } from '../baseComponent/base.component';
import { UserService } from '../../services/user';
import { ZapppConstant } from '../../helper/zapppConstant';
import { DateTimePicker } from '../../helper/datetimepicker';
import { BaPictureUploader } from '../../theme/components/baPictureUploader';

var moment = require('moment');

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
	public phoneNumberCountryCode: AbstractControl;
	public country: AbstractControl;
	public homeAddress: AbstractControl;
	public swiftCode: AbstractControl;
	public accountNumber: AbstractControl;

	@ViewChild('birthdayDateTimePicker') birthdayDateTimePicker: DateTimePicker;
	@ViewChild('photoPreview') photoPreview: BaPictureUploader;

	public submitted: boolean = false;
	public birthdayDay: Date;
	public avatarBase64: String = '';

	public checkboxPropertiesMapping = {
		model: 'checked',
		value: 'name',
		label: 'name',
		baCheckboxClass: 'class'
    };
	public defaultPicture = 'assets/img/theme/no-photo.png';
	public checkboxModel: Array<any>;
	formatDateTime: String;

	constructor(private injector: Injector, private userService: UserService, private formBuilder: FormBuilder) {
        super(injector);

		this.formatDateTime = ZapppConstant.FORMAT_DATE;
		this.initRegisterForm();
	}

	public onSubmit(values: Object): void {
		this.submitted = true;
		if (!this.form.valid) {
            return;
		}
		if (!this.avatarBase64 || !this.birthdayDay || !this.availableTransportationHasCheck()) {
			return;
		}
		let email = this.email.value;
		let password = this.password.value;
		let name = this.getFullName(this.firstName.value, this.lastName.value);
		let username = this.username.value;
		let avatarBase64 = this.avatarBase64;
		let phoneNumber = this.phoneNumber.value;
		let phoneNumberCountryCode = this.phoneNumberCountryCode.value;
		let citizenId = this.idNumber.value;
		let gender = this.gender.value;
		let birthday = moment(this.birthdayDay).format('YYYY/MM/DD');
		let country = this.country.value;
		let homeAddress = this.homeAddress.value;
		let vehicles = this.getAvailableTransportation();
		let swiftCode = this.swiftCode.value;
		let bankAccountNumber = this.accountNumber.value;
		let user = {
			email: email,
			name: name,
			username: username,
			password: password,
			birthday: birthday,
			citizen_id: citizenId,
			gender: gender,
			phone_number: phoneNumber,
			phone_number_country_code: phoneNumberCountryCode,
			country: country,
			home_address: homeAddress,
			vehicles: vehicles,
			swift_code: swiftCode,
			bank_account_number: bankAccountNumber,
			avatar_base64: avatarBase64
		};
		this.userService.delivererSignUp(user).subscribe(
			res => {
				this.zapppAlert.showInfo(this.translate.instant('SIGN_UP.SIGN_UP_SUCCESSFULLY'));
				this.initRegisterForm();
			},
			error => {
				this.zapppAlert.showError(error.message);
			});
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

	getAvailableTransportation(): Array<string> {
		return this.checkboxModel.map(vehicle => {
			return vehicle.value;
		})
	}

	getFullName(firstName: string, lastName: string): string {
		let names = [firstName, lastName];
		return names.filter(Boolean).join(' ');
	}

	initRegisterForm() {
		this.checkboxModel = [
			{
				name: this.translate.instant('TRANSPORTATION.WALK'),
				checked: false,
				class: 'col-md-4',
				value: "walk"
			},
			{
				name: this.translate.instant('TRANSPORTATION.BICYCLE'),
				checked: false,
				class: 'col-md-4',
				value: 'bicycle'
			}, {
				name: this.translate.instant('TRANSPORTATION.VEHICLE'),
				checked: false,
				class: 'col-md-4',
				value: 'vehicle'
			}
		];
		this.form = this.formBuilder.group({
			'firstName': ['', Validators.compose([Validators.required])],
			'lastName': ['', Validators.compose([Validators.required])],
			'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
			'username': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern(ZapppConstant.PATTERN.VALID_USERNAME)])],
			'passwords': this.formBuilder.group({
				'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
				'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
			}, { validator: EqualPasswordsValidator.validate('password', 'repeatPassword') }),
			'idNumber': ['', Validators.compose([Validators.required])],
			'gender': ['', Validators.compose([Validators.required])],
			'phoneNumber': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(6)])],
			'phoneNumberCountryCode': [''],
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
		this.phoneNumberCountryCode = this.form.controls['phoneNumberCountryCode'];
		this.country = this.form.controls['country'];
		this.homeAddress = this.form.controls['homeAddress'];
		this.swiftCode = this.form.controls['swiftCode'];
		this.accountNumber = this.form.controls['accountNumber'];

		this.phoneNumberCountryCode.setValue("HK");
		this.birthdayDay = null;
		this.avatarBase64 = '';

		if (this.birthdayDateTimePicker) {
			this.birthdayDateTimePicker.reset();
		}
		if (this.photoPreview) {
			this.photoPreview.reset();
		}

		this.submitted = false;
	}
}
