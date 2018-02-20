import { Injectable } from '@angular/core';

@Injectable()
export class InteractionService{

	public displayRegistration: boolean = false;
  	public displayNewPostComponent: boolean = false;

  	constructor(){};

  	changeRegistrationState(){
  		if(this.displayNewPostComponent == true){
  			this.changeNewPostState();
  		}
  		this.displayRegistration = !this.displayRegistration;
  	}

  	changeNewPostState(){
  		if(this.displayRegistration == true){
  			this.changeRegistrationState();
  		}
  		this.displayNewPostComponent = !this.displayNewPostComponent;
  	}
}