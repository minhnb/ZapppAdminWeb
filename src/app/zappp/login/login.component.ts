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

	public loginForm: FormGroup;
	public phoneNumber: AbstractControl;
	public countryCode: AbstractControl;
	public password: AbstractControl;

	@ViewChild('inputPhoneNumber') inputPhoneNumber: ElementRef;

	formattedPhoneNumber: string;

	constructor(private injector: Injector, private userService: UserService, fb: FormBuilder) {
		super(injector);
		this.prepareLoginForm(fb);
	}

	ngAfterViewInit() {
		// this.setFocusInput(this.inputPhoneNumber);
	}

	prepareLoginForm(fb: FormBuilder) {
		this.loginForm = fb.group({
			'phoneNumber': ['', Validators.compose([Validators.required, Validators.pattern(ZapppConstant.PATTERN.ONLY_DIGIT), Validators.minLength(6)])],
			'countryCode': ['', Validators.compose([Validators.required])],
			'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
		});

		this.phoneNumber = this.loginForm.controls['phoneNumber'];
		this.countryCode = this.loginForm.controls['countryCode'];
		this.password = this.loginForm.controls['password'];
		this.countryCode.setValue("HK");
	}

	public login(values: Object): void {
		if (this.loginForm.valid) {
			let phoneNumber = this.phoneNumber.value;
			let countryCode = this.countryCode.value;
			let password = this.password.value;
			this.userService.userLogIn(phoneNumber, password, countryCode).subscribe(
				res => {
					if (localStorage.getItem(ZapppConstant.ACCESS_TOKEN)) {
						this.router.navigateByUrl('/dashboard');
					} else {
						this.zapppAlert.showError(this.translate.instant('ERROR.LOGIN.WRONG_USERNAME_OR_PASSWORD'));
					}
				},
				error => {
					this.zapppAlert.showError(error.message);
				});
		}
	}
}
