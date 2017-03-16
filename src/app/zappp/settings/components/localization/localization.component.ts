import { Component, ViewEncapsulation, Injector, ViewChild, ElementRef } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { LocalizationService } from '../../../../services/admin/localization';
import { ZapppConstant } from '../../../../helper/zapppConstant';
import { ModalDirective } from 'ng2-bootstrap';
var moment = require('moment');
declare const XLSX: any;
declare const alasql: any;

@Component({
	selector: 'delivery-accounts',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./localization.scss')],
	template: require('./localization.html'),
	providers: [LocalizationService]
})
export class Localization extends ZapppBaseComponent {

	@ViewChild('inputImportExcelFile') inputImportExcelFile: ElementRef;
	@ViewChild('importReviewModal') importReviewModal: ModalDirective;
	@ViewChild('exportHistoryModal') exportHistoryModal: ModalDirective;

	tableData = [];
	pageSize: number;
	totalItem: number;
	currentPage: number;

	pureZappperLocalizationData: any = {};
	pureSenderReceiverLocalizationData: any = {};

	zappperLocalizationData: Array<any> = [];
	senderReceiverLocalizationData: Array<any> = [];

	zappperLocalizationDataChange: Array<any> = [];
	senderReceiverLocalizationDataChange: Array<any> = [];

	zappperLocalizationDataImport: any = {};
	senderReceiverLocalizationDataImport: any = {};

	localizationHeader: Array<string> = ['en', 'zh_t'];

	zappperLocalizationVersions: Array<any> = [];
	senderReceiverLocalizationVersions: Array<any> = [];

	constructor(private injector: Injector, private localizationService: LocalizationService) {
		super(injector);
		this.pageSize = ZapppConstant.TABLE_PAGINATION.ITEM_PER_PAGE;
		this.currentPage = 1;
	}

	ngAfterViewInit() {
		this.loadAllLocalizationData();
	}

	importExcelFile() {
		this.inputImportExcelFile.nativeElement.click();
	}

	clearInputExcelFile() {
		this.inputImportExcelFile.nativeElement.value = "";
	}

	readExcelFile(event) {
		if (event.target.files.length == 0) {
			return;
		}
		let excelFile = event.target.files[0];
		let reader = new FileReader();
		let self = this;
		reader.onload = (e: any) => {
			let data = e.target.result;
			let workbook = XLSX.read(data, { type: 'binary' });

			self.readWorkbook(workbook);
			self.clearInputExcelFile();

		};
		reader.readAsBinaryString(excelFile);
	}

	readWorkbook(workbook: any) {
		workbook.SheetNames.forEach(sheetName => {
			let sheet = workbook.Sheets[sheetName];
			let sheetContent = XLSX.utils.sheet_to_json(sheet);
			switch (sheetName.toLowerCase()) {
				case ZapppConstant.LOCALIZATION_EXCEL_FILE.ZAPPPER_SHEET:
					this.zappperLocalizationDataImport = this.convertSheetContentToLocalizationData(sheetContent);
					this.compareZappperLocalizationDataImport();
					break;
				case ZapppConstant.LOCALIZATION_EXCEL_FILE.SENDER_RECEIVER_SHEET:
					this.senderReceiverLocalizationDataImport = this.convertSheetContentToLocalizationData(sheetContent);
					this.compareSenderReceiverLocalizationDataImport();
					break;
				default:
			}
		});
	}

	convertSheetContentToLocalizationData(sheetContent: Array<any>): any {
		let localizationData: any = {};
		if (sheetContent.length > 0) {
			let firstRow = sheetContent[0];
			let exceptKeys = ['id', 'note'];
			Object.keys(firstRow).forEach(key => {
				let lowercaseKey = key.toLowerCase();
				if (exceptKeys.indexOf(lowercaseKey) == -1) {
					localizationData[lowercaseKey] = {};
				}
			});
			sheetContent.forEach(row => {
				let id = row.id || row.ID || row.Id || row.iD;
				Object.keys(row).forEach(key => {
					let lowercaseKey = key.toLowerCase();
					if (exceptKeys.indexOf(lowercaseKey) == -1) {
						localizationData[lowercaseKey][id] = row[key] || '';
					}
				});
			});
		}
		return localizationData;
	}

	convertLocalizationDataToSheetContent(localizationData: any): Array<any> {
		let sheetContent: Array<any> = [];
		let keys = Object.keys(localizationData);
		if (keys.length == 0) {
			return sheetContent;
		}
		let firstLang = localizationData[keys[0]];
		Object.keys(firstLang).forEach(key => {
			let row: any = {};
			row.id = key;
			keys.forEach(langKey => {
				if (localizationData[langKey] && localizationData[langKey][key]) {
					row[langKey] = localizationData[langKey][key];
				} else {
					row[langKey] = '';
				}
			});
			sheetContent.push(row);
		});
		return sheetContent;
	}

	findLocalizationDataChange(localizationData: any, newLocalizationData: any): any {
		let changes: any = {};
		let keys = Object.keys(localizationData);
		if (keys.length == 0) {
			return changes;
		}
		keys.forEach(langKey => {
			changes[langKey] = {};
		});
		let firstLang = localizationData[keys[0]];
		Object.keys(firstLang).forEach(key => {
			let isChanged = false;
			keys.forEach(langKey => {
				if (newLocalizationData[langKey][key] != localizationData[langKey][key]) {
					isChanged = true;
				}
			});
			if (isChanged) {
				keys.forEach(langKey => {
					changes[langKey][key] = newLocalizationData[langKey][key];
				});
			}
		});
		let newFirstLang = newLocalizationData[keys[0]];
		let newIds = this.findNewIds(Object.keys(firstLang), Object.keys(newFirstLang));
		newIds.forEach(key => {
			keys.forEach(langKey => {
				changes[langKey][key] = newLocalizationData[langKey][key];
			});
		});
		return changes;
	}

	findNewIds(listId: Array<string>, listNewId: Array<string>): Array<string> {
		let result: Array<string> = [];
		listNewId.forEach(id => {
			if (listId.indexOf(id) == -1) {
				result.push(id);
			}
		});
		return result;
	}

	compareZappperLocalizationDataImport() {
		let self = this;
		self.loadLocalizationData(ZapppConstant.DELIVERER_APP, null, zappperLocalizationData => {
			self.pureZappperLocalizationData = zappperLocalizationData.data;
			self.zappperLocalizationData = self.convertLocalizationDataToSheetContent(zappperLocalizationData.data);
			let changes = self.findLocalizationDataChange(zappperLocalizationData.data, self.zappperLocalizationDataImport);
			self.zappperLocalizationDataChange = self.convertLocalizationDataToSheetContent(changes);
			self.importReviewModal.show();
		});
	}

	compareSenderReceiverLocalizationDataImport() {
		let self = this;
		self.loadLocalizationData(ZapppConstant.SENDER_APP, null, senderReceiverLocalizationData => {
			self.pureSenderReceiverLocalizationData = senderReceiverLocalizationData.data;
			self.senderReceiverLocalizationData = self.convertLocalizationDataToSheetContent(senderReceiverLocalizationData.data);
			let changes = self.findLocalizationDataChange(senderReceiverLocalizationData.data, self.senderReceiverLocalizationDataImport);
			self.senderReceiverLocalizationDataChange = self.convertLocalizationDataToSheetContent(changes);
		});
	}

	updateLocalizationData(type: string, data: any, callback?: (result: any) => void) {
		this.localizationService.updateLocalizationData(type, data).subscribe(
			res => {
				if (callback) {
					callback(res);
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}
	updateZappperLocalzationData(callback?: (result: any) => void) {
		this.updateLocalizationData(ZapppConstant.DELIVERER_APP, this.zappperLocalizationDataImport, callback);
	}
	updateSenderReceiverLocalzationData(callback?: (result: any) => void) {
		this.updateLocalizationData(ZapppConstant.SENDER_APP, this.senderReceiverLocalizationDataImport, callback);
	}
	importLocalizationData() {
		let self = this;
		self.updateZappperLocalzationData(zappperLocalizationData => {
			self.updateSenderReceiverLocalzationData(senderReceiverLocalizationData => {
				this.loadAllLocalizationData();
				self.importReviewModal.hide();
				self.zapppAlert.showInfo(self.translate.instant('INFORM.IMPORT_DATA_SUCCESSFULLY'));
			});
		});
	}
	loadLocalizationData(type: string, version: string, callback?: (result: any) => void) {
		this.localizationService.getLocalizationData(type).subscribe(
			res => {
				if (callback) {
					callback(res);
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}
	loadAllLocalizationData() {
		let self = this;
		self.loadLocalizationData(ZapppConstant.DELIVERER_APP, null, zappperLocalizationData => {
			self.getLocalizationHeader(zappperLocalizationData.data);
			self.pureZappperLocalizationData = zappperLocalizationData.data;
			self.zappperLocalizationData = self.convertLocalizationDataToSheetContent(zappperLocalizationData.data);
			self.loadLocalizationData(ZapppConstant.SENDER_APP, null, senderReceiverLocalizationData => {
				self.pureSenderReceiverLocalizationData = senderReceiverLocalizationData.data;
				self.senderReceiverLocalizationData = self.convertLocalizationDataToSheetContent(senderReceiverLocalizationData.data);
			});
		});
	}

	getLocalizationHeader(localizationData) {
		return Object.keys(localizationData);
	}

	transformListExportVersion(listExportVersion: Array<any>): Array<any> {
		listExportVersion.forEach(listExportVersion => {
			listExportVersion.formated_created_at = moment.unix(listExportVersion.created_at).format(ZapppConstant.FORMAT_DATETIME);
		});
		return listExportVersion;
	}

	loadListLocalizationDataVersion(type: string, callback?: (result: any) => void) {
		this.localizationService.getListLocalizationDataVersion(type).subscribe(
			res => {
				if (callback) {
					callback(res);
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	showAllExportVersion() {
		let self = this;
		self.loadListLocalizationDataVersion(ZapppConstant.DELIVERER_APP, zappperLocalizationVersions => {
			self.zappperLocalizationVersions = self.transformListExportVersion(zappperLocalizationVersions);
			self.loadListLocalizationDataVersion(ZapppConstant.SENDER_APP, senderReceiverLocalizationVersions => {
				self.senderReceiverLocalizationVersions = self.transformListExportVersion(senderReceiverLocalizationVersions);
				self.exportHistoryModal.show();
			});
		});
	}

	exportLocalizationData(type: string, version: string, sheetName: string) {
		let self = this;
		let fileName = type + '_' + version;
		this.loadLocalizationData(type, version, localizationData => {
			let data = self.convertLocalizationDataToSheetContent(localizationData.data);
			alasql("SELECT * INTO XLSX('" + fileName + ".xlsx',{ headers: true, sheetid: '" + sheetName + "' }) FROM ? ", [data]);
		});
	}
	exportZappperLocalizationData(version: string) {
		let sheetName = this.translate.instant('LOCALIZATION.ZAPPPER');
		this.exportLocalizationData(ZapppConstant.DELIVERER_APP, version, sheetName);
	}
	exportSenderReceiverLocalizationData(version: string) {
		let sheetName = this.translate.instant('LOCALIZATION.SENDER_RECEIVER');
		this.exportLocalizationData(ZapppConstant.SENDER_APP, version, sheetName);
	}
}
