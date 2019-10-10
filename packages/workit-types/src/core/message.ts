/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IMessageBase<TBody = unknown, TProps = unknown> {
  body: TBody;
  properties: TProps;
}

export interface IMessage<TBody = any, TProps = any> extends IMessageBase<TBody, TProps> {
  // could add something here
}
