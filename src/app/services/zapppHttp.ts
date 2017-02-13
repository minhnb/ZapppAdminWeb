import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Headers, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';
import { BaThemeSpinner } from '../theme/services';
import { ZapppConstant } from '../helper/zapppConstant';
import { AppConfig } from '../app.config';

@Injectable()
export class ZapppHttp {
    constructor(private http: Http, private _spinner: BaThemeSpinner, private router: Router) { }

    private getRequestOptionsByToken(method: string | RequestMethod, accessToken: string): RequestOptions {
        let jwt = 'JWT ' + accessToken;
        let headerParams = {
            "jsonerror": "true",
            "Authorization": jwt
        };
        if (method != RequestMethod.Get) {
            headerParams['Content-Type'] = 'application/json';
        }
        let headers = new Headers(headerParams);
        let options = new RequestOptions({ headers: headers });
        options.method = method;
        return options;
    }

    private getRequestOptions(method: string | RequestMethod): RequestOptions {
        let accessToken = localStorage.getItem(ZapppConstant.ACCESS_TOKEN);
        return this.getRequestOptionsByToken(method, accessToken);
    }

    get(url: string, params?: Object): Observable<any> {
        return this.request(RequestMethod.Get, url, null, params);
    }

    post(url: string, data: Object, params?: Object): Observable<any> {
        return this.request(RequestMethod.Post, url, data, params);
    }

    put(url: string, data: Object, params?: Object): Observable<any> {
        return this.request(RequestMethod.Put, url, data, params);
    }

    delete(url: string, data: Object, params?: Object): Observable<any> {
        return this.request(RequestMethod.Delete, url, data, params);
    }

    request(method: RequestMethod, url: string, data?: Object, params?: Object): Observable<any> {
        let options = this.getRequestOptions(method);
        if (method != RequestMethod.Get) {
            options.body = JSON.stringify(data);
        }
        if (params) {
            let search: URLSearchParams = new URLSearchParams();
            for (let key in params) {
                search.set(key.toString(), params[key]);
            }
            options.search = search;
        }
        this._spinner.show();
        let self = this;
        return this.http.request(url, options)
			.map(this.extractData.bind(this))
			.catch((err: any) => {
                return self.handleError(err, url, options);
            });
    }

    extractData(res: Response) {
        this._spinner.hide();
        let response = res.json() || {};
        console.log(response);
		return response;
    }

    handleError(error: Response | any, url: string, options: RequestOptions) {
		let errMsg = this.jsonError(error);
        if (errMsg.status == 401) {
            return this.refreshToken(url, options);
        }
        this._spinner.hide();
		return Observable.throw(errMsg);
    }

    jsonError(error: Response | any): any {
        let errMsg: any;
		if (error instanceof Response) {
			errMsg = error.json();
		} else {
			errMsg = error.message ? error.message : error.toString();
		}
		console.error(errMsg);
        return errMsg;
    }

    refreshToken(url: string, options: RequestOptions) {
        let refreshToken = localStorage.getItem(ZapppConstant.REFRESH_TOKEN);
        let method = RequestMethod.Post;
        let refreshTokenOptions = this.getRequestOptionsByToken(method, refreshToken);
        refreshTokenOptions.method = method;
        let refreshTokenUrl = AppConfig.API_URL + 'auth/refresh';
        refreshTokenOptions.body = JSON.stringify({});
        this._spinner.show();
        let self = this;
        return this.http.request(refreshTokenUrl, refreshTokenOptions)
            .toPromise()
            .then((res: Response) => {
                return self.afterRefreshToken(res, url, options);
            })
            .catch(this.handleErrorRefreshToken.bind(this));
    }

    afterRefreshToken(res: Response, url: string, options: RequestOptions) {
        let response = res.json() || {};

		localStorage.setItem(ZapppConstant.ACCESS_TOKEN, response.access_token);
		localStorage.setItem(ZapppConstant.EXPIRED_AT, response.expired_at);

        let newOptions = this.getRequestOptions(options.method);
        newOptions.search = options.search;

        return this.http.request(url, newOptions)
            .toPromise()
			.then(this.extractData.bind(this))
			.catch(this.handleErrorRefreshToken.bind(this));
    }

    handleErrorRefreshToken(error: Response | any) {
        let errMsg = this.jsonError(error);
        this._spinner.hide();
        let role = localStorage.getItem(ZapppConstant.ROLE);
        localStorage.clear();
        if (role == 'admin') {
            this.router.navigate(['admin/login']);
        } else {
            this.router.navigate(['/login']);
        }
        return Promise.reject(errMsg);
    }
}
