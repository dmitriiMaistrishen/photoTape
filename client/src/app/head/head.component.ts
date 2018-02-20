import { Component, OnInit } from '@angular/core';

import { Mainlib } from '../model/mainlib.model';
import { InteractionService } from '../interaction.service';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css']
})
export class HeadComponent implements OnInit {

  public userName: string = '';
  public userPassword: string = '';
  constructor(public mainlib: Mainlib, public interaction: InteractionService) {};

  ngOnInit() {}

}
