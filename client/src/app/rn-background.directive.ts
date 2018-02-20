import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[rn-background]'
})
export class RnBackgroundDirective {

  constructor(private element: ElementRef) {}

  ngOnInit(){
   	//console.log(this.element.nativeElement.style.width);
   	this.element.nativeElement.style.width = window.innerWidth + "px";
   	this.element.nativeElement.style.height = window.innerHeight + "px";
  }

}
