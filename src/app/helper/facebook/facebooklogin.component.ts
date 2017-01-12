import { ZapppBaseComponent } from '../../zappp/baseComponent/base.component';

import { Component, Injector, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AppConfig } from '../../app.config';
import { UserService } from '../../services/user';


declare const FB: any;

@Component({
    selector: 'facebook-login',
    templateUrl: 'facebooklogin.html',
    providers: [UserService]
})

export class FacebookLoginComponent extends ZapppBaseComponent implements OnInit {

    constructor(private injector: Injector, private userService: UserService) {
        super(injector);
        FB.init({
            appId: AppConfig.FB_APP_ID,
            cookie: false,  // enable cookies to allow the server to access
			// the session
            xfbml: true,  // parse social plugins on this page
            version: 'v2.5' // use graph api version 2.5
        });
    }

    onFacebookLoginClick() {
        var self = this;
        var fbLogin, accessToken;
        FB.getLoginStatus(function(res) {
            fbLogin = res;

            if (fbLogin.status === 'connected') {
                console.log('connected');
                accessToken = fbLogin.authResponse.accessToken;
                console.log(JSON.stringify(accessToken));
                // self.context.popupNotification('accessToken', accessToken);
                self.zapppFacebookLogin(accessToken);
            }
            else {
                console.log('not_authorized');
                FB.login(function(res) {
                    fbLogin = res;
                    if (fbLogin.status === 'connected') {
                        console.log('connected');
                        console.log(fbLogin);
                        accessToken = fbLogin.authResponse.accessToken;
                        // console.log(JSON.stringify(accessToken));
                        // self.context.popupNotification('accessToken', accessToken);
                        self.zapppFacebookLogin(accessToken);
                    } else {
                        console.log('not_authorized');
                    }
                }, function(error) {
                    console.log(JSON.stringify(error));
                    // self.context.popupNotification('Error', JSON.stringify(error));
                }, { scope: 'email, public_profile' });
            }
        }, function(error) {
            console.log(JSON.stringify(error));
            // self.context.popupNotification('Error', JSON.stringify(error));
        });
    }

    zapppFacebookLogin(accessToken: string) {
        this.userService.facebookLogin(accessToken).subscribe(
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
