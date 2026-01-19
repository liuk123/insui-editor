import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject, fromEvent, map } from "rxjs";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { LOCAL_STORAGE } from "@liuk123/insui";

export type ThemeOptions = 'light' | 'dark' | 'sys'
@Injectable({
  providedIn: "root"
})
export class SettingService {

  private platformId = inject(PLATFORM_ID)
  private localStorage = inject(LOCAL_STORAGE)

  // 主题
  private themeSubject = new BehaviorSubject<ThemeOptions>(this.localStorage?.getItem('theme') as ThemeOptions ?? 'sys')
  public theme$ = this.themeSubject.asObservable()
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      fromEvent(window.matchMedia('(prefers-color-scheme: dark)'), 'change').pipe(
        map((e: any) => e.matches ? 'dark' : 'light'),
      ).subscribe((theme) => this.themeSubject.next(theme))
    }
  }

  public setTheme(theme: ThemeOptions) {
    this.themeSubject.next(theme)
    this.localStorage?.setItem('theme', theme)
  }

  // 语言
  private lang = new BehaviorSubject('cn')
  public lang$ = this.lang.asObservable()

  public setLang(lang: string) {
    this.lang.next(lang)
  }
  public getLang() {
    return this.lang.getValue()
  }

  public getSystemTheme(): string {
    if (isPlatformServer(this.platformId)) {
      return 'light'; // SSR 默认返回 light
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}