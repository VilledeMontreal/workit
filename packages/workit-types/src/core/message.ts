/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

export interface IMessageBase<TBody = unknown, TProps = unknown> {
  body: TBody;
  properties: TProps;
}

export type IMessage<TBody = any, TProps = any> = IMessageBase<TBody, TProps>;
