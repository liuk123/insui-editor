import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.less'
})
export class FooterComponent implements OnInit {

  protected sub=''
  private readonly startTime = '2022/02/07'

  ngOnInit(): void {
    const t1 = new Date().getTime() - new Date(this.startTime).getTime()
    const y = Math.floor(t1/1000/60/60/24/365)
    const m = Math.floor(t1/1000/60/60/24/30%12)
    const d = Math.floor(t1/1000/60/60/24%30)
    this.sub = `${y}年${m}月${d}天`
  }
}
