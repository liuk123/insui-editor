import { Component } from '@angular/core';
import { InsDataList } from '@liuk123/insui';

@Component({
  selector: 'ins-drag-handle-menu',
  imports: [InsDataList],
  templateUrl: './drag-handle-menu.html',
  styleUrl: './drag-handle-menu.less',
})
export class InsDragHandleMenu {
  protected items = [
    {
      key: 'remove',
      icon: 'heading-1',
      name: '删除',
    },
    {
      key: 'clearFormat',
      icon: 'heading-1',
      name: '清除格式',
    },
  ];
  command(item: typeof this.items[0]) {
    console.log(item);
  }
}
