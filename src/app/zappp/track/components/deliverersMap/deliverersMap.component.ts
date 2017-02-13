import { Component, ElementRef, ViewEncapsulation, Injector, OnDestroy } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { GoogleMapsLoader } from './googleMaps.loader';

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

	updateTimer: any;

	constructor(private injector: Injector, private deliveryService: DeliveryService, private _elementRef: ElementRef) {
		super(injector);
		this.updateTimer = null;
	}

	ngAfterViewInit() {
		this.googleMapsElement = this._elementRef.nativeElement.querySelector('.google-maps');
		let latitude = 22.28552;
		let longitude = 114.15769;
		this.markers = [];

		let self = this;

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;

				self.createDeliverersMap(latitude, longitude);
			}, function() {
				self.createDeliverersMap(latitude, longitude);
			});
        } else {
			console.log("Browser doesn't support Geolocation");
        }
	}

	ngOnDestroy() {
		clearTimeout(this.updateTimer);
	}

	createDeliverersMap(latitude: number, longitude: number) {
		this.initMap(latitude, longitude);
		this.updateDelivererMarker(latitude, longitude);
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
				let center = this.getCenter();
				let lat = center.lat();
				let long = center.lng();
				if (self.updateTimer) {
					clearTimeout(self.updateTimer);
					self.updateTimer = null;
				}
				self.updateDelivererMarker(lat, long);
			});
		});
	}

	loadListDelivererNearBy(latitude: number, longitude: number) {
		let maxDistance = 10000;
		this.deliveryService.listDelivererNearBy(latitude, longitude, maxDistance).subscribe(
			res => {
				this.removeAllDelivererMarkers();
				res.forEach(deliverer => {
					let latitude = deliverer.location.lat;
					let longitude = deliverer.location.long;
					let title = deliverer.user.name;
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

	updateDelivererMarker(latitude: number, longitude: number) {
		this.loadListDelivererNearBy(latitude, longitude);
		this.updateTimer = setTimeout(() => {
			this.updateDelivererMarker(latitude, longitude);
		}, 60000);
	}
}
