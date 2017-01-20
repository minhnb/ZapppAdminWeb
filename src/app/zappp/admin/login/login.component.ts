import { ZapppBaseComponent } from '../../baseComponent/base.component';

import { Component, Injector, ViewEncapsulation, ViewContainerRef, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator } from '../../../theme/validators';
import { UserService } from '../../../services/user';
import { ZapppConstant } from '../../../helper/zapppConstant';

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

	@ViewChild('inputEmail') inputEmail: ElementRef;

	constructor(private injector: Injector, private userService: UserService, fb: FormBuilder) {
		super(injector);
		this.prepareLoginByEmailForm(fb);
	}

	ngAfterViewInit() {
		this.setFocusInput(this.inputEmail);
	}

	prepareLoginByEmailForm(fb: FormBuilder) {
		this.form = fb.group({
			'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
			'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
		});

		this.email = this.form.controls['email'];
		this.password = this.form.controls['password'];
	}


	public onSubmit(values: Object): void {
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
}
