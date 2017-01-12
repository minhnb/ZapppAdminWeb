export const PAGES_MENU = [
	{
		path: '',
		children: [
			{
				path: 'dashboard',
				data: {
					menu: {
						title: 'Dashboard',
						icon: 'ion-android-home',
						selected: false,
						expanded: false,
						order: 0
					}
				}
			},
			{
				path: 'tables',
				data: {
					menu: {
						title: 'Tables',
						icon: 'ion-grid',
						selected: false,
						expanded: false,
						order: 500,
					}
				},
				children: [
					{
						path: 'basictables',
						data: {
							menu: {
								title: 'Basic Tables',
							}
						}
					},
					{
						path: 'smarttables',
						data: {
							menu: {
								title: 'Smart Tables',
							}
						}
					}
				]
			},
			{
				path: 'maps',
				data: {
					menu: {
						title: 'Maps',
						icon: 'ion-ios-location-outline',
						selected: false,
						expanded: false,
						order: 600,
					}
				},
				children: [
					{
						path: 'googlemaps',
						data: {
							menu: {
								title: 'Google Maps',
							}
						}
					},
					{
						path: 'leafletmaps',
						data: {
							menu: {
								title: 'Leaflet Maps',
							}
						}
					},
					{
						path: 'bubblemaps',
						data: {
							menu: {
								title: 'Bubble Maps',
							}
						}
					},
					{
						path: 'linemaps',
						data: {
							menu: {
								title: 'Line Maps',
							}
						}
					}
				]
			}
		]
	}
];
