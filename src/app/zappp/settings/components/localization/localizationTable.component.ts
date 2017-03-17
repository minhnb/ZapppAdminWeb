import { Component, ViewEncapsulation, Input} from '@angular/core';
import { ZapppConstant } from '../../../../helper/zapppConstant';

@Component({
	selector: 'localization-table',
	encapsulation: ViewEncapsulation.None,
    template: `
    <div class="table-responsive">
      <table class="table">
        <tr>
          <th>#</th>
          <th>id</th>
          <th *ngFor="let lang of localizationHeader">{{ lang }}</th>
        </tr>
        <tr *ngFor="let item of localizationData; let i = index" [ngClass]="getClassForKey(item)">
            <td>{{ i + 1 }}</td>
            <td>{{ item.id }}</td>
            <td *ngFor="let lang of localizationHeader" [ngClass]="isChangedLangContent(lang, item.id, item[lang]) ? 'red-text' : ''">
				{{ getClassForKey(item)=='line-through-text' ? getOldContentForDeletedRow(item, lang) : item[lang] }}
			</td>
        </tr>
      </table>
    </div>
  `
})
export class LocalizationTable {
    @Input() localizationData: Array<any> = [];
    @Input() compareLocalizationData: any;
    @Input() localizationHeader: Array<string> = [];
    @Input() pageNumber: number = 1;

    pageSize: number;

    constructor() {
        this.pageSize = ZapppConstant.TABLE_PAGINATION.ITEM_PER_PAGE;
    }

    isChangedLangContent(lang: string, id: string, content: string): boolean {
        if (this.compareLocalizationData && content) {
            if (this.compareLocalizationData[lang] && this.compareLocalizationData[lang][id] && this.compareLocalizationData[lang][id] != content) {
                return true;
            }
        }
        return false;
    }

	getClassForKey(item: any): any {
		if (this.compareLocalizationData) {
			if (this.localizationHeader.length > 0) {
				let lang = this.localizationHeader[0];
				if (this.compareLocalizationData[lang]) {
					if (this.compareLocalizationData[lang][item.id] == undefined) {
						return 'green-text';
					}
					if (this.compareLocalizationData[lang][item.id] && !item[lang]) {
						return 'line-through-text';
					}
				}
			}

		}
		return "";
	}

	getOldContentForDeletedRow(item: any, lang: string): string {
		if (this.compareLocalizationData && this.compareLocalizationData[lang]) {
			return this.compareLocalizationData[lang][item.id] || '';
		}
		return '';
	}

    public resetPageNumber() {
        this.pageNumber = 1;
    }
}
