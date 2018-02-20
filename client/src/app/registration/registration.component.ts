import { Component, OnInit } from '@angular/core';

import { Mainlib } from '../model/mainlib.model';
import { InteractionService } from '../interaction.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  public newUserName: string = '';
  public newUserPassword: string  = '';
  constructor(public mainlib: Mainlib, public interaction: InteractionService){};

  register(){
  	this.mainlib.registerUser(this.newUserName, this.newUserPassword, ()=>{
  		this.interaction.changeRegistrationState();
  	})  
  }

  ngOnInit() {}

}
