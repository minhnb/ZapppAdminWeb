import { Component, ViewEncapsulation, Injector, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppConstant } from '../../../../helper/zapppConstant';

import { ModalDirective } from 'ng2-bootstrap';
import { GoogleMapsLoader } from '../../../googleMaps.loader';
var moment = require('moment');

@Component({
	selector: 'delivery-requests',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./deliveryRequests.scss')],
	template: require('./deliveryRequests.html'),
	providers: [DeliveryService]
})
export class DeliveryRequests extends ZapppBaseComponent {

	@ViewChild('trackModal') trackModal: ModalDirective;
	tableData = [];

	map: any;
	poly: any;
	google: any;
	googleMapsElement: any;
	mapIsLoaded: Boolean;
	trackDelivererTimer: any;
	points: Array<any>;
	lastUpdate: number;
	selectedDeliveryRequest: any;

	constructor(private injector: Injector, private deliveryService: DeliveryService, private _elementRef: ElementRef, private ngZone: NgZone) {
		super(injector);
		this.mapIsLoaded = false;
		this.trackDelivererTimer = null;
		this.points = [];
		this.lastUpdate = 0;
		this.selectedDeliveryRequest = null;
	}

	ngAfterViewInit() {
		this.listDeliveryRequests();
		this.googleMapsElement = this._elementRef.nativeElement.querySelector('.google-maps');
	}

	listDeliveryRequests() {
		this.deliveryService.listDeliveryRequests().subscribe(
			res => {
				this.tableData = this.deliveryRequestsToDisplay(res);
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	getFare(amount: number, currency: string): string {
		if (amount == null) return "";
        var result = (amount / 100.0).toFixed(2);
		if (currency === 'usd') {
			return "$" + result;
		}
		return [result, currency].filter(Boolean).join(' ');
	}

	getAddressLocation(locationData: any): string {
		let street = [locationData.street_number, locationData.street_name].filter(Boolean).join(' ');
		let result = [street, locationData.city, locationData.country];
		return result.filter(Boolean).join(', ');
	}

	deliveryRequestsToDisplay(deliveryRequests: Array<any>): Array<any> {
		return deliveryRequests.map(deliveryRequest => {
			if (!deliveryRequest.creator) {
				deliveryRequest.sender = { name: "" };
			} else {
				deliveryRequest.sender = deliveryRequest.creator;
				if (!deliveryRequest.sender.name) {
					deliveryRequest.sender.name = "";
				}
			}
			if (!deliveryRequest.deliverer) {
				deliveryRequest.deliverer = { name: "" };
			} else {
				if (!deliveryRequest.deliverer.name) {
					deliveryRequest.deliverer.name = "";
				}
			}

			deliveryRequest.pick_up_place = this.getAddressLocation(deliveryRequest.pickup_location);
			deliveryRequest.destination = this.getAddressLocation(deliveryRequest.destination_location);


			deliveryRequest.fare = "";
			if (deliveryRequest.quotation && deliveryRequest.quotation.amount != null) {
				deliveryRequest.fare = this.getFare(deliveryRequest.quotation.amount, deliveryRequest.quotation.currency);
			}

			deliveryRequest.status = "";
			if (deliveryRequest.current_status && deliveryRequest.current_status.status) {
				deliveryRequest.status = deliveryRequest.current_status.status;
			}

			return deliveryRequest;
		});
	}

	isDeliveringRequest(deliverer: any): Boolean {
		if (!deliverer) {
			return false;
		}
		return deliverer.status == 'Delivering';
	}

	isCompletedRequest(deliverer: any): Boolean {
		if (!deliverer) {
			return false;
		}
		return deliverer.status == 'Completed';
	}

	showTrackPopUp(deliveryRequest) {
		this.selectedDeliveryRequest = deliveryRequest;
		this.trackModal.show();

		if (!this.mapIsLoaded) {
			this._spinner.show();
			setTimeout(() => {
				this.loadGoogleMap(deliveryRequest);
			}, 500);
		} else {
			this.drawStartEndPoint(deliveryRequest);
			this.trackDeliverer(deliveryRequest.id);
		}

	}

	loadGoogleMap(deliveryRequest) {
		let self = this;
		let lat = 22.28552;
		let long = 114.15769;
		if (deliveryRequest.pickup_location) {
			lat = deliveryRequest.pickup_location.lat;
			long = deliveryRequest.pickup_location.long;
		}
		GoogleMapsLoader.load((google) => {
			self.google = google;
			self.map = new google.maps.Map(self.googleMapsElement, {
				center: new google.maps.LatLng(lat, long),
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			self.mapIsLoaded = true;
			self.poly = new google.maps.Polyline({
				strokeColor: '#4285F4',
				strokeOpacity: 1.0,
				strokeWeight: 5
			});
			self.poly.setMap(self.map);
			self.drawStartEndPoint(deliveryRequest);
			self.trackDeliverer(deliveryRequest.id);
		});
	}

	onCloseTrackModal(event) {
		this.clearTrackDelivererTimer();
		this.resetMap();
		this.selectedDeliveryRequest = null;
	}

	getDelivererLocation(deliveryRequestId: string, timestamp?: number) {
		this.deliveryService.getDeliveryRequestLocation(deliveryRequestId, timestamp).subscribe(
			res => {
				this.selectedDeliveryRequest.status = res.current_status.status;
				if (this.isDeliveringRequest(res.current_status)) {
					if (!timestamp) {
						this.drawMovedPath(res.delivery_path);
					} else {
						this.drawNextPath(res.delivery_path);
					}
				} else {
					this.clearTrackDelivererTimer();
					if (this.isCompletedRequest(res.current_status)) {
						this.drawMovedPath(res.delivery_path);
					}
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		);
	}

	trackDeliverer(deliveryRequestId: string) {
		this.getDelivererLocation(deliveryRequestId, this.lastUpdate);
		this.trackDelivererTimer = setTimeout(() => {
			this.trackDeliverer(deliveryRequestId);
		}, 30000);
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
		this.points.push(marker);
		return marker;
	}

	createDelivererMarker(latitude: number, longitude: number, title: string): any {
		let markerImage = {
			path: this.google.maps.SymbolPath.CIRCLE,
			strokeColor: '#186A3B',
            scale: 8
		};
		let marker = this.createMarker(latitude, longitude, markerImage, title);
		return marker;
	}

	createDeliveryPoint(latitude: number, longitude: number, title: string): any {
		let markerImage = {
			path: this.google.maps.SymbolPath.CIRCLE,
			strokeColor: '#5DADE2',
            scale: 4
		};
		let marker = this.createMarker(latitude, longitude, markerImage, title);
		return marker;
	}

	createDeliveryStartEndPoint(latitude: number, longitude: number, title: string): any {
		let markerImage = {
			path: this.google.maps.SymbolPath.CIRCLE,
			strokeColor: '#F1C40F',
            scale: 8
		};
		let marker = this.createMarker(latitude, longitude, markerImage, title);
		return marker;
	}

	drawStartEndPoint(deliveryRequest: any) {
		if (deliveryRequest.pickup_location) {
			let title = this.translate.instant('REPORTS.PICK_UP_PLACE');
			this.createDeliveryStartEndPoint(deliveryRequest.pickup_location.lat, deliveryRequest.pickup_location.long, title);
		}
		if (deliveryRequest.destination_location) {
			let title = this.translate.instant('REPORTS.DESTINATION');
			this.createDeliveryStartEndPoint(deliveryRequest.destination_location.lat, deliveryRequest.destination_location.long, title);
		}
	}

	drawPath(paths: Array<any>) {
		var polyPath = this.poly.getPath();
		paths.forEach((path, index) => {
			let point = new this.google.maps.LatLng(path.lat, path.long);
			polyPath.push(point);
			let title = moment.unix(path.created_at).format(ZapppConstant.FORMAT_TIME_FULL);
			this.createDeliveryPoint(path.lat, path.long, title);
			if (index == paths.length - 1) {
				this.createDelivererMarker(path.lat, path.long, title);
				this.map.setCenter(point);
				this.lastUpdate = path.created_at;
			}
		});
	}

	drawMovedPath(paths: Array<any>) {
		if (paths.length == 0) {
			return;
		}
		this.drawPath(paths);
	}

	drawNextPath(paths: Array<any>) {
		if (paths.length == 0) {
			return;
		}
		this.removeCurrentMarker();
		this.drawPath(paths);
	}

	removeCurrentMarker() {
		if (this.points.length > 2) {
			this.points[this.points.length - 1].setMap(null);
			this.points.pop();
		}
	}

	clearTrackDelivererTimer() {
		if (this.trackDelivererTimer) {
			clearTimeout(this.trackDelivererTimer);
			this.trackDelivererTimer = null;
		}
	}

	resetMap() {
		let polyPath = this.poly.getPath();
		let polyPathLength = polyPath.length;
		for (let i = 0; i < polyPathLength; i++) {
			polyPath.pop();
		}
		this.points.forEach(point => {
			point.setMap(null);
		});
		this.points = [];
		this.lastUpdate = 0;
		this.map.setZoom(15);
	}
}
