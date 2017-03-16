export const PAGES_MENU = [
	{
		path: '',
		children: [
			{
				path: 'dashboard',
				data: {
					menu: {
						title: 'MENU.DASHBOARD',
						icon: 'ion-android-home',
						selected: false,
						expanded: false,
						order: 0
					}
				},
				roles: ['all']
			},
			{
				path: 'reports/deliverer-accounts',
				data: {
					menu: {
						title: 'MENU.DELIVERER_ACCOUNTS',
						icon: 'ion-grid',
						selected: false,
						expanded: false,
						order: 1,
					}
				},
				roles: ['admin']
			},
			{
				path: 'reports/delivery-requests',
				data: {
					menu: {
						title: 'MENU.DELIVERY_REQUESTS',
						icon: 'ion-grid',
						selected: false,
						expanded: false,
						order: 1,
					}
				},
				roles: ['admin']
			},
			{
				path: 'track',
				data: {
					menu: {
						title: 'MENU.TRACK',
						icon: 'ion-ios-location-outline',
						selected: false,
						expanded: false,
						order: 2
					}
				},
				roles: ['admin']
			},
			{
				path: 'settings/localization',
				data: {
					menu: {
						title: 'MENU.LOCALIZATION',
						icon: 'ion-gear-b',
						selected: false,
						expanded: false,
						order: 3
					}
				},
				roles: ['admin']
			}
		]
	}
];
