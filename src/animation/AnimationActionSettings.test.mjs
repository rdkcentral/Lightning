import { describe, it, expect, vi } from 'vitest';
import AnimationActionSettings from './AnimationActionSettings.mjs';

describe('AnimationActionSettings', () => {
  it('resolves selector path', () => {
    const mockResult = [{}];
    const mockElement = {
      select: vi.fn().mockImplementation(() => mockResult)
    };

    const aas = new AnimationActionSettings();
    aas.t = 'some.path';

    const actual = aas.getAnimatedElements(mockElement);

    expect(mockElement.select).toHaveBeenCalledWith('some.path');
    expect(actual).toBe(mockResult);
  });

  it('acceptes selector by reference', () => {
    const mockTarget = {};
    const mockElement = {
      select: vi.fn()
    };

    const aas = new AnimationActionSettings();
    aas.t = mockTarget;

    const actual = aas.getAnimatedElements(mockElement);
    expect(mockElement.select).not.toHaveBeenCalled();
    expect(actual[0]).toBe(mockTarget);
  })
});
