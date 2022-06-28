import CoreContext from '../../../tree/core/CoreContext.mjs';
import DefaultShader from './DefaultShader.mjs';

export default class RoundedRectangleShader extends DefaultShader {
  constructor(coreContext: CoreContext);

  set radius(
    radius:
      | number
      | [number]
      | [number, number]
      | [number, number, number]
      | [number, number, number, number],
  );
  set strokeColor(color: number);
  set fillColor(color: number);
  set stroke(stroke: number);
}
