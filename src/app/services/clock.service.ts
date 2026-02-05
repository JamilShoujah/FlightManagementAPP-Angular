import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly _now$ = new BehaviorSubject<Date>(new Date());
  readonly now$ = this._now$.asObservable();

  constructor() {
    interval(1000).subscribe(() => {
      this._now$.next(new Date());
    });
  }
}
