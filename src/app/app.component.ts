import { Component } from '@angular/core';
import { Platform, Events, AlertController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ItemsService } from './services/items.services';
import { NetworkProvider } from './services/network.services';
import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html',
  providers: [ ItemsService, NetworkProvider ]
})
export class MyApp {
  rootPage:any = TabsPage;
  sqlite: SQLite;

  constructor(platform: Platform,
              events: Events,
              network: Network,
              networkProvider: NetworkProvider,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              public alertCtrl: AlertController,
              sqlite : SQLite) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.sqlite = sqlite;
      statusBar.styleDefault();

      this.sqlite.create({
        name: 'data.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
          db.executeSql("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)", {} as any).then((data) => {
              console.log("Item TABLE CREATED: ", data);
          }, (error) => {
              console.error("Unable to execute sql", error);
          })
          db.executeSql("CREATE TABLE IF NOT EXISTS drafts (id INTEGER PRIMARY KEY, name TEXT, quantity INTEGER)", {} as any).then((data) => {
              console.log("Drafts TABLE CREATED: ", data);
          }, (error) => {
              console.error("Unable to execute sql", error);
          })
      }, (error) => {
          console.error("Unable to open database", error);
      });


      splashScreen.hide();

      networkProvider.initializeNetworkEvents();

      // Offline event
			events.subscribe('network:offline', () => {
			    // alert('You are Offline '+ network.type);
           const alert = this.alertCtrl.create({
             title: 'Offline!',
             subTitle: "You are offline ",
             buttons: ['OK']
           });
           alert.present();
		  });

	    // Online event
			events.subscribe('network:online', () => {
			     //alert('Yay Online on '+ network.type);
           const alert = this.alertCtrl.create({
             title: 'Online!',
             subTitle: "You are back online ",
             buttons: ['OK']
           });
           alert.present();
			});

    });
  }
}
