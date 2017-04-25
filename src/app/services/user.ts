import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ZapppHttp } from './zapppHttp';

import { AppConfig } from '../app.config';
import { ZapppConstant } from '../helper/zapppConstant';
import { ZapppUtil } from '../helper/zapppUtil';

@Injectable()
export class UserService {
	private userUrl = AppConfig.API_URL + 'auth';
	errorWrongUserNameOrPassword: any;

	constructor(private zapppHttp: ZapppHttp) { }

	saveUserToLocalStorage(user: any) {

	}

	saveUserAccessTokenToLocalStorage(data: any, role: string) {
		// let expiredAt = data.expired_at;
		localStorage.setItem(ZapppConstant.ACCESS_TOKEN, data.access_token);
		localStorage.setItem(ZapppConstant.REFRESH_TOKEN, data.refresh_token);
		localStorage.setItem(ZapppConstant.EXPIRED_AT, data.expired_at);
		localStorage.setItem(ZapppConstant.ROLE, role);
	}

	clearLocalStorage() {
		localStorage.clear();
	}

	handleLoginSuccess(data: any): any {
		let role = ZapppConstant.USER_ROLE.SENDER.toLowerCase();
		if (ZapppUtil.userHasRole(data.user.roles, role)) {
			this.saveUserAccessTokenToLocalStorage(data, role);
		}
		return data;
	}

	handleAdminLoginSuccess(data: any): any {
		let role = ZapppConstant.USER_ROLE.ADMIN.toLowerCase();
		if (ZapppUtil.userHasRole(data.user.roles, role)) {
			this.saveUserAccessTokenToLocalStorage(data, role);
		}
		return data;
	}

	handleLogout(data: any): any {
		this.clearLocalStorage();
		return data;
	}

	pureLogIn(loginName: string, password: string, countryCode?: string): Observable<any> {
		let user = {
			login_name: loginName,
			password: password,
			country: countryCode
		};
		return this.zapppHttp.post(this.userUrl + '/login', user);
	}

	userLogIn(loginName: string, password: string, countryCode?: string): Observable<any> {
		return this.pureLogIn(loginName, password, countryCode)
			.map(this.handleLoginSuccess.bind(this));
	}

	adminLogIn(loginName: string, password: string, countryCode?: string): Observable<any> {
		return this.pureLogIn(loginName, password, countryCode)
			.map(this.handleAdminLoginSuccess.bind(this));
	}

	signUp(user: Object): Observable<any> {
        return this.zapppHttp.post(this.userUrl + '/signup', user);
	}

	delivererSignUp(user: Object): Observable<any> {
        return this.zapppHttp.post(this.userUrl + '/deliverer_signup', user);
	}

	getPinCode(phoneNumber: string, countryCode: string, currentUser: boolean = true): Observable<any> {
		let phoneRequest = {
			phone_number: phoneNumber,
			country: countryCode,
			current_user: currentUser
		};
		return this.zapppHttp.post(this.userUrl + '/request_phone_code', phoneRequest);
	}

	logInPhone(phoneNumber: string, code: string): Observable<any> {
		let loginPhone = {
			code: code
		};
		return this.zapppHttp.post(this.userUrl + '/login_phone/' + phoneNumber, loginPhone)
			.map(this.handleLoginSuccess.bind(this));
	}

    logOut(): Observable<any> {
        return this.zapppHttp.post(this.userUrl + '/logout', {})
			.map(this.handleLogout.bind(this))
			.catch(this.handleLogout.bind(this));;
    }

	facebookLogin(accessToken: string): Observable<any> {
		let body = {
			accessToken: accessToken
		};
		return this.zapppHttp.post(this.userUrl + '/facebook', body);
	}

	googleLogin(accessToken: string): Observable<any> {
		let body = {
			accessToken: accessToken
		};
		return this.zapppHttp.post(this.userUrl + '/google', body);
	}

	verifyPhoneNumber(phoneNumber: string, code: string): Observable<any> {
		let body = {
			code: code
		};
		return this.zapppHttp.post(this.userUrl + '/verify_phone_number/' + phoneNumber, body);
	}

	resetPassword(phoneSignature: string, newPassword: string): Observable<any> {
		let body = {
			phone_signature: phoneSignature,
			password: newPassword
		};
		return this.zapppHttp.post(this.userUrl + '/reset_password', body);
	}

	checkAccount(type: string, loginName: string, countryCode?: string): Observable<any> {
		let body = {
			type: type,
			login_name: loginName,
			country: countryCode
		};
		return this.zapppHttp.post(this.userUrl + '/check_account', body);
	}

	checkAccountByPhoneNumber(phoneNumber: string, countryCode: string): Observable<any> {
		let type = "phone_number";
		return this.checkAccount(type, phoneNumber, countryCode);
	}

	getUserInfo(): Observable<any> {
		return this.zapppHttp.get(AppConfig.API_URL + 'me');
	}
}
