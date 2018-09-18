import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular'
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ItemsService } from '../../app/services/items.services';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items: any;
  sqlite: SQLite

  constructor(public navCtrl: NavController, private itemsService: ItemsService, public alertCtrl: AlertController) {

  }

  fetchitemsAndSaveLocal() {
    this.items = [];
    this.itemsService.getItems().subscribe(response => {
      this.items = response;
      this.writeData(items);
    },error => {
      console.log("Unable to get response from server");
      this.fetchItemsFromDataBase();
    });
  }


  ngOnInit() {
    this.fetchitemsAndSaveLocal();
  }

  writeData(items){
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      items.forEach((item) => {
        db.executeSql("DELETE * FROM items",{}).then((data) => {
            console.log("Item table cleared: ", data);
            db.executeSql("INSERT INTO items VALUES (?,?)", [ item.id, item.name ]).then((data) => {
                console.log("Item Inserted in item table: ", data);
            }, (error) => {
                console.error("Unable to execute sql of insertion in item", error);
            })
        }, (error) => {
            console.error("Unable to clear item table", error);
        })
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
      db.executeSql('SELECT * FROM items ORDER BY id DESC', {})
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

  deleteItemFromDatabase(id) {
  this.sqlite.create({
    name: 'data.db',
    location: 'default'
  }).then((db: SQLiteObject) => {
    db.executeSql('DELETE FROM items WHERE id=?', [id])
    .then(res => {
      this.items.splice(id,1);
      console.log("ITEM DELETED with id " + id + " : " + res);
    })
    .catch(e => console.log(e));
  }).catch(e => console.log(e));
}

  showConfirm(item) {
    const alert = this.alertCtrl.create({
      title: 'Item Received!',
      subTitle: item.name + " with Quantity: " + item.quantity + " Received.",
      buttons: ['OK']
    });
    alert.present();
  }

  showError() {
    const alert = this.alertCtrl.create({
      title: 'Fail!',
      subTitle: "Internal Error",
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
                this.showConfirm(item);
                this.itemsService.deleteItem(item.id).subscribe(response => {
                  console.log('Item PO deleted from server');
                  deleteItemFromDatabase(item.id);
                });
              }
            }, error => {
              this.showError();
            });
          }
        }
      ]
    });
    prompt.present();
  }

}
