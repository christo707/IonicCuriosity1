import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
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
      }, (error) => {
          console.error("Unable to open database", error);
      });

      splashScreen.hide();

      networkProvider.initializeNetworkEvents();

      // Offline event
			events.subscribe('network:offline', () => {
			     alert('network:offline ==> '+ network.type);
		  });

	    // Online event
			events.subscribe('network:online', () => {
			     alert('network:online ==> '+ network.type);
			});

    });
  }
}
