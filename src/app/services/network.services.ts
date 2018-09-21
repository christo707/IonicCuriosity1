import { Injectable } from '@angular/core';
import { AlertController, Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';

export enum ConnectionStatusEnum {
    Online,
    Offline
}


@Injectable()
export class NetworkProvider {

  public previousStatus;

  constructor(public alertCtrl: AlertController,
              public network: Network,
              public eventCtrl: Events) {

    console.log('Hello NetworkProvider Provider');

    let conntype = this.network.type;
    let status = conntype && conntype !== 'unknown' && conntype !== 'none';

    if(status)
      this.previousStatus = ConnectionStatusEnum.Online;
    else
      this.previousStatus = ConnectionStatusEnum.Offline;
  }

    public initializeNetworkEvents(): void {
        this.network.onDisconnect().subscribe(() => {
            if (this.previousStatus === ConnectionStatusEnum.Online) {
                this.eventCtrl.publish('network:offline');
            }
            this.previousStatus = ConnectionStatusEnum.Offline;
        });
        this.network.onConnect().subscribe(() => {
            if (this.previousStatus === ConnectionStatusEnum.Offline) {
                this.eventCtrl.publish('network:online');
            }
            this.previousStatus = ConnectionStatusEnum.Online;
        });
    }

    getNetworkStatus(){
      return this.previousStatus;
    }

}
