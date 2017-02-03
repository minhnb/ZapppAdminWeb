import { Component, ElementRef, Injector } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { GoogleMapsLoader } from './googleMaps.loader';

@Component({
	selector: 'deliverers-map',
	styles: [require('./deliverersMap.scss')],
	template: require('./deliverersMap.html'),
	providers: [DeliveryService]
})

export class DeliverersMap extends ZapppBaseComponent {

	map: any;
	googleMapsElement: any;
	markers: Array<any>;
	google: any;

	constructor(private injector: Injector, private deliveryService: DeliveryService, private _elementRef: ElementRef) {
		super(injector);
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

	createDeliverersMap(latitude: number, longitude: number) {
		this.initMap(latitude, longitude);
		this.updateDelivererMarker(latitude, longitude);
	}

	initMap(latitude: number, longitude: number) {
		GoogleMapsLoader.load((google) => {
			this.google = google;
			this.map = new google.maps.Map(this.googleMapsElement, {
				center: new google.maps.LatLng(latitude, longitude),
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			this.createCurrentMarker(latitude, longitude);
		});
	}

	loadListDelivererNearBy(latitude: number, longitude: number) {
		let maxDistance = 5000;
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
		let title = this.translate.instant('MAP.YOU_ARE_HERE');
		let marker = new this.google.maps.Marker({
			position: new this.google.maps.LatLng(latitude, longitude),
			title: title,
			map: this.map
		});
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
		setTimeout(() => {
			this.updateDelivererMarker(latitude, longitude);
		}, 60000);
	}
}
