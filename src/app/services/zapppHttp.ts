import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { BaThemeSpinner } from '../theme/services';
import { ZapppConstant } from '../helper/zapppConstant';

@Injectable()
export class ZapppHttp {
    constructor(private http: Http, private _spinner: BaThemeSpinner) { }

    private getRequestOptions(): RequestOptions {
        let accessToken = localStorage.getItem(ZapppConstant.ACCESS_TOKEN);
        let jwt = 'JWT ' + accessToken;
        let headers = new Headers({
            'Content-Type': 'application/json',
            "jsonerror": "true",
            "Authorization": jwt
        });
        let options = new RequestOptions({ headers: headers });
        return options;
    }

    get(url: string): Observable<any> {
        return this.request(RequestMethod.Get, url);
    }

    post(url: string, data: Object): Observable<any> {
        return this.request(RequestMethod.Post, url, data);
    }

    put(url: string, data: Object): Observable<any> {
        return this.request(RequestMethod.Put, url, data);
    }

    delete(url: string, data: Object): Observable<any> {
        return this.request(RequestMethod.Delete, url, data);
    }

    request(method: RequestMethod, url: string, data?: Object): Observable<any> {
        let options = this.getRequestOptions();
        options.method = method;
        if (method != RequestMethod.Get) {
            options.body = JSON.stringify(data);
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


}
