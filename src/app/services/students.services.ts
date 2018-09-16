import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions  } from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class StudentsService {
  http: any;
  url: string;
  fetchUrl: string;
  postUrl: string;

  constructor(http: Http){
    this.http = http;
    this.fetchUrl = "http://localhost:3000/students";
    this.postUrl = "http://localhost:3000/passed"
  }

  getStudents() {
    return this.http.get(this.fetchUrl).map(res => res.json());
  }

  deleteStudent(i) {
    return this.http.delete(this.fetchUrl + "/" + i).map(res => res.json());
  }

  postPassed(data: any = {}) {
    console.log("Posting Passed: ");
    var headers = new Headers();
    headers.append('Content-Type', 'application/json' );
    const requestOptions = new RequestOptions({ headers: headers });
    return this.http.post(this.postUrl, JSON.stringify(data), requestOptions).map(res => res.json());
  }
}
