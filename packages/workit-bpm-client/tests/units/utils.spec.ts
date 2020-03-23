/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Utils } from '../../src/utils/utils';

describe('utils', () => {
  describe('serializeVariable', () => {
    it('value should remain the same if type is neither json nor date', () => {
      // given
      const typedValue = { value: 21, type: 'integer', valueInfo: {} };

      // then
      expect(Utils.serializeVariable({ typedValue })).toMatchObject(typedValue);
    });

    it('value should be stringifyed if type is JSON and value is not a string', () => {
      // given
      const parsedValue = { x: 10 };
      const typedValue = {
        value: parsedValue,
        type: 'json',
        valueInfo: {}
      };
      const expectedTypedValue = {
        ...typedValue,
        value: JSON.stringify(parsedValue)
      };

      // then
      expect(Utils.serializeVariable({ typedValue })).toMatchObject(expectedTypedValue);
    });

    it('value should remain the same if type is JSON and value is a string', () => {
      // given
      const value = JSON.stringify({ x: 10 });
      const typedValue = {
        value,
        type: 'json',
        valueInfo: {}
      };

      // then
      expect(Utils.serializeVariable({ typedValue })).toMatchObject(typedValue);
    });

    it('value should be converted to proper formatted string if type is date and value is an instance of date', () => {
      // given
      const dateStr = '2013-06-30T21:04:22.000+0200';
      const formattedDate = '2013-06-30T19:04:22.000UTC+00:00';
      const dateObj = new Date(dateStr);
      const typedValue = {
        value: dateObj,
        type: 'Date',
        valueInfo: {}
      };

      // then
      expect(Utils.serializeVariable({ typedValue }).value).toBe(formattedDate);
    });
  });
  describe('serializeVariables', () => {
    it('value should remain the same if type is neither json nor date', () => {
      // given
      const typedValue = { value: 21, type: 'integer', valueInfo: {} };

      // then
      expect(Utils.serializeVariables({ a: typedValue.value })).toMatchObject({ a: typedValue });
    });

    it('value should be stringifyed if type is JSON and value is not a string', () => {
      // given
      const parsedValue = { x: 10 };
      const typedValue = {
        value: parsedValue,
        type: 'json',
        valueInfo: {}
      };
      const expectedTypedValue = {
        ...typedValue,
        value: JSON.stringify(parsedValue)
      };

      // then
      expect(Utils.serializeVariables({ a: parsedValue })).toMatchObject({ a: expectedTypedValue });
    });

    it('value should remain the same if type is JSON and value is a string', () => {
      // given
      const value = JSON.stringify({ x: 10 });
      const typedValue = {
        value,
        type: 'string', // notice that we could detect that it's json but is it expected ?
        valueInfo: {}
      };

      // then
      expect(Utils.serializeVariables({ a: value })).toMatchObject({ a: typedValue });
    });

    it('value should be converted to proper formatted string if type is date and value is an instance of date', () => {
      // given
      const dateStr = '2013-06-30T21:04:22.000+0200';
      const formattedDate = '2013-06-30T19:04:22.000UTC+00:00';
      const dateObj = new Date(dateStr);
      const typedValue = {
        value: formattedDate,
        type: 'date',
        valueInfo: {}
      };

      // then
      expect(Utils.serializeVariables({ a: dateObj })).toMatchObject({ a: typedValue });
    });
  });
});
