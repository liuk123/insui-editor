import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableColMenu } from './table-col-menu';

describe('TableColMenu', () => {
  let component: TableColMenu;
  let fixture: ComponentFixture<TableColMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableColMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableColMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
