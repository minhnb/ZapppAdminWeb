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
        if (role) {
            role = role.toLowerCase();
            return role == ZapppConstant.USER_ROLE.ADMIN.toLowerCase();
        }
        return false;
    }

    static userHasRole(userRoles: Array<any>, comparedRole: string) {
        let role = comparedRole.toLowerCase();
        let listRoles = [];
        userRoles.forEach(userRole => {
            if (userRole.approved) {
                listRoles.push(userRole.name.toLowerCase());
            }
        });
        return listRoles.indexOf(role) > -1;
    }

    static isValidUserRole(userRoles: Array<any>) {
        let role = localStorage.getItem(ZapppConstant.ROLE).toLowerCase();
        return ZapppUtil.userHasRole(userRoles, role);
    }

    static formatNumber(number: number, decimalLength: number = 0, sectionLength: number = 3): string {
        var re = '\\d(?=(\\d{' + (sectionLength || 3) + '})+' + (decimalLength > 0 ? '\\.' : '$') + ')';
        return number.toFixed(Math.max(0, ~~decimalLength)).replace(new RegExp(re, 'g'), '$&,');
    };
}
