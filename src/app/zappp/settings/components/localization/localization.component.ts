import { Component, ViewEncapsulation, Injector, ViewChild, ElementRef } from '@angular/core';
import { ZapppBaseComponent } from '../../../baseComponent/base.component';
import { LocalizationService } from '../../../../services/admin/localization';
import { ZapppConstant } from '../../../../helper/zapppConstant';
import { ModalDirective, TabsetComponent } from 'ng2-bootstrap';
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
	@ViewChild('tabLocalizationDataChange') tabLocalizationDataChange: TabsetComponent;
	@ViewChild('tabLocalizationVersions') tabLocalizationVersions: TabsetComponent;

	tableData = [];
	pageSize: number;
	totalItem: number;
	currentPage: number;

	localizationHeader: Array<string> = ['en', 'zh_t'];
	exceptKeys: Array<string> = ['id', 'note'];

	needFocusTab: string = '';
	localizationArray: Array<any>;
	validSheetNameArray: Array<string> = [];

	constructor(private injector: Injector, private localizationService: LocalizationService) {
		super(injector);
		this.pageSize = ZapppConstant.TABLE_PAGINATION.ITEM_PER_PAGE;
		this.currentPage = 1;
		this.localizationArray = [
			{
				key: 'ZAPPPER',
				localizationKey: 'LOCALIZATION.ZAPPPER',
				appKey: ZapppConstant.DELIVERER_APP,
				excelSheetName: ZapppConstant.LOCALIZATION_EXCEL_FILE.ZAPPPER_SHEET,
				pureLocalizationData: {},
				localizationData: [],
				localizationDataChange: [],
				localizationDataImport: {},
				localizationVersions: []
			},
			{
				key: 'SENDER_RECEIVER',
				localizationKey: 'LOCALIZATION.SENDER_RECEIVER',
				appKey: ZapppConstant.SENDER_APP,
				excelSheetName: ZapppConstant.LOCALIZATION_EXCEL_FILE.SENDER_RECEIVER_SHEET,
				pureLocalizationData: {},
				localizationData: [],
				localizationDataChange: [],
				localizationDataImport: {},
				localizationVersions: []
			},
			{
				key: 'WEB_HOME',
				localizationKey: 'LOCALIZATION.WEB_HOME',
				appKey: ZapppConstant.WEB_APP,
				excelSheetName: ZapppConstant.LOCALIZATION_EXCEL_FILE.WEB_HOME_SHEET,
				pureLocalizationData: {},
				localizationData: [],
				localizationDataChange: [],
				localizationDataImport: {},
				localizationVersions: []
			},
			{
				key: 'SERVER',
				localizationKey: 'LOCALIZATION.SERVER',
				appKey: ZapppConstant.SERVER,
				excelSheetName: ZapppConstant.LOCALIZATION_EXCEL_FILE.SERVER_SHEET,
				pureLocalizationData: {},
				localizationData: [],
				localizationDataChange: [],
				localizationDataImport: {},
				localizationVersions: []
			}
		]
		this.localizationArray.forEach(item => {
			this.validSheetNameArray.push(item.excelSheetName);
		});
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
		this.localizationArray.forEach(item => {
			item.localizationDataImport = {};
			item.localizationDataChange = [];
		});
		this.needFocusTab = '';
		if (!this.isValidTemplate(workbook)) {
			this.zapppAlert.showError(this.translate.instant('ERROR.LOCALIZATION.INVALID_TEMPLATE'));
			return;
		}
		workbook.SheetNames.forEach(sheetName => {
			let sheet = workbook.Sheets[sheetName];
			let header = this.getHeader(sheet);
			let sheetContent = XLSX.utils.sheet_to_json(sheet);
			let localizationObject: any = {};
			let localizationObjectIndex = this.validSheetNameArray.indexOf(sheetName.toLowerCase());
			if (localizationObjectIndex > -1) {
				localizationObject = this.localizationArray[localizationObjectIndex];
				if (!this.needFocusTab) {
					this.needFocusTab = this.translate.instant(localizationObject.localizationKey);
				}
				localizationObject.localizationDataImport = this.convertSheetContentToLocalizationData(sheetContent, header);
				this.compareLocalizationDataImport(header, localizationObject);
			}
		});
	}

	initLocalizationDataObject(exceptKeys: Array<string>, header: Array<string>): any {
		let localizationData: any = {};
		header.forEach(key => {
			let lowercaseKey = key.toLowerCase();
			if (exceptKeys.indexOf(lowercaseKey) == -1) {
				localizationData[lowercaseKey] = {};
			}
		});
		return localizationData;
	}

	convertSheetContentToLocalizationData(sheetContent: Array<any>, header?: Array<string>): any {
		let localizationData: any = {};
		let exceptKeys = this.exceptKeys;
		if (sheetContent.length > 0) {
			let firstRow = sheetContent[0];
			localizationData = this.initLocalizationDataObject(exceptKeys, Object.keys(firstRow));
			sheetContent.forEach(row => {
				let id = row.id || row.ID || row.Id || row.iD;
				if (id) {
					Object.keys(row).forEach(key => {
						let lowercaseKey = key.toLowerCase();
						if (exceptKeys.indexOf(lowercaseKey) == -1) {
							localizationData[lowercaseKey][id] = row[key] || '';
						}
					});
				}
			});
		} else {
			if (header) {
				localizationData = this.initLocalizationDataObject(exceptKeys, header);
			}
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
				if (!newLocalizationData[langKey] || newLocalizationData[langKey][key] != localizationData[langKey][key]) {
					isChanged = true;
				}
			});
			if (isChanged) {
				keys.forEach(langKey => {
					changes[langKey][key] = newLocalizationData[langKey] ? newLocalizationData[langKey][key] : '';
				});
			}
		});
		let newFirstLang = newLocalizationData[keys[0]] || {};
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

	compareLocalizationDataImport(header: Array<string>, localizationObject: any) {
		let self = this;
		self.loadLocalizationData(localizationObject.appKey, null, localizationData => {
			if (!self.isValidHeader(header)) {
				self.zapppAlert.showError(self.translate.instant('ERROR.LOCALIZATION.TEMPLATE_CHANGED'));
				return;
			}
			localizationObject.pureLocalizationData = localizationData.data;
			localizationObject.localizationData = self.convertLocalizationDataToSheetContent(localizationData.data);
			let changes = self.findLocalizationDataChange(localizationData.data, localizationObject.localizationDataImport);
			localizationObject.localizationDataChange = self.convertLocalizationDataToSheetContent(changes);
			self.importReviewModal.show();
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

	updateLocalzationDataByArrayIndex(index: number) {
		if (index >= this.localizationArray.length) {
			this.loadAllLocalizationData();
			this.importReviewModal.hide();
			this.zapppAlert.showInfo(this.translate.instant('INFORM.IMPORT_DATA_SUCCESSFULLY'));
			return;
		}
		let appKey = this.localizationArray[index].appKey;
		let localizationDataImport = this.localizationArray[index].localizationDataImport;
		let self = this;
		index++;
		if (Object.keys(localizationDataImport).length == 0) {
			self.updateLocalzationDataByArrayIndex(index);
		} else {
			this.updateLocalizationData(appKey, localizationDataImport, localizationVersions => {
				self.updateLocalzationDataByArrayIndex(index);
			});
		}

	}

	importLocalizationData() {
		let i = 0;
		this.updateLocalzationDataByArrayIndex(i);
	}

	loadLocalizationData(type: string, version: string, callback?: (result: any) => void) {
		this.localizationService.getLocalizationData(type, version).subscribe(
			res => {
				this.getLocalizationHeader(res.data);
				if (callback) {
					callback(res);
				}
			},
			error => {
				this.zapppAlert.showError(error.message);
			}
		)
	}

	loadLocalizationDataByArrayIndex(index: number) {
		if (index >= this.localizationArray.length) {
			return;
		}
		let appKey = this.localizationArray[index].appKey;
		let self = this;
		this.loadLocalizationData(appKey, null, localizationData => {
			self.localizationArray[index].pureLocalizationData = localizationData.data;
			self.localizationArray[index].localizationData = self.convertLocalizationDataToSheetContent(localizationData.data);
			index++;
			self.loadLocalizationDataByArrayIndex(index);
		});
	}
	loadAllLocalizationData() {
		let i = 0;
		this.loadLocalizationDataByArrayIndex(i);
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

	showExportVersionByArrayIndex(index: number) {
		if (index >= this.localizationArray.length) {
			this.exportHistoryModal.show();
			return;
		}
		let appKey = this.localizationArray[index].appKey;
		let self = this;
		this.loadListLocalizationDataVersion(appKey, localizationVersions => {
			self.localizationArray[index].localizationVersions = self.transformListExportVersion(localizationVersions);
			index++;
			self.showExportVersionByArrayIndex(index);
		});
	}

	showAllExportVersion() {
		let i = 0;
		this.showExportVersionByArrayIndex(i);
	}

	exportLocalizationData(type: string, version: string, sheetNameKey: string) {
		let self = this;
		let fileName = type + '_' + version;
		let sheetName = this.translate.instant(sheetNameKey);
		this.loadLocalizationData(type, version, localizationData => {
			let data = self.convertLocalizationDataToSheetContent(localizationData.data);
			if (data.length > 0) {
				alasql("SELECT * INTO XLSX('" + fileName + ".xlsx',{ headers: true, sheetid: '" + sheetName + "' }) FROM ? ", [data]);
			} else {
				let headerRow = { id: 'id' };
				self.localizationHeader.forEach(lang => {
					headerRow[lang] = lang;
				});
				alasql("SELECT * INTO XLSX('" + fileName + ".xlsx',{ headers: false, sheetid: '" + sheetName + "' }) FROM ? ", [[headerRow]]);
			}
		});
	}

	isValidSheetName(workbook: any): boolean {
		if (workbook.SheetNames.length == 0 || workbook.SheetNames.length > this.localizationArray.length) {
			return false;
		}
		for (let i = 0; i < workbook.SheetNames.length; i++) {
			let sheetName = workbook.SheetNames[i];
			let lowercaseSheetName = sheetName.toLowerCase();
			if (this.validSheetNameArray.indexOf(lowercaseSheetName) == -1) {
				return false;
			}
		}
		return true;
	}

	isValidSheetContent(workbook: any): boolean {
		for (let i = 0; i < workbook.SheetNames.length; i++) {
			let sheetName = workbook.SheetNames[i];
			let sheet = workbook.Sheets[sheetName];
			if (Object.keys(sheet).length == 0) {
				return false;
			}
			let header = this.getHeader(sheet);
			header.map(header => {
				return header.toLowerCase();
			});
			if (!this.isValidHeader(header)) {
				return false;
			}
		}
		return true;
	}

	isValidHeader(header: Array<string>): boolean {
		if (header.length > this.localizationHeader.length + this.exceptKeys.length) {
			return false;
		}
		let fullHeaders = this.localizationHeader.concat('id');
		let lackIds = this.findNewIds(header, fullHeaders);
		if (lackIds.length > 0) {
			return false;
		}
		let redundancyIds = this.findNewIds(fullHeaders, header);
		if (header.length > fullHeaders.length + redundancyIds.length) {
			return false;
		}
		if (redundancyIds.length > 0) {
			for (let i = 0; i < redundancyIds.length; i++) {
				let key = redundancyIds[i];
				if (this.exceptKeys.indexOf(key) == -1) {
					return false;
				}
			}
		}
		return true;
	}

	isValidTemplate(workbook: any): boolean {
		if (!this.isValidSheetName(workbook)) {
			return false;
		}
		if (!this.isValidSheetContent(workbook)) {
			return false;
		}
		return true;
	}

	getHeader(sheet: any): Array<string> {
		let header: Array<string> = [];
		let range = XLSX.utils.decode_range(sheet['!ref']);
		let C, R = range.s.r;
		for (C = range.s.c; C <= range.e.c; ++C) {
			var cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
			var hdr = "UNKNOWN " + C;
			if (cell && cell.t) {
				hdr = XLSX.utils.format_cell(cell);
				header.push(hdr);
			}
			else {
				return header;
			}
		}
		return header;
	}

	hasImportData(): boolean {
		for (let i = 0; i < this.localizationArray.length; i++) {
			let localizationObject = this.localizationArray[i];
			if (localizationObject.localizationDataChange.length > 0) {
				return true;
			}
		}
		return false;
	}

	tabsetSelectTab(tabset: TabsetComponent, heading: string) {
		if (tabset && tabset.tabs.length > 0) {
			tabset.tabs.forEach(tab => {
				if (tab.heading == heading) {
					tab.active = true;
				}
			});
		}
	}

	onShowImportReviewModal() {
		for (let i = 0; i < this.localizationArray.length; i++) {
			let localizationObject = this.localizationArray[i];
			if (localizationObject.localizationDataChange.length > 0) {
				this.tabsetSelectTab(this.tabLocalizationDataChange, this.translate.instant(localizationObject.localizationKey));
				return;
			}
		}
		if (!this.needFocusTab) {
			this.needFocusTab = this.translate.instant(this.localizationArray[0].localizationKey);
		}
		this.tabsetSelectTab(this.tabLocalizationDataChange, this.needFocusTab);
	}

	onShowExportHistoryModal() {
		this.tabsetSelectTab(this.tabLocalizationVersions, this.translate.instant('LOCALIZATION.ZAPPPER'));
	}
}
