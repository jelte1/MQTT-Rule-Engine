import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {Sort} from '@angular/material/sort';
import {debounceTime, distinctUntilChanged, Observable, Subject} from 'rxjs';
import {PAGE_SIZE_OPTIONS, PageModel, TablePageModel} from '../../../models/table-page.model';
import {MatTableDataSource} from '@angular/material/table';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-base-table',
  imports: [],
  templateUrl: './base-table.html',
  styleUrl: './base-table.css',
})

export abstract class BaseTable<T> implements OnInit {
  private destroyRef = inject(DestroyRef);
  private filterSubject = new Subject<string>();

  protected readonly PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

  loading = signal(false);
  tablePage = signal<TablePageModel>({
    pageNumber: 0,
    pageSize: PAGE_SIZE_OPTIONS.MEDIUM,
    sortingField: this.defaultSortField(),
    sortingOrder: 'desc',
    filterQuery: '',
    totalItems: 0
  });

  dataSource = new MatTableDataSource<T>();

  // if no field given; then default to id
  protected defaultSortField(): string {
    return 'id';
  }

  // fetch data based on page model from the extending class
  protected abstract fetchPage(page: TablePageModel): Observable<PageModel<T>>;

  ngOnInit(): void {
    this.filterSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.tablePage.update(tp => ({
        ...tp,
        filterQuery: value,
        pageNumber: 0
      }));
      this.load();
    });

    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.fetchPage(this.tablePage()).subscribe({
      next: ({data, total}) => {
        this.dataSource.data = data;
        this.tablePage.update(tp => ({
          ...tp,
          totalItems: total
        }));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: PageEvent): void {
    this.tablePage.update(tp => ({
      ...tp,
      pageNumber: event.pageIndex,
      pageSize: event.pageSize
    }));
    this.load();
  }

  onSortChange(sort: Sort): void {
    this.tablePage.update(tp => ({
      ...tp,
      sortingField: sort.active,
      sortingOrder: sort.direction,
      pageNumber: 0
    }));
    this.load();
  }

  onFilterChange(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterSubject.next(value);
  }
}
