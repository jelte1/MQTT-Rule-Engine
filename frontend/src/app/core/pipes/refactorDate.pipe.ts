import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
  name: 'refactorDate',
})
export class RefactorDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    const format = 'dd-MM-yyyy HH:mm:ss';

    if (!value) {
      return '';
    }

    const datePipe = new DatePipe('en-EU');
    return datePipe.transform(value, format) || '';
  }
}
