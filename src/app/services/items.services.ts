import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions  } from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class ItemsService {
  http: any;
  url: string;
  fetchUrl: string;
  postUrl: string;

  constructor(http: Http){
    this.http = http;
  //  this.fetchUrl = "https://my-json-server.typicode.com/christo707/FakeJsonServer/items";
  //  this.postUrl = "https://my-json-server.typicode.com/christo707/FakeJsonServer/received"
      this.fetchUrl = "http://10.0.2.2:3000/items";
      this.postUrl = "http://10.0.2.2:3000/received";
  }

  getItems() {
    return this.http.get(this.fetchUrl).map(res => res.json());
  }

  deleteItem(i) {
    return this.http.delete(this.fetchUrl + "/" + i).map(res => res.json());
  }

  postReceived(data: any = {}) {
    console.log("Posting Received: ");
    var headers = new Headers();
    headers.append('Content-Type', 'application/json' );
    const requestOptions = new RequestOptions({ headers: headers });
    return this.http.post(this.postUrl, JSON.stringify(data), requestOptions).map(res => res.json());
  }
}
