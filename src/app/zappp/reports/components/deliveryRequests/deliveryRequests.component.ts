import { Component, ViewEncapsulation, Injector, ViewChild, ElementRef } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { DeliveryService } from '../../../../services/admin/delivery';
import { ZapppConstant } from '../../../../helper/zapppConstant';
import { DateTimePicker } from '../../../../helper/datetimepicker';

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
	@ViewChild('fromDateTimePicker') fromDateTimePicker: DateTimePicker;
	@ViewChild('toDateTimePicker') toDateTimePicker: DateTimePicker;
	tableData = [];
	pageSize: number;
	totalItem: number;
	currentPage: number;

	map: any;
	poly: any;
	google: any;
	geocoder: any;
	googleMapsElement: any;
	mapIsLoaded: Boolean;
	trackDelivererTimer: any;
	points: Array<any>;
	lastUpdate: number;
	selectedDeliveryRequest: any;
	infoWindow: any;

	formatDateTime: String;
	fromDate: Date;
	toDate: Date;
	senderName: String;
	delivererName: String;
	deliveryStatus: String = '';
	paymentStatus: String = '';
	searchQuery: any = {};

	constructor(private injector: Injector, private deliveryService: DeliveryService, private _elementRef: ElementRef) {
		super(injector);
		this.mapIsLoaded = false;
		this.trackDelivererTimer = null;
		this.points = [];
		this.lastUpdate = 0;
		this.selectedDeliveryRequest = null;
		this.pageSize = ZapppConstant.TABLE_PAGINATION.ITEM_PER_PAGE;
		this.currentPage = 1;
		this.totalItem = 0;

		this.formatDateTime = ZapppConstant.FORMAT_DATETIME;
	}

	ngAfterViewInit() {
		this.listDeliveryRequests();
		this.googleMapsElement = this._elementRef.nativeElement.querySelector('.google-maps');
	}

	listDeliveryRequests(start?: number) {
		let sortBy = '';
		this.deliveryService.listDeliveryRequests(this.searchQuery, sortBy, true, this.pageSize, start).subscribe(
			res => {
				if (!start) {
					this.currentPage = 1;
				}
				this.totalItem = res.total;
				this.tableData = this.deliveryRequestsToDisplay(res.data);
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

			deliveryRequest.formated_created_at = moment.unix(deliveryRequest.created_at).format(ZapppConstant.FORMAT_DATETIME);
			deliveryRequest.pick_up_place = deliveryRequest.pickup_location.full_address;
			deliveryRequest.destination = deliveryRequest.destination_location.full_address;


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
			self.geocoder = new google.maps.Geocoder();
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
			self.infoWindow = new this.google.maps.InfoWindow({
				content: ''
			});
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

	createMarker(latitude: number, longitude: number, markerImage: any, title: string, infoWindowContent?: string): any {
		var markerParams = {
			position: new this.google.maps.LatLng(latitude, longitude),
			title: title,
			icon: markerImage,
			size: new this.google.maps.Size(71, 71),
			optimized: false,
			map: this.map
		};

		let marker = new this.google.maps.Marker(markerParams);
		marker.infoWindowContent = infoWindowContent;
		this.points.push(marker);
		if (infoWindowContent) {
			this.addInfoWindow(marker, infoWindowContent);
		}
		return marker;
	}

	createDelivererMarker(latitude: number, longitude: number, title: string, infoWindowContent?: string): any {
		let markerImage = {
			path: this.google.maps.SymbolPath.CIRCLE,
			strokeColor: '#186A3B',
            scale: 8
		};
		let marker = this.createMarker(latitude, longitude, markerImage, title, infoWindowContent);
		return marker;
	}

	createDeliveryPoint(latitude: number, longitude: number, title: string, infoWindowContent?: string): any {
		let markerImage = {
			path: this.google.maps.SymbolPath.CIRCLE,
			strokeColor: '#5DADE2',
            scale: 4
		};
		let marker = this.createMarker(latitude, longitude, markerImage, title, infoWindowContent);
		return marker;
	}

	createDeliveryStartEndPoint(latitude: number, longitude: number, title: string, infoWindowContent?: string): any {
		let markerImage = {
			path: this.google.maps.SymbolPath.CIRCLE,
			strokeColor: '#F1C40F',
            scale: 8
		};
		let marker = this.createMarker(latitude, longitude, markerImage, title, infoWindowContent);
		return marker;
	}

	addInfoWindow(marker: any, content: string) {
		let self = this;
		marker.addListener('click', function() {
			if (marker.needGetAddress) {
				self.getAddress(marker.position, (address) => {
					if (address) {
						marker.infoWindowContent = marker.infoWindowContent + '<br/>' + address;
						marker.needGetAddress = false;
					} else {
						marker.infoWindowContent = marker.infoWindowContent + '<br/>' + self.translate.instant('MAP.COULDNT_GET_ADDRESS');
					}
					self.showInfoWindow(marker);
				});
			} else {
				self.showInfoWindow(marker);
			}
        });
	}

	showInfoWindow(marker: any) {
		this.infoWindow.setContent(this.generateInfoWindowContent(marker.infoWindowContent));
		this.infoWindow.open(this.map, marker);
	}

	generateInfoWindowContent(content: string): string {
		return '<div class="info-window">' + content + '<div>';
	}

	drawStartEndPoint(deliveryRequest: any) {
		if (deliveryRequest.pickup_location) {
			let title = this.translate.instant('REPORTS.PICK_UP_PLACE');
			let infoWindowContent = title + ': <br/>' + deliveryRequest.pick_up_place;
			this.createDeliveryStartEndPoint(deliveryRequest.pickup_location.lat, deliveryRequest.pickup_location.long, title, infoWindowContent);
		}
		if (deliveryRequest.destination_location) {
			let title = this.translate.instant('REPORTS.DESTINATION');
			let infoWindowContent = title + ': <br/>' + deliveryRequest.destination;
			this.createDeliveryStartEndPoint(deliveryRequest.destination_location.lat, deliveryRequest.destination_location.long, title, infoWindowContent);
		}
	}

	drawPath(paths: Array<any>) {
		var polyPath = this.poly.getPath();
		paths.forEach((path, index) => {
			let point = new this.google.maps.LatLng(path.lat, path.long);
			polyPath.push(point);
			let title = moment.unix(path.created_at).format(ZapppConstant.FORMAT_TIME_FULL);
			let infoWindowContent = moment.unix(path.created_at).format(ZapppConstant.FORMAT_DATETIME_WITH_SECOND);
			let marker = this.createDeliveryPoint(path.lat, path.long, title, infoWindowContent);
			marker.needGetAddress = true;
			if (index == paths.length - 1) {
				let currentMarker = this.createDelivererMarker(path.lat, path.long, title, infoWindowContent);
				currentMarker.needGetAddress = true;
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

	getAddress(point: any, callback: (address: string) => void) {
		this._spinner.show();
		let self = this;
		this.geocoder.geocode({
			'latLng': point
		}, function(results, status) {
			self._spinner.hide();
			if (status === this.google.maps.GeocoderStatus.OK) {
				if (results.length > 0) {
					callback(results[0].formatted_address);
				} else {
					let address = self.translate.instant('MAP.UNKNOWN_ADDRESS');
					callback(address);
				}
			} else {
				console.log('Geocoder failed: ' + status);
				callback('');
			}
		});
	}

	pageChanged(event) {
		this.currentPage = event;
		this.listDeliveryRequests((this.currentPage - 1) * this.pageSize);
	}

	getToday(): Date {
		return new Date();
	}

	clearSearch() {
		this.fromDateTimePicker.reset();
		this.toDateTimePicker.reset();
		this.senderName = '';
		this.delivererName = '';
		this.deliveryStatus = '';
		this.paymentStatus = '';

		if (Object.keys(this.searchQuery).length > 0) {
			this.searchQuery = {};
			this.listDeliveryRequests();
		}
	}

	searchDelivererRequest() {
		this.searchQuery = this.buildSearchQuery();
		this.listDeliveryRequests();
	}

	buildSearchQuery() {
		let search: any = {};
		if (this.fromDate) {
			search.from = moment(this.fromDate).unix();
		}
		if (this.toDate) {
			search.to = moment(this.toDate).unix();
		}
		if (this.senderName) {
			search.sender = this.senderName;
		}
		if (this.delivererName) {
			search.deliverer = this.delivererName;
		}
		if (this.deliveryStatus) {
			search.status = this.deliveryStatus;
		}
		if (this.paymentStatus) {
			search.payment_status = this.paymentStatus;
		}
		return search;
	}
}
