import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import * as tinycolor from 'tinycolor2';

import { Tinycolor } from '../model/tinycolor.model';
import { Color, ColorType } from '../model/color.model';

export const MIN_CONTRAST = 1;
export const MAX_CONTRAST = 21;

interface FilterQuery {
  byColorType: ColorType[];
  minContrast: number;
  maxContrast: number;
}

@Injectable({
  providedIn: 'root'
})
export class ColorsStoreService {
  private readonly _colors = new BehaviorSubject<Color[]>([]);
  private readonly _filterQuery = new BehaviorSubject<FilterQuery>({
    byColorType: [],
    minContrast: 1,
    maxContrast: 21
  });
  private _background: Tinycolor = tinycolor('#ffffff');

  readonly allColors$ = this._colors.asObservable();
  readonly filteredColors$ = combineLatest([this._colors, this._filterQuery]).pipe(
    map(combined => this.filterColors(combined[0], combined[1]))
  );

  get background(): Tinycolor {
    return this._background;
  }

  set background(value: Tinycolor) {
    if (this._background === value) {
      return;
    }

    this._background = value;
    this.updateContrastRatio(this._colors.getValue());
  }

  constructor() {}

  setColors(colors: Color[]) {
    this._colors.next(colors);
  }

  setContrastRange(min: number, max: number) {
    const filterQuery = this._filterQuery.getValue();
    const minValue = this.normalizeMinContrast(min, max);
    const maxValue = this.normalizeMaxContrast(min, max);

    if (minValue !== filterQuery.minContrast || maxValue !== filterQuery.maxContrast) {
      this._filterQuery.next({
        ...filterQuery,
        minContrast: minValue,
        maxContrast: maxValue
      });
    }
  }

  addFilterByColorTypeCriteria(criteria: ColorType) {
    if (!criteria) {
      return;
    }

    const filterQuery = this._filterQuery.getValue();
    if (!filterQuery.byColorType.includes(criteria)) {
      this._filterQuery.next({
        ...filterQuery,
        byColorType: [...filterQuery.byColorType, criteria]
      });
    }
  }

  removeFilterByColorTypeCriteria(criteria: ColorType) {
    if (!criteria) {
      return;
    }

    const filterQuery = this._filterQuery.getValue();
    const newByColorType = filterQuery.byColorType.filter(c => c !== criteria);

    if (filterQuery.byColorType.length !== newByColorType.length) {
      this._filterQuery.next({ ...filterQuery, byColorType: newByColorType });
    }
  }

  private filterColors(colors: Color[], filter: FilterQuery) {
    return colors.filter(color => {
      if (filter.byColorType.length === 0 && filter.minContrast <= 1 && filter.maxContrast >= 21) {
        return true;
      }

      if (filter.byColorType.length === 0) {
        return (
          color.contrastRatio >= filter.minContrast && color.contrastRatio <= filter.maxContrast
        );
      }
      return (
        filter.byColorType.includes(color.type) &&
        color.contrastRatio >= filter.minContrast &&
        color.contrastRatio <= filter.maxContrast
      );
    });
  }

  private normalizeMinContrast(min: number, max: number): number {
    let minValue = min < max ? min : max;
    if (minValue > MAX_CONTRAST) {
      minValue = MAX_CONTRAST;
    }
    if (minValue < MIN_CONTRAST) {
      minValue = MIN_CONTRAST;
    }

    return minValue;
  }

  private normalizeMaxContrast(min: number, max: number): number {
    let maxValue = min < max ? max : min;
    if (maxValue > MAX_CONTRAST) {
      maxValue = MAX_CONTRAST;
    }
    if (maxValue < MIN_CONTRAST) {
      maxValue = MIN_CONTRAST;
    }

    return maxValue;
  }

  private updateContrastRatio(colors: Color[]) {
    const updatedColors = colors.map(color => {
      return { ...color, contrastRatio: tinycolor.readability(this._background, color.value) };
    });
    this._colors.next(updatedColors);
  }
}
