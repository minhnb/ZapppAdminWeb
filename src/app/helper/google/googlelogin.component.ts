import { ZapppBaseComponent } from '../../zappp/baseComponent/base.component';

import { Component, Injector, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AppConfig } from '../../app.config';
import { UserService } from '../../services/user';


declare const gapi: any;

@Component({
    selector: 'google-login',
    templateUrl: 'googlelogin.html',
    providers: [UserService]
})

export class GoogleLoginComponent extends ZapppBaseComponent implements OnInit {

    private googleAuth: any;

    constructor(private injector: Injector, private userService: UserService) {
        super(injector);
        let self = this;
        gapi.load('auth2', function() {
            gapi.auth2.init({
                client_id: AppConfig.GOOGLE_APP_CLIENT_ID,
                fetch_basic_profile: true
            });
            self.googleAuth = gapi.auth2.getAuthInstance();
        });
    }

    getAccessTokenFromGoogleUser(googleUser: any): string {
        let googleAuthResponse = googleUser.getAuthResponse();
        let accessToken = googleAuthResponse.id_token;
        return accessToken;
    }

	onGooglePlusLoginClick() {
        let self = this;
        let gapiLogin, accessToken;
        let isSignedIn = self.googleAuth.isSignedIn.get();
        if (isSignedIn) {
            console.log('connected');
            let googleUser = self.googleAuth.currentUser.get();
            accessToken = self.getAccessTokenFromGoogleUser(googleUser);
            self.zapppGooglePlusLogin(accessToken);
        } else {
            console.log('not_authorized');
            self.googleAuth.signIn().then(function(googleUser) {
                accessToken = self.getAccessTokenFromGoogleUser(googleUser);
                self.zapppGooglePlusLogin(accessToken);
            }, function(error) {
                console.log('not_authorized');
                console.log(error);
            });
        }
	}

	zapppGooglePlusLogin(accessToken: string) {
		this.userService.googleLogin(accessToken).subscribe(
			res => {
				console.log(res);
				this.zapppAlert.showInfo('Login successfully');
			},
			error => {
				this.zapppAlert.showError(error.message);
			});
	};

	ngOnInit() {

	}
}
