import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

/* Import Http Client */
import { HttpClientModule } from '@angular/common/http';

/* Import Geolocation JS */
import { Geolocation } from '@ionic-native/geolocation';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

/* Import Service */
import { ApiProvider } from '../providers/api/api';

/* LocalStorage */
import { IonicStorageModule } from '@ionic/storage';
import { LocalstorageProvider } from '../providers/localstorage/localstorage';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    LocalstorageProvider
  ]
})
export class AppModule {}
