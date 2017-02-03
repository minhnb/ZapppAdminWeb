import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { BaThemeSpinner } from '../theme/services';
import { ZapppConstant } from '../helper/zapppConstant';
import { AppConfig } from '../app.config';

@Injectable()
export class ZapppHttp {
    constructor(private http: Http, private _spinner: BaThemeSpinner) { }

    private getRequestOptionsByToken(method: RequestMethod, accessToken: string): RequestOptions {
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
        return options;
    }

    private getRequestOptions(method: RequestMethod): RequestOptions {
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
        options.method = method;
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
        return this.http.request(url, options)
			.map(this.extractData.bind(this))
			.catch(this.handleError.bind(this));
    }

    extractData(res: Response) {
        this._spinner.hide();
        console.log(res.json() || {});
		return res.json() || {};
    }

    handleError(error: Response | any) {
        this._spinner.hide();
		let errMsg: any;
		if (error instanceof Response) {
			errMsg = error.json();
            // errMsg.message = errMsg.details;
		} else {
			errMsg = error.message ? error.message : error.toString();
		}
		console.error(errMsg);
		return Observable.throw(errMsg);
    }

    refreshToken(): Observable<any> {
        let refreshToken = localStorage.getItem(ZapppConstant.REFRESH_TOKEN);
        let method = RequestMethod.Post;
        let options = this.getRequestOptionsByToken(method, refreshToken);
        options.method = method;
        let url = AppConfig.API_URL + 'auth/refresh';
        options.body = JSON.stringify({});
        this._spinner.show();
        return this.http.request(url, options)
            .map(this.afterRefreshToken.bind(this))
            .catch(this.handleErrorRefreshToken.bind(this));
    }

    afterRefreshToken(res: Response) {

    }

    handleErrorRefreshToken(error: Response | any) {

    }

}
