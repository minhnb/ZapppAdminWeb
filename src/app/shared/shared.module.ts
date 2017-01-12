import { NgModule } from '@angular/core';
import { ZapppHttp } from '../services/zapppHttp';
import { ZapppAlert } from '../helper/zapppAlert';

@NgModule({
  providers: [ZapppHttp, ZapppAlert],
})
export class SharedModule {}
