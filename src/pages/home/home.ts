import { Component } from '@angular/core';
import { NavController, AlertController, Events} from 'ionic-angular'
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ItemsService } from '../../app/services/items.services';
import { Network } from '@ionic-native/network';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items: any;
  sqlite: SQLite;
  network: any;

  constructor(public navCtrl: NavController,
     private itemsService: ItemsService,
     public alertCtrl: AlertController,
     public events: Events,
     network: Network,
     sqlite : SQLite) {
       this.sqlite = sqlite;
       this.network = network;
  }

  isConnected(): boolean {
    let conntype = this.network.type;
    return conntype && conntype !== 'unknown' && conntype !== 'none';
  }

  fetchitemsAndSaveLocal() {
    this.items = [];
    this.itemsService.getItems().subscribe(response => {
      this.items = response;
      this.writeData(this.items);
    },error => {
      console.log("Unable to get response from server");
      this.fetchItemsFromDataBase();
    });
  }


  ngOnInit() {
    this.fetchitemsAndSaveLocal();
  }

  writeData(itemList){
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      console.log(itemList);
      db.executeSql("delete from items",{} as any).then((data) => {
      console.log("Item table cleared: ", data);
      itemList.forEach((item) => {
        console.log(item);
            db.executeSql("INSERT INTO items VALUES (?,?)", [ item.id, item.name ]).then((data) => {
                console.log("Item Inserted in item table: ", data);
            }, (error) => {
                console.error("Unable to execute sql of insertion in item", error);
            })
        })
      }, (error) => {
          console.error("Unable to clear item table", error);
          if(itemList.length > 0){
            itemList.forEach((item) => {
              console.log(item);
                  db.executeSql("INSERT INTO items VALUES (?,?)", [ item.id, item.name ]).then((data) => {
                      console.log("Item Inserted in item table: ", data);
                  }, (error) => {
                      console.error("Unable to execute sql of insertion in item", error);
                  })
              })
          }

      });
    }, (error) => {
        console.error("Unable to open database", error);
    });
  }

  fetchItemsFromDataBase(){
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM items',{} as any)
    .then(res => {
      console.log("Items Fetched from item table: ", res);
      this.items = [];
      for(var i=0; i<res.rows.length; i++) {
        this.items.push({
          id:res.rows.item(i).id,
          name:res.rows.item(i).name
        })
      }
    })
    .catch(e => console.log("ERROR FETCHING ITEMS FROM LOCAL ITEMS TABLE: " + e));
    }, (error) => {
        console.error("Unable to open database", error);
    });
  }

  writeItemInDraft(item){
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql("INSERT INTO drafts VALUES (?,?,?)", [ item.id, item.name, item.quantity ]).then((data) => {
          this.removeFromArray(item.id);
          console.log("Item Inserted in drafts table: ", data);
      }, (error) => {
          console.error("Unable to execute sql of insertion in drafts", error);
      })
    }, (error) => {
        console.error("Unable to open database", error);
    });
  }

  removeFromArray(id){
    for(var i=0; i < this.items.length; i++) {
      if(this.items[i].id == id)
   {
      this.items.splice(i,1);
      break;
   }
}
  }

  deleteItemFromDatabase(id) {
  this.sqlite.create({
    name: 'data.db',
    location: 'default'
  }).then((db: SQLiteObject) => {
    db.executeSql('DELETE FROM items WHERE id=?', [id])
    .then(res => {
      this.removeFromArray(id);
      console.log("ITEM DELETED with id " + id + " : " + res);
    })
    .catch(e => console.log(e));
  }).catch(e => {console.log("Delete cannot open database" + e);
});
}

  showConfirm(item) {
    const alert = this.alertCtrl.create({
      title: 'Item Received!',
      subTitle: item.name + " with Quantity: " + item.quantity + " Received.",
      buttons: ['OK']
    });
    alert.present();
  }

  showError(msg) {
    const alert = this.alertCtrl.create({
      title: 'Fail!',
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }


  showPrompt(item) {
    console.log(item);
    const prompt = this.alertCtrl.create({
      title: 'Receive Item',
      message: "Enter quantity for " + item.name  + " to confirm Received.",
      inputs: [
        {
          name: 'quantity',
          placeholder: 'Quantity'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            item = {...item, quantity: data.quantity};
            console.log('Saved clicked');
            this.itemsService.postReceived(item).subscribe(response => {
              if(response!= null){
                this.itemsService.deleteItem(item.id).subscribe(response => {
                  console.log('Item PO deleted from server');
                  this.deleteItemFromDatabase(item.id);
                  this.showConfirm(item);
                });
              }
            }, error => {
              this.writeItemInDraft(item);
              this.deleteItemFromDatabase(item.id);
              this.events.publish('draft:created');
              this.showError("Saved In Drafts");
            });
          }
        }
      ]
    });
    prompt.present();
  }

}
