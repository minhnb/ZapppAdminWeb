import { Injectable, ViewContainerRef } from '@angular/core';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';
import { TranslateService } from 'ng2-translate';

@Injectable()
export class ZapppAlert {

    isShowingError: Boolean;

    constructor(public modal: Modal, public overlay: Overlay, private translate: TranslateService) {
        this.isShowingError = false;
    }

    setDefaultViewContainer(vcRef: ViewContainerRef) {
        this.overlay.defaultViewContainer = vcRef;
    }

    showError(message: string, title?: string): any {
        if (this.isShowingError) {
            return;
        }
        if (!title) {
            title = this.translate.instant('DIALOG.ERROR');
        }
        if (!message) {
            message = this.translate.instant('ERROR.UNKNOWN');
        }
        this.isShowingError = true;
        return this.modal.alert()
			.size('lg')
			.showClose(true)
			.title(title)
			.body(message)
			.open()
            .catch(err => {
				console.log(err);
			})
			.then((dialog: any) => dialog.result)
            .then(result => {
                this.isShowingError = false;
            });
    }

    showInfo(message: string, title?: string): any {
        if (!title) {
            title = this.translate.instant('DIALOG.INFO');
        }
        return this.modal.alert()
			.size('lg')
			.showClose(true)
			.title(title)
			.body(message)
			.open();
    }

    showConfirm(message: string, title?: string): any {
        if (!title) {
            title = this.translate.instant('DIALOG.WARNING');
        }
        return this.modal.confirm()
			.size('lg')
            .showClose(true)
            .title(title)
            .body(message)
            .open()
            .catch(err => {
				console.log(err);
			})
			.then((dialog: any) => dialog.result);
    }
}
