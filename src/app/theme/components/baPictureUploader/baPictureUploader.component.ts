import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer, ViewEncapsulation } from '@angular/core';
import { Ng2Uploader } from 'ng2-uploader/ng2-uploader';

@Component({
	selector: 'ba-picture-uploader',
	encapsulation: ViewEncapsulation.None,
	styles: [require('./baPictureUploader.scss')],
	template: require('./baPictureUploader.html'),
	providers: [Ng2Uploader]
})
export class BaPictureUploader {

	@Input() defaultPicture: string = '';
	@Input() picture: string = '';
	@Input() maxSize: number = 0;
	@Output() pictureChange: EventEmitter<{}> = new EventEmitter();
	@Output() pictureSizeExceeded: EventEmitter<{}> = new EventEmitter();

	@Input() uploaderOptions: any = {};
	@Input() canDelete: boolean = true;

	onUpload: EventEmitter<any> = new EventEmitter();
	onUploadCompleted: EventEmitter<any> = new EventEmitter();

	@ViewChild('fileUpload') protected _fileUpload: ElementRef;

	public uploadInProgress: boolean = false;
	public touched: boolean = false;
	public pictureChanged: boolean = false;

	constructor(private renderer: Renderer, protected _uploader: Ng2Uploader) {
	}

	public ngOnInit(): void {
		if (this._canUploadOnServer()) {
			setTimeout(() => {
				this._uploader.setOptions(this.uploaderOptions);
			});

			this._uploader._emitter.subscribe((data) => {
				this._onUpload(data);
			});
		} else {
			// console.warn('Please specify url parameter to be able to upload the file on the back-end');
		}
	}

	public onFiles(): void {
		let files = this._fileUpload.nativeElement.files;

		if (files.length) {
			const file = files[0];
			var maxFileSize = this.maxSize * 1024 * 1024;
			if (this.maxSize > 0 && file.size > maxFileSize) {
				this.pictureSizeExceeded.emit(file.size);
				return;
			}
			this._changePicture(file);

			if (this._canUploadOnServer()) {
				this.uploadInProgress = true;
				this._uploader.addFilesToQueue(files);
			}
		}
	}

	public bringFileSelector(): boolean {
		this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
		this.touched = true;
		return false;
	}

	public removePicture(): boolean {
		this.picture = '';
		this.pictureChange.emit(this.picture);
		this._fileUpload.nativeElement.value = '';
		return false;
	}

	protected _changePicture(file: File): void {
		const reader = new FileReader();
		reader.addEventListener('load', (event: Event) => {
			this.picture = (<any>event.target).result;
			this.pictureChanged = true;
			this.pictureChange.emit(this.picture);
		}, false);
		reader.readAsDataURL(file);
	}

	protected _onUpload(data): void {
		if (data['done'] || data['abort'] || data['error']) {
			this._onUploadCompleted(data);
		} else {
			this.onUpload.emit(data);
		}
	}

	protected _onUploadCompleted(data): void {
		this.uploadInProgress = false;
		this.onUploadCompleted.emit(data);
	}

	protected _canUploadOnServer(): boolean {
		return !!this.uploaderOptions['url'];
	}

	public reset() {
		this.removePicture();
		this.touched = false;
		this.pictureChanged = false;
	}
}
