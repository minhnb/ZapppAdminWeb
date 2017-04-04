import { Component, Injector, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
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
	public name: AbstractControl;
	public email: AbstractControl;
	public username: AbstractControl;
	public password: AbstractControl;
	public repeatPassword: AbstractControl;
	public passwords: FormGroup;
	public idNumber: AbstractControl;
	public gender: AbstractControl;
	public country: AbstractControl;
	public homeAddress: AbstractControl;
	public swiftCode: AbstractControl;
	public accountNumber: AbstractControl;

	public checkPhoneNumberForm: FormGroup;
	public phoneNumber: AbstractControl;
	public phoneNumberCountryCode: AbstractControl;

	public senderLoginForm: FormGroup;
	public senderPassword: AbstractControl;

	hasUserInfo: boolean = false;
	public registerFormStepCount: number = 1;

	@ViewChild('inputPhoneNumber') inputPhoneNumber: ElementRef;
	@ViewChild('inputSenderPassword') inputSenderPassword: ElementRef;
	@ViewChild('inputName') inputName: ElementRef;
	@ViewChild('inputUsername') inputUsername: ElementRef;
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
	signUpErrorCode: string = '';
	ERROR_CODE: any = {
		EMAIL_EXISTED: "EmailExisted",
		ID_EXISTED: "IdExisted",
		PHONE_NUMBER_EXISTED: "PhoneNumberExisted",
		USERNAME_EXISTED: "UsernameExisted"
	}

	constructor(private injector: Injector, private userService: UserService, private formBuilder: FormBuilder) {
        super(injector);

		this.formatDateTime = ZapppConstant.FORMAT_DATE;
		this.initCheckPhoneNumberForm();
		this.initSenderLoginForm();
		this.initRegisterForm();
	}

	ngAfterViewInit() {
		// this.setFocusInput(this.inputPhoneNumber);
	}

	checkPhoneNumber(): void {
		if (this.checkPhoneNumberForm.valid) {
			let phoneNumber = this.phoneNumber.value;
			let countryCode = this.phoneNumberCountryCode.value;
			this.userService.checkAccountByPhoneNumber(phoneNumber, countryCode).subscribe(
				res => {
					if (res.is_deliverer) {
						this.zapppAlert.showError(this.translate.instant('SYNC.STR_SERVER_ERR_PHONE_NUMBER_IS_IN_USE'));
					} else {
						if (res.account_existed && res.user_roles && res.user_roles.indexOf(ZapppConstant.USER_ROLE.SENDER) > -1) {
							this.zapppAlert.showInfo(this.translate.instant('SYNC.STR_SERVER_MSG_PHONE_NUMBER_REGISTERED_WITH_SENDER_APP'))
								.then(result => {
									this.showSenderLoginForm();
								})
								.catch(err => {
									this.showSenderLoginForm();
								});
						} else {
							this.showRegisterForm();
						}
					}
				},
				error => {
					this.zapppAlert.showError(error.message);
				});
		}
	}

	senderLogin() {
		if (this.senderLoginForm.valid) {
			let phoneNumber = this.phoneNumber.value;
			let countryCode = this.phoneNumberCountryCode.value;
			let password = this.senderPassword.value;

			this.userService.pureLogIn(phoneNumber, password, countryCode).subscribe(
				res => {
					this.hasUserInfo = true;
					this.showRegisterForm();
					this.preFillRegisterForm(res.user);
				},
				error => {
					this.zapppAlert.showError(error.message);
				});
		}
	}

	public signUp(): void {
		this.submitted = true;
		if (!this.form.valid) {
            return;
		}
		if (!this.avatarBase64 || !this.birthdayDay || !this.availableTransportationHasCheck()) {
			return;
		}
		let username = this.username.value;
		let citizenId = this.idNumber.value;
		let gender = this.gender.value;
		let birthday = moment(this.birthdayDay).format('YYYY/MM/DD');
		let phoneNumber = this.phoneNumber.value;
		let phoneNumberCountryCode = this.phoneNumberCountryCode.value;
		let country = this.country.value;
		let homeAddress = this.homeAddress.value;
		let vehicles = this.getAvailableTransportation();
		let swiftCode = this.swiftCode.value;
		let bankAccountNumber = this.accountNumber.value;
		let user: any = {
			username: username,
			birthday: birthday,
			citizen_id: citizenId,
			gender: gender,
			phone_number: phoneNumber,
			phone_number_country_code: phoneNumberCountryCode,
			country: country,
			home_address: homeAddress,
			vehicles: vehicles,
			swift_code: swiftCode,
			bank_account_number: bankAccountNumber
		};
		if (!this.hasUserInfo) {
			let name = this.name.value;
			let email = this.email.value;
			let password = this.password.value;
			let avatarBase64 = this.getAvatarBase64();

			user.name = name;
			user.email = email;
			user.password = password;
			user.avatar_base64 = avatarBase64;
		} else {
			user.current_user = true;
			user.password = this.senderPassword.value;
			let avatarBase64 = this.avatarBase64;
			if (this.photoPreview.pictureChanged) {
				user.avatar_base64 = this.getAvatarBase64();
			}
		}

		this.userService.delivererSignUp(user).subscribe(
			res => {
				this.afterRegisterAction();
			},
			error => {
				if (error.code) {
					this.signUpErrorCode = error.code;
				}
				let inlineErrorArray = [this.ERROR_CODE.EMAIL_EXISTED, this.ERROR_CODE.ID_EXISTED, this.ERROR_CODE.USERNAME_EXISTED];
				if (inlineErrorArray.indexOf(error.code) == -1) {
					this.zapppAlert.showError(error.message);
				}
			});
	}

	afterRegisterAction() {
		this.zapppAlert.showInfo(this.translate.instant('SIGN_UP.SIGN_UP_SUCCESSFULLY'))
			.then(result => {
				this.showCheckPhoneNumberForm();
			})
			.catch(err => {
				this.showCheckPhoneNumberForm();
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

	getAvatarBase64(): string {
		let base64String = this.avatarBase64.split(';base64,');
		if (base64String.length == 2) {
			return base64String[1];
		}
		return '';
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
		let formBuilderGroup: any = {
			'name': ['', Validators.compose([Validators.required])],
			'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
			'username': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern(ZapppConstant.PATTERN.VALID_USERNAME)])],
			'idNumber': ['', Validators.compose([Validators.required])],
			'gender': ['', Validators.compose([Validators.required])],
			'country': ['', Validators.compose([Validators.required])],
			'homeAddress': ['', Validators.compose([Validators.required])],
			'swiftCode': ['', Validators.compose([Validators.required])],
			'accountNumber': ['', Validators.compose([Validators.required])],
		};
		if (!this.hasUserInfo) {
			formBuilderGroup.passwords = this.formBuilder.group({
				'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
				'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
			}, { validator: EqualPasswordsValidator.validate('password', 'repeatPassword') });
		}

		this.form = this.formBuilder.group(formBuilderGroup);

		this.name = this.form.controls['name'];
		this.username = this.form.controls['username'];
		this.email = this.form.controls['email'];
		this.idNumber = this.form.controls['idNumber'];
		this.gender = this.form.controls['gender'];
		this.country = this.form.controls['country'];
		this.homeAddress = this.form.controls['homeAddress'];
		this.swiftCode = this.form.controls['swiftCode'];
		this.accountNumber = this.form.controls['accountNumber'];

		if (!this.hasUserInfo) {
			this.passwords = <FormGroup>this.form.controls['passwords'];
			this.password = this.passwords.controls['password'];
			this.repeatPassword = this.passwords.controls['repeatPassword'];
		}

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

	initCheckPhoneNumberForm() {
		this.checkPhoneNumberForm = this.formBuilder.group({
			'phoneNumber': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(6)])],
			'phoneNumberCountryCode': ['']
		});

		this.phoneNumber = this.checkPhoneNumberForm.controls['phoneNumber'];
		this.phoneNumberCountryCode = this.checkPhoneNumberForm.controls['phoneNumberCountryCode'];
		this.phoneNumberCountryCode.setValue("HK");
	}

	initSenderLoginForm() {
		this.senderLoginForm = this.formBuilder.group({
			'senderPassword': ['', Validators.compose([Validators.required])],
		});

		this.senderPassword = this.senderLoginForm.controls['senderPassword'];
	}

	showCheckPhoneNumberForm(event?) {
		this.registerFormStepCount = 1;
		this.signUpErrorCode = '';
		if (this.hasUserInfo) {
			this.hasUserInfo = false;
			this.name.enable();
			this.email.enable();
		}
		this.initCheckPhoneNumberForm();
		// this.setFocusInput(this.inputPhoneNumber);
		if (event) {
			event.preventDefault();
		}
	}

	showSenderLoginForm(event?) {
		this.registerFormStepCount = 2;
		this.initSenderLoginForm();
		this.setFocusInput(this.inputSenderPassword);
		if (event) {
			event.preventDefault();
		}
	}

	showRegisterForm(event?) {
		this.registerFormStepCount = 3;
		this.initRegisterForm();
		this.setFocusInput(this.inputName);
		if (event) {
			event.preventDefault();
		}
	}

	preFillRegisterForm(user) {
		this.name.setValue(user.name);
		if (user.email_profile) {
			this.email.setValue(user.email_profile.email);
		}
		if (user.avatar && user.avatar.url) {
			this.avatarBase64 = user.avatar.url;
		}
		this.name.disable();
		this.email.disable();
		this.setFocusInput(this.inputUsername);
	}
}
