/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { andArrayWith, isArrayOfFunctions, isFunction } from '../../src/utils/utils';

describe('utils', () => {
  describe('isFunction', () => {
    it('should return false if param is not a function', () => {
      expect(isFunction(undefined)).toBeFalsy();
      expect(isFunction(2)).toBeFalsy();
    });

    it('should return true if param is a function', () => {
      expect(
        isFunction(() => {
          //
        })
      ).toBeTruthy();
    });
  });
  describe('andArrayWith', () => {
    it('should apply test function on each element on the array and ANDs the results', () => {
      const biggerThan5 = (a) => a > 5;
      const arr1 = [1, 2, 3, 4];
      const arr2 = [6, 7, 8, 9];
      const arr3 = [6, 7, 2, 8, 9];

      expect(andArrayWith(arr1, biggerThan5)).toBeFalsy();
      expect(andArrayWith(arr2, biggerThan5)).toBeTruthy();
      expect(andArrayWith(arr3, biggerThan5)).toBeFalsy();
    });
  });
  describe('isArrayOfFunctions', () => {
    it('should return false for non array', () => {
      expect(isArrayOfFunctions(3)).toBeFalsy();
    });

    it('should return false for non array of functions', () => {
      expect(isArrayOfFunctions([1, 2])).toBeFalsy();
    });

    it('should return true for an array of functions', () => {
      expect(
        isArrayOfFunctions([
          () => {
            //
          },
          () => {
            //
          },
        ])
      ).toBeTruthy();
    });
  });
});
