/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IAwsConfig } from '../awsConfig';
import { ISqsConfig } from '../sqs/sqsConfig';

export interface IStepFunctionClientConfig extends ISqsConfig, IAwsConfig {}
