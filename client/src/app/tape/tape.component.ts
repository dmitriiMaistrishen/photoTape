import { Component, OnInit } from '@angular/core';

import { Mainlib } from '../model/mainlib.model';
import { InteractionService } from '../interaction.service';

@Component({
  selector: 'app-tape',
  templateUrl: './tape.component.html',
  styleUrls: ['./tape.component.css']
})
export class TapeComponent implements OnInit {

  public commentText: string = '';
  public commentFiles = [];

  public commentablePost: string = '';
  constructor(public mainlib: Mainlib, public interaction: InteractionService){};

  ngOnInit(){
  	this.mainlib.refresh();
  	this.mainlib.refreshEveryNsec(5);
  }

  onChange(event){
    this.commentFiles.push(event.srcElement.files['0']);
  }

  selectPost(id){
    this.commentablePost = id;
    this.commentText = '';
    this.commentFiles = [];
  }

  addComment(id){
    this.mainlib.addComment(id, 'stock', this.commentText, this.commentFiles, '', ()=>{
      this.commentText = '';
      this.commentFiles = [];
    })
  }

  likePost(id){
    this.mainlib.like(id, 'stock', ()=>{})
  }

  dislikePost(id){
    this.mainlib.dislike(id, 'stock', ()=>{})
  }

  likeComment(id){
    this.mainlib.like(id, 'comments', ()=>{})
  }

  dislikeComment(id){
    this.mainlib.dislike(id, 'comments', ()=>{})
  }

  stringify(obj){
  	return JSON.stringify(obj);
  }

}
