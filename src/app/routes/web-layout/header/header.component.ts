import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingService, ThemeOptions } from '../../../biz/service/setting.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { InsButton, InsDataList, InsDropdown, InsIcon } from '@liuk123/insui';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.less',
  imports: [
    InsButton,
    InsDropdown,
    InsDataList,
    InsIcon,
    FormsModule,
  ],
})
export class HeaderComponent {
  private settingSrv = inject(SettingService)
  protected logo = '/assets/favicons/logo.svg'
  
  public themeOpen = signal(false)
  public curTheme = toSignal(this.settingSrv.theme$)
  public curThemeIcon = computed(()=>{
    return this.curTheme() === 'light'?'sun':this.curTheme() === 'dark'?'moon': 'eclipse'
  })
  public size:'s'|'m'|'l' = 'm'

  themeBtns: {label: string, code: ThemeOptions, icon:string}[]=[
    {
      label: '亮主题',
      code: 'light',
      icon: 'sun'
    },{
      label: '暗主题',
      code: 'dark',
      icon: 'moon'
    },{
      label: '跟随系统',
      code: 'sys',
      icon: 'sun-moon'
    }
  ]
  
  changeTheme(v:ThemeOptions){
    this.settingSrv.setTheme(v)
    this.themeOpen.set(false)
  }

}
