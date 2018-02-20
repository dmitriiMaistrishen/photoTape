import { Component, OnInit } from '@angular/core';

import { Mainlib } from '../model/mainlib.model';
import { InteractionService } from '../interaction.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css']
})
export class NewPostComponent implements OnInit {

  public text: string = '';
  public files = [];
  constructor(public mainlib: Mainlib, public interaction: InteractionService) {}

  ngOnInit() {}

  onChange(event){
    this.files.push(event.srcElement.files['0']);
  }

  add(){
    this.mainlib.addPost(this.text, this.files, ()=>{
      this.interaction.changeNewPostState();
    })
  }

}
