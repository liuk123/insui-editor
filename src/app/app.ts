import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InsRoot } from '@liuk123/insui';
import { SettingService } from './biz/service/setting.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InsRoot],
  template: `<ins-root ><router-outlet /></ins-root>`,
  host: { 
    '[attr.insTheme]': 'theme()',
   },
})
export class App {
  settingSrv = inject(SettingService)
  theme = toSignal(
    this.settingSrv.theme$.pipe(
      map(v=>v=='sys'?this.settingSrv.getSystemTheme(): v)
    )
  )
}
