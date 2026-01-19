import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { InsSquiggle } from '../../shared/components/squiggle/squiggle.component';

@Component({
  selector: 'app-web-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent,InsSquiggle],
  templateUrl: './web-layout.component.html',
  styleUrl: './web-layout.component.less'
})
export class WebLayoutComponent {

}
