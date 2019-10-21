import { Tinycolor } from './tinycolor.model';

export type ColorType = 'red' | 'green' | 'blue' | 'purple' | 'yellow' | 'orange' | 'gray';

export interface Color {
  type: ColorType;
  value: Tinycolor;
  name: string;
  contrastRatio: number;
}
