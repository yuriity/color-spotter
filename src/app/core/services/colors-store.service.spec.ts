import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import * as tinycolor from 'tinycolor2';

import { ColorsStoreService } from './colors-store.service';
import { Color } from '../model/color.model';

const COLORS: Color[] = [
  {
    name: 'name_gray',
    type: 'gray',
    value: tinycolor('#000000'),
    contrastRatio: 21
  },
  {
    name: 'name_green',
    type: 'green',
    value: tinycolor('#00ff00'),
    contrastRatio: 12
  },
  {
    name: 'name_red',
    type: 'red',
    value: tinycolor('#ff0000'),
    contrastRatio: 8
  },
  {
    name: 'name_blue',
    type: 'blue',
    value: tinycolor('#0000ff'),
    contrastRatio: 1
  }
];

function setup(): { colorsStoreService: ColorsStoreService } {
  TestBed.configureTestingModule({
    providers: [ColorsStoreService]
  });

  const colorsStoreService = TestBed.get(ColorsStoreService);

  return { colorsStoreService };
}

describe('ColorsStoreService', () => {
  it('should be created', () => {
    const { colorsStoreService } = setup();

    expect(colorsStoreService).toBeTruthy();
    expect(colorsStoreService.background.toHexString()).toBe('#ffffff');
  });

  describe('setColors(colors: Color[])', () => {
    it('should update colors', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.allColors$.subscribe(colors => {
        expect(colors.length).toBe(4);

        const actual = colors.find(c => c.name === 'name_gray');

        expect(actual.type).toBe('gray');
        expect(actual.value.toHexString()).toBe('#000000');
        expect(actual.contrastRatio).toBe(21);
      });
      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(4);
        expect(colors).toContain(COLORS[0]);
      });

      tick();
    }));
  });

  describe('set background(value: Tinycolor)', () => {
    it('should update contrastRatio', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.background = tinycolor('#000000');

      colorsStoreService.allColors$.subscribe(colors => {
        const actual = colors.find(c => c.name === 'name_gray');

        expect(actual.contrastRatio).toBe(1);
      });

      tick();
    }));
  });

  describe('addFilterByColorTypeCriteria(criteria: ColorType)', () => {
    it('should change filtered colors', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.addFilterByColorTypeCriteria('red');

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(1);

        const actual = colors.find(c => c.type === 'red');
        expect(actual).toBeTruthy();
      });

      tick();
    }));
  });

  describe('removeFilterByColorTypeCriteria(criteria: ColorType)', () => {
    it('should change filtered colors', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.addFilterByColorTypeCriteria('red');
      colorsStoreService.removeFilterByColorTypeCriteria('red');

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(4);
      });

      tick();
    }));
  });

  describe('setContrastRange(min: number, max: number)', () => {
    it('should filter colors by min value', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(8, 21);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(3);
      });

      tick();
    }));

    it('should filter colors by max value', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(1, 12);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(3);
      });

      tick();
    }));

    it('should filter colors by min and max value (1)', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(8, 12);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(2);
      });

      tick();
    }));

    it('should filter colors by min and max value (2)', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(12, 12);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(1);
        expect(colors[0].name).toBe('name_green');
      });

      tick();
    }));

    it('should normalize min and max value if they reversed', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(12, 8);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(2);
      });

      tick();
    }));

    it('should normalize min and max value if they greater than MAX_CONTRAST', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(1200, 800);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(1);
        expect(colors[0].name).toBe('name_gray');
      });

      tick();
    }));

    it('should normalize min and max value if they less than MIN_CONTRAST', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(-1200, -800);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(1);
        expect(colors[0].name).toBe('name_blue');
      });

      tick();
    }));

    it('should normalize min value', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(1200, 21);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(1);
        expect(colors[0].name).toBe('name_gray');
      });

      tick();
    }));

    it('should normalize max value', fakeAsync(() => {
      const { colorsStoreService } = setup();
      colorsStoreService.setColors(COLORS);

      colorsStoreService.setContrastRange(1, -21);

      colorsStoreService.filteredColors$.subscribe(colors => {
        expect(colors.length).toBe(1);
        expect(colors[0].name).toBe('name_blue');
      });

      tick();
    }));
  });
});
