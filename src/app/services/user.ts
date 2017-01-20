import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ZapppHttp } from './zapppHttp';

import { AppConfig } from '../app.config';
import { ZapppConstant } from '../helper/zapppConstant';

@Injectable()
export class UserService {
	private userUrl = AppConfig.API_URL + 'auth';
	constructor(private zapppHttp: ZapppHttp) { }

	saveUserToLocalStorage(user: any) {

	}

	saveUserAccessTokenToLocalStorage(data: any, role: string) {
		let expiredAt = data.expired_at;
		localStorage.setItem(ZapppConstant.ACCESS_TOKEN, data.access_token);
		localStorage.setItem(ZapppConstant.REFRESH_TOKEN, data.refresh_token);
		localStorage.setItem(ZapppConstant.EXPIRED_AT, data.expired_at);
		localStorage.setItem(ZapppConstant.ROLE, role);
	}

	clearLocalStorage() {
		localStorage.clear();
	}

	handleLoginSuccess(data: any): any {
		this.saveUserAccessTokenToLocalStorage(data, 'user');
		return data;
	}

	handleAdminLoginSuccess(data: any): any {
		this.saveUserAccessTokenToLocalStorage(data, 'admin');
		return data;
	}

	handleLogout(data: any): any {
		this.clearLocalStorage();
		return data;
	}

	logIn(email: string, password: string): Observable<any> {
		let user = {
			email: email,
			username: email,
			password: password
		};
		return this.zapppHttp.post(this.userUrl + '/login_email', user)
			.map(this.handleAdminLoginSuccess.bind(this));
	}

	signUp(user: Object): Observable<any> {
        return this.zapppHttp.post(this.userUrl + '/signup', user);
	}

	getPinCode(phoneNumber: string, countryCode: string): Observable<any> {
		let phoneRequest = {
			phone_number: phoneNumber,
			country: countryCode,
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
}
