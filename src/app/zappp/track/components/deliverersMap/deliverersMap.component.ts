import { Component, ElementRef, ViewEncapsulation, Injector, OnDestroy, HostListener } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppUtil } from '../../../../helper/zapppUtil';
import { ZapppConstant } from '../../../../helper/zapppConstant';
import { GoogleMapsLoader } from '../../../googleMaps.loader';

@Component({
	selector: 'deliverers-map',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./deliverersMap.scss')],
	template: require('./deliverersMap.html'),
	providers: [DeliveryService]
})

export class DeliverersMap extends ZapppBaseComponent implements OnDestroy {

	map: any;
	googleMapsElement: any;
	markers: Array<any>;
	google: any;
	lat: number;
	long: number;
	updateMapTimer: any;

	listDisplayDeliverer: any[];
	searchKey: string;
	lastSearchKey: string;
	showSearchResult: Boolean;
	showCenterMarker: Boolean;
	selectedDeliverer: any;
	delivererIndex: number;
	updateSelectedDelivererLocationTimer: any;
	alertWhenNotFoundLocation: Boolean;

	@HostListener('document:click', ['$event'])
	clickout(event) {
		let searchResultElement = this._elementRef.nativeElement.querySelector('.search-result');
		if (searchResultElement.contains(event.target)) {

		} else {
			this.showSearchResult = false;
		}
	}

	constructor(private injector: Injector, private deliveryService: DeliveryService, private _elementRef: ElementRef) {
		super(injector);
		this.updateMapTimer = null;
		this.updateSelectedDelivererLocationTimer = null;
		this.showSearchResult = false;
		this.showCenterMarker = true;
		this.listDisplayDeliverer = [];
	}

	ngAfterViewInit() {
		this.googleMapsElement = this._elementRef.nativeElement.querySelector('.google-maps');
		this.lat = 22.28552;
		this.long = 114.15769;
		this.markers = [];

		let self = this;

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				self.lat = position.coords.latitude;
				self.long = position.coords.longitude;

				self.createDeliverersMap(self.lat, self.long);
			}, function(error) {
				console.log(error);
				self.createDeliverersMap(self.lat, self.long);
			});
        } else {
			console.log("Browser doesn't support Geolocation");
        }
	}

	ngOnDestroy() {
		this.clearAllTimer();
	}

	createDeliverersMap(latitude: number, longitude: number) {
		this.initMap(latitude, longitude);
		this.autoUpdateDeliverersMap(latitude, longitude);
	}

	initMap(latitude: number, longitude: number) {
		let self = this;
		GoogleMapsLoader.load((google) => {
			self.google = google;
			self.map = new google.maps.Map(self.googleMapsElement, {
				center: new google.maps.LatLng(latitude, longitude),
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			self.createCurrentMarker(latitude, longitude);

			google.maps.event.addListener(self.map, 'dragend', function() {
				self.reloadMapAfterCenterPointChanged();
			});

			google.maps.event.addListener(self.map, 'zoom_changed', function() {
				self.reloadMapAfterCenterPointChanged();
			});
		});
	}

	reloadMapAfterCenterPointChanged() {
		if (!this.showCenterMarker) {
			return;
		}
		let center = this.map.getCenter();
		let lat = center.lat();
		let long = center.lng();

		if (this.lat == lat && this.long == long) {
			return;
		}
		this.clearAllTimer();
		this.autoUpdateDeliverersMap(lat, long);

		this.lat = lat;
		this.long = long;
	}

	loadListDelivererNearBy(latitude: number, longitude: number) {
		let maxDistance = 10000;
		this.deliveryService.listDelivererNearBy(latitude, longitude, maxDistance).subscribe(
			res => {
				this.removeAllDelivererMarkers();
				res.forEach(deliverer => {
					let latitude = deliverer.location.lat;
					let longitude = deliverer.location.long;
					let title = deliverer.deliverer.name;
					this.createDelivererMarker(latitude, longitude, title);
				});
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	createMarker(latitude: number, longitude: number, markerImage: any, title: string): any {
		var markerParams = {
			position: new this.google.maps.LatLng(latitude, longitude),
			title: title,
			icon: markerImage,
			size: new this.google.maps.Size(71, 71),
			optimized: false,
			map: this.map
		};

		let marker = new this.google.maps.Marker(markerParams);
		return marker;
	}

	createCurrentMarker(latitude: number, longitude: number) {
		this.googleMapsElement.insertAdjacentHTML('beforeend', '<div class="center-marker"></div>');
	}

	createDelivererMarker(latitude: number, longitude: number, title: string) {
		let markerImage = {
			path: this.google.maps.SymbolPath.CIRCLE,
			strokeColor: '#186A3B',
            scale: 8
		};
		let marker = this.createMarker(latitude, longitude, markerImage, title);
		this.markers.push(marker);
	}

	removeAllDelivererMarkers() {
		this.markers.forEach(marker => {
			marker.setMap(null);
		})
		this.markers = [];
	}

	autoUpdateDeliverersMap(latitude: number, longitude: number) {
		this.loadListDelivererNearBy(latitude, longitude);
		this.updateMapTimer = setTimeout(() => {
			this.autoUpdateDeliverersMap(latitude, longitude);
		}, 60000);
	}

	clearUpdateMapsTimer() {
		if (this.updateMapTimer) {
			clearTimeout(this.updateMapTimer);
			this.updateMapTimer = null;
		}
	}

	clearAllTimer() {
		this.clearUpdateMapsTimer();
		this.clearUpdateSelectedDelivererLocationTimer();
	}

	autoUpdateSelectedDelivererLocation() {
		this.getSelectedDelivererLocation();
		this.updateSelectedDelivererLocationTimer = setTimeout(() => {
			this.autoUpdateSelectedDelivererLocation();
		}, 60000);
	}

	clearUpdateSelectedDelivererLocationTimer() {
		if (this.updateSelectedDelivererLocationTimer) {
			clearTimeout(this.updateSelectedDelivererLocationTimer);
			this.updateSelectedDelivererLocationTimer = null;
		}
	}

	getNextDelivererIndex(keyCode: number): number {
		let delivererIndex = this.delivererIndex;
		let defaultDelivererIndex = 0;
		let step = 1;
		let mod = this.listDisplayDeliverer.length;

		switch (keyCode) {
			case ZapppConstant.KEYCODE.UP:
				defaultDelivererIndex = mod - 1;
				step = -1;
				break;
			case ZapppConstant.KEYCODE.DOWN:
				break;
		}

		if (delivererIndex == -1) {
			delivererIndex = defaultDelivererIndex;
		} else {
			delivererIndex += step + mod;
			delivererIndex = delivererIndex % mod;
		}
		return delivererIndex;
	}

	selectNextDeliverer(keyCode: number) {
		if (this.showSearchResult && this.listDisplayDeliverer.length) {
			if (this.delivererIndex > -1 && this.delivererIndex < this.listDisplayDeliverer.length) {
				let deliverer = this.listDisplayDeliverer[this.delivererIndex];
				deliverer.selected = false;
			}
			let delivererIndex = this.getNextDelivererIndex(keyCode);
			let deliverer = this.listDisplayDeliverer[delivererIndex];
			deliverer.selected = true;
			this.delivererIndex = delivererIndex;
		}
	}

	selectDeliverer() {
		if (this.showSearchResult && this.listDisplayDeliverer.length) {
			if (this.delivererIndex > -1 && this.delivererIndex < this.listDisplayDeliverer.length) {
				let deliverer = this.listDisplayDeliverer[this.delivererIndex];
				this.updateSelectedDelivererLocation(deliverer);
			}
		}
	}

	inputSearchOnKeyDown(event) {
		switch (event.keyCode) {
			case ZapppConstant.KEYCODE.UP:
				this.selectNextDeliverer(event.keyCode);
				event.preventDefault();
				break;
			case ZapppConstant.KEYCODE.DOWN:
				this.selectNextDeliverer(event.keyCode);
				event.preventDefault();
				break;
			case ZapppConstant.KEYCODE.ENTER:
				this.selectDeliverer();
				break;
			default:
		}
	}

	inputSearchOnKeyUp(event) {
		if (event.keyCode == ZapppConstant.KEYCODE.ENTER) {
			return;
		}
		this.searchDeliverer();
	}

	searchDeliverer() {
		let keyword = ZapppUtil.trimText(this.searchKey);
		if (!keyword) {
			this.showSearchResult = false;
			this.lastSearchKey = "";
			return;
		}
		if (keyword == this.lastSearchKey) {
			return;
		}
		this.lastSearchKey = keyword;
		this.deliveryService.searchDeliverer(keyword).subscribe(
			res => {
				this.listDisplayDeliverer = res.map(deliverer => {
					return this.transformDeliverer(deliverer);
				});
				this.showSearchResult = true;
				this.delivererIndex = -1;
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	transformDeliverer(deliverer: any): any {
		if (!deliverer.deliverer) {
			return null;
		}
		let transformedDeliverer: any = {};
		transformedDeliverer.id = deliverer.deliverer.id;
		transformedDeliverer.name = deliverer.deliverer.name || '';
		transformedDeliverer.phone = deliverer.deliverer.phone_profile.number;
		transformedDeliverer.location = deliverer.location;
		transformedDeliverer.selected = false;
		return transformedDeliverer;
	}

	updateSelectedDelivererLocation(deliverer: any) {
		this.selectedDeliverer = deliverer;
		this.showCenterMarker = false;
		this.showSearchResult = false;
		this.searchKey = deliverer.name;
		this.clearAllTimer();

		this.alertWhenNotFoundLocation = true;
		this.autoUpdateSelectedDelivererLocation();
	}

	centerDelivererMarker(deliverer: any) {
		let latitude = deliverer.location.lat;
		let longitude = deliverer.location.long;
		let title = deliverer.name;
		this.createDelivererMarker(latitude, longitude, title);
		let point = new this.google.maps.LatLng(latitude, longitude);
		this.map.setCenter(point);
	}

	clearSearch() {
		this.showSearchResult = false;
		this.searchKey = "";
		this.lastSearchKey = "";
		if (!this.showCenterMarker) {
			this.clearAllTimer();
			this.reloadDeliverersMap();
		}
	}

	reloadDeliverersMap() {
		let point = new this.google.maps.LatLng(this.lat, this.long);
		this.map.setCenter(point);
		this.autoUpdateDeliverersMap(this.lat, this.long);
		this.showCenterMarker = true;
	}

	getSelectedDelivererLocation() {
		this.deliveryService.getDelivererLocation(this.selectedDeliverer.id).subscribe(
			res => {
				let deliverer = this.transformDeliverer(res);
				this.removeAllDelivererMarkers();
				if (deliverer.location) {
					this.centerDelivererMarker(deliverer);
				} else {
					if (this.alertWhenNotFoundLocation) {
						this.alertWhenNotFoundLocation = false;
						let message = this.translate.instant('REPORTS.DELIVERERS_MAPS.USER_INVISIBLE');
						this.zapppAlert.showInfo(message);
					}
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}
}
