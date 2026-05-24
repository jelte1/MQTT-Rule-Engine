import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
// import {provideNoAnimations} from '@angular/platform-browser/animations';
import {of} from 'rxjs';
import {BaseTable} from './base-table';
import {TablePageModel} from '../../../models/table-page.model';

// Example table for testing the base table
@Component({
  selector: 'app-test-table',
  template: '',
  imports: []
})
class TestTable extends BaseTable<{ id: number }> {
  protected override fetchPage(page: TablePageModel) {
    return of({ data: [], total: 0 });
  }
}

describe('BaseTable (via TestTable)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTable],
    }).compileComponents();
  });

  it('should initialise with default page settings', async () => {
    const fixture = TestBed.createComponent(TestTable);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component.tablePage().pageNumber).toBe(0);
    expect(component.tablePage().pageSize).toBe(10);
    expect(component.loading()).toBe(false);
  });

  it('defaultSortField should return "id"', () => {
    const fixture = TestBed.createComponent(TestTable);
    expect((fixture.componentInstance as any).defaultSortField()).toBe('id');
  });

  it('defaultSortOrder should return "desc"', () => {
    const fixture = TestBed.createComponent(TestTable);
    expect((fixture.componentInstance as any).defaultSortOrder()).toBe('desc');
  });

  it('load() should call fetchPage and fill dataSource', async () => {
    const fixture = TestBed.createComponent(TestTable);
    const component = fixture.componentInstance;
    const fetchSpy = vi.spyOn(component as any, 'fetchPage').mockReturnValue(
      of({ data: [{ id: 1 }, { id: 2 }], total: 2 })
    );
    await fixture.whenStable();

    component.load();
    await fixture.whenStable();

    expect(fetchSpy).toHaveBeenCalled();
    expect(component.dataSource.data).toHaveLength(2);
    expect(component.tablePage().totalItems).toBe(2);
  });

  // check page change returns correct page settings (index, size, length)
  it('onPageChange() should update page settings and reload', async () => {
    const fixture = TestBed.createComponent(TestTable);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    const reloadSpy = vi.spyOn(component, 'load');

    component.onPageChange({ pageIndex: 2, pageSize: 20, length: 100 });

    expect(component.tablePage().pageNumber).toBe(2);
    expect(component.tablePage().pageSize).toBe(20);
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('onSortChange() should update sort settings and reload', async () => {
    const fixture = TestBed.createComponent(TestTable);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    const reloadSpy = vi.spyOn(component, 'load');

    component.onSortChange({ active: 'name', direction: 'asc' });

    expect(component.tablePage().sortingField).toBe('name');
    expect(component.tablePage().sortingOrder).toBe('asc');
    expect(component.tablePage().pageNumber).toBe(0);
    expect(reloadSpy).toHaveBeenCalled();
  });
});
