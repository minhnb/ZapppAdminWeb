import { Injectable, ViewContainerRef } from '@angular/core';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

@Injectable()
export class ZapppAlert {
    constructor(public modal: Modal, public overlay: Overlay) {

    }

    setDefaultViewContainer(vcRef: ViewContainerRef) {
        this.overlay.defaultViewContainer = vcRef;
    }

    showError(message: string, title?: string) {
        if (!title) {
            title = 'Error';
        }
        this.modal.alert()
			.size('lg')
			.showClose(true)
			.title('Error')
			.body(message)
			.open();
    }

    showInfo(message: string, title?: string) {
        if (!title) {
            title = 'Info';
        }
        this.modal.alert()
			.size('lg')
			.showClose(true)
			.title('Info')
			.body(message)
			.open();
    }
}
