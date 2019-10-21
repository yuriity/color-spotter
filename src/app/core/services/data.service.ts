import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as tinycolor from 'tinycolor2';

import { Color, ColorType } from '../model/color.model';
import { Tinycolor } from '../model/tinycolor.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  getColors(background: Tinycolor): Observable<Color[]> {
    return this.http
      .get<{ type: ColorType; hex: string; name: string }[]>('assets/data/colors.json')
      .pipe(
        map(colors => {
          return colors.map(color => {
            const value = tinycolor(color.hex);
            const contrastRatio = tinycolor.readability(background, value);
            return {
              type: color.type,
              name: color.name,
              value,
              contrastRatio
            };
          });
        })
      );
  }
}
