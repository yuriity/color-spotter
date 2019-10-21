import { TestBed, tick, fakeAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as tinycolor from 'tinycolor2';

import { DataService } from './data.service';

describe('DataService', () => {
  let httpTestingController: HttpTestingController;
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(DataService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getColors()', () => {
    it('should return proper data', fakeAsync(() => {
      const mockColors = [
        {
          name: 'name_gray',
          type: 'gray',
          value: '#000000'
        },
        {
          type: 'red',
          hex: '#ff0000',
          name: 'name_red'
        }
      ];

      service.getColors(tinycolor('#ffffff')).subscribe(colors => {
        expect(colors.length).toBe(2);

        const actualGray = colors.find(c => c.name === 'name_gray');

        expect(actualGray.type).toBe('gray');
        expect(actualGray.value.toHexString()).toBe('#000000');
        expect(actualGray.contrastRatio).toBe(21);

        const actualRed = colors.find(c => c.name === 'name_red');

        expect(actualRed.type).toBe('red');
        expect(actualRed.value.toHexString()).toBe('#ff0000');
      });

      const req = httpTestingController.expectOne('assets/data/colors.json');

      expect(req.request.method).toBe('GET');

      req.flush(mockColors);

      tick();
    }));
  });
});
