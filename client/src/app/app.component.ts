import { Component } from '@angular/core';

import { DataModel } from './model/data.model';
import { Repository } from './model/repository.model';
import { Mainlib } from './model/mainlib.model';
import { InteractionService } from './interaction.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
  	'./app.component.css'
  ]
})
export class AppComponent {
  

  constructor(private data: DataModel, private repository: Repository, private mainlib: Mainlib, public interaction: InteractionService){};



  stringify(obj){
  	return JSON.stringify(obj);
  }

  log(smt){
  	console.log(smt);
  }

  refTest(){
  	this.mainlib.refresh()
  }

  onChange(event) {
    var files = event.srcElement.files;
    console.log(files);
  }
}
