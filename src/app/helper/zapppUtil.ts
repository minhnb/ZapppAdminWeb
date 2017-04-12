import { ZapppConstant } from './zapppConstant';

export class ZapppUtil {
    static trimText(s: string): string {
        if (s) {
            return s.trim().replace(/\s+/g, ' ');
        }
        return s;
    }

    static buildQueryParams(search: any, sortBy?: any, paging?: Boolean, limit?: number, offset?: number): any {
        if (!search) {
			search = {};
		}
		let params = Object.assign({}, search);
		if (sortBy) {
			params.sort_by = sortBy;
		}
		if (paging) {
			params.paging = true;
			params.limit = limit;
			params.offset = offset;
		}
        return params;
    }

    static isAdmin() {
        let role = localStorage.getItem(ZapppConstant.ROLE);
        return role == 'admin';
    }
}
