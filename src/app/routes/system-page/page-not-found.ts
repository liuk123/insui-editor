import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  
  template: `
    页面没有找到 404
    <div>
      <a href="/">返回首页</a><br/>
      <a href="javascript:void(0)" onclick="history.back()">返回上一页</a>
    </div>
  `,
  styles: [`
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent {}
