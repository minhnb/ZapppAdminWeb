import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ZapppConstant } from './zapppConstant';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate() {
        if (localStorage.getItem(ZapppConstant.ACCESS_TOKEN)) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
