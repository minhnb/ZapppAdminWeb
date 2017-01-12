import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ZapppConstant } from './zapppConstant';

@Injectable()
export class AuthLoggedIn implements CanActivate {

    constructor(private router: Router) { }

    canActivate() {
        if (localStorage.getItem(ZapppConstant.ACCESS_TOKEN)) {
            this.router.navigate(['/dashboard']);
            return false;
        }

        return true;
    }
}
