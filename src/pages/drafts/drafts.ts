import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular'
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ItemsService } from '../../app/services/items.services';
import { Network } from '@ionic-native/network';
import { NetworkProvider } from '../../app/services/network.services';

@Component({
  selector: 'page-drafts',
  templateUrl: 'drafts.html'
})
export class DraftsPage {
  public drafts: any;
  sqlite: SQLite;
  network: any;

  constructor(public navCtrl: NavController,
     private itemsService: ItemsService,
     public alertCtrl: AlertController,
     network: Network,
     public networkProvider: NetworkProvider,
     public events: Events,
     sqlite : SQLite) {
       this.sqlite = sqlite;
       this.network = network;

       // Online event
       events.subscribe('network:online', () => {
       console.log("In Push Drafts");
       this.sqlite.create({
         name: 'data.db',
         location: 'default'
       }).then((db: SQLiteObject) => {
         db.executeSql('SELECT * FROM drafts',{} as any)
       .then(res => {
         console.log("Items Fetched from Drafts table: ", res);
         for(var i=0; i < res.rows.length; i++) {

           let draft = {
             id: res.rows.item(i).id,
             name: res.rows.item(i).name,
             quantity: res.rows.item(i).quantity
           };

           this.itemsService.postReceived(draft).subscribe(response => {
             if(response!= null){
               this.itemsService.deleteItem(draft.id).subscribe(response => {
                 console.log('Draft PO deleted from server');
                 this.deleteItemFromDraftsDatabase(draft.id);
                 this.removeFromDraftsArray(draft.id);
               });
             }
           }, error => {
           console.log("Cannot Upload Draft with ID: " + draft.id);
           });
         }
       })
       .catch(e => console.log("ERROR FETCHING ITEMS FROM LOCAL Drafts TABLE: " + e));
       }, (error) => {
           console.error("Unable to open database", error);
       });
     });

     events.subscribe('draft:created', () => {
      this.fetchitemsAndSaveLocal();
     })

  }

  isConnected(): boolean {
    let conntype = this.network.type;
    return conntype && conntype !== 'unknown' && conntype !== 'none';
  }

  fetchitemsAndSaveLocal() {
    this.drafts = [];
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM drafts',{} as any)
    .then(res => {
      console.log("Items Fetched from Drafts table: ", res);
      this.drafts = [];
      for(var i=0; i < res.rows.length; i++) {
        this.drafts.push({
          id: res.rows.item(i).id,
          name: res.rows.item(i).name,
          quantity: res.rows.item(i).quantity
        })
      }
    })
    .catch(e => console.log("ERROR FETCHING ITEMS FROM LOCAL Drafts TABLE: " + e));
    }, (error) => {
        console.error("Unable to open database", error);
    });
  }


  ngOnInit() {
    this.fetchitemsAndSaveLocal();
  }

  removeFromDraftsArray(id){
    for(var i=0; i < this.drafts.length; i++) {
      if(this.drafts[i].id == id)
   {
      this.drafts.splice(i,1);
      break;
   }
}
  }

deleteItemFromDraftsDatabase(id) {
this.sqlite.create({
  name: 'data.db',
  location: 'default'
}).then((db: SQLiteObject) => {
  db.executeSql('DELETE FROM drafts WHERE id=?', [id])
  .then(res => {
    this.removeFromDraftsArray(id);
    console.log("DRAFT DELETED with id " + id + " : " + res);
  })
  .catch(e => console.log(e));
}).catch(e => {console.log("Delete cannot open draft database" + e);
});
}

pushDrafts() {
  console.log("In Push Drafts");
  this.sqlite.create({
    name: 'data.db',
    location: 'default'
  }).then((db: SQLiteObject) => {
    db.executeSql('SELECT * FROM drafts',{} as any)
  .then(res => {
    console.log("Items Fetched from Drafts table: ", res);
    for(var i=0; i < res.rows.length; i++) {

      let draft = {
        id: res.rows.item(i).id,
        name: res.rows.item(i).name,
        quantity: res.rows.item(i).quantity
      };

      this.itemsService.postReceived(draft).subscribe(response => {
        if(response!= null){
          this.itemsService.deleteItem(draft.id).subscribe(response => {
            console.log('Draft PO deleted from server');
            this.deleteItemFromDraftsDatabase(draft.id);
            this.removeFromDraftsArray(draft.id);
          });
        }
      }, error => {
      console.log("Cannot Upload Draft with ID: " + draft.id);
      });
    }
  })
  .catch(e => console.log("ERROR FETCHING ITEMS FROM LOCAL Drafts TABLE: " + e));
  }, (error) => {
      console.error("Unable to open database", error);
  });
}

}
