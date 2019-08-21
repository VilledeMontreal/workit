// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { IProperties } from './properties';

export interface IMessageBase<TBody = any, TProps = any> {
  body: TBody;
  properties: IProperties<TProps>;
}

export interface IMessage<TBody = any, TProps = any> extends IMessageBase<TBody, TProps> {
  // spans: Span;
}
