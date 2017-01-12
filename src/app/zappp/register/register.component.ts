import { ZapppBaseComponent } from '../baseComponent/base.component';

import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator, EqualPasswordsValidator } from '../../theme/validators';
import { UserService } from '../../services/user';

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
	public password: AbstractControl;
	public repeatPassword: AbstractControl;
	public passwords: FormGroup;

	public submitted: boolean = false;

	constructor(private injector: Injector, private userService: UserService, fb: FormBuilder) {
        super(injector);

		this.form = fb.group({
			'name': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
			'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
			'passwords': fb.group({
				'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
				'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
			}, { validator: EqualPasswordsValidator.validate('password', 'repeatPassword') })
		});

		this.name = this.form.controls['name'];
		this.email = this.form.controls['email'];
		this.passwords = <FormGroup>this.form.controls['passwords'];
		this.password = this.passwords.controls['password'];
		this.repeatPassword = this.passwords.controls['repeatPassword'];
	}

	public onSubmit(values: Object): void {
		this.submitted = true;
		if (this.form.valid) {
            let email = this.email.value;
            let password = this.password.value;
            let name = this.name.value;
            let user = {
                email: email,
                firstName: name,
                password: password
            };
            this.userService.signUp(user).subscribe(
                res => {
                    console.log(res);
                    this.zapppAlert.showInfo('Sign up successfully');
                },
                error => {
                    this.zapppAlert.showError(error.message);
                });
		}
	}
}
