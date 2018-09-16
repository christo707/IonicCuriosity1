import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular'
import { StudentsService } from '../../app/services/students.services';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  students: any;

  constructor(public navCtrl: NavController, private studentsService: StudentsService, public alertCtrl: AlertController) {

  }

  fetchStudents() {
    this.students = [];
    this.studentsService.getStudents().subscribe(response => {
      this.students = response;
    });
  }

  ngOnInit() {
    this.fetchStudents();
  }

  showConfirm(stu) {
    const alert = this.alertCtrl.create({
      title: 'Student Passed!',
      subTitle: stu.name + " with Roll Number: " + stu.roll + " Passed.",
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

  showPrompt(student) {
    console.log(student);
    const prompt = this.alertCtrl.create({
      title: 'Passing Confirmation',
      message: "Enter roll number for " + student.name + " of " + student.stream + " Stream to confirm Passing",
      inputs: [
        {
          name: 'Roll',
          placeholder: 'Roll Number'
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
            student = {...student, roll: data.Roll};
            console.log('Saved clicked');
            this.studentsService.postPassed(student).subscribe(response => {
              if(response!= null){
                this.showConfirm(student);
                this.studentsService.deleteStudent(student.id).subscribe(response => {
                  console.log('Student deleted from fetch');
                  this.fetchStudents();
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
