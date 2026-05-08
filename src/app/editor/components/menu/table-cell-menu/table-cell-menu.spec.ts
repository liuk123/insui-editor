import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellMenu } from './table-cell-menu';

describe('TableCellMenu', () => {
  let component: TableCellMenu;
  let fixture: ComponentFixture<TableCellMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCellMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
