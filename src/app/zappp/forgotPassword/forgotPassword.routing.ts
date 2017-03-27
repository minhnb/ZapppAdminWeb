import { Routes, RouterModule }  from '@angular/router';

import { ForgotPassword } from './forgotPassword.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
	{
		path: '',
		component: ForgotPassword
	}
];

export const routing = RouterModule.forChild(routes);
