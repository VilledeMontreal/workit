/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { kernel } from '@villedemontreal/workit-core';
import { IAwsConfig } from '@villedemontreal/workit-types';
import { SERVICE_IDENTIFIER } from './constants/identifiers';

const env = process.env;

const configBase: IAwsConfig = {
  region: env.AWS_REGION || '',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const config = {
  ...configBase,
  queueUrl: env.AWS_SQS_QUEUE_URL || '',
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/StepFunctions.html
  apiVersion: env.AWS_API_VERSION || env.AWS_STEP_FUNCTION_API_VERSION || '2016-11-23',
  waitTimeSeconds: Number(env.AWS_SQS_WAIT_TIME_SECONDS) || undefined,
};

kernel.bind(SERVICE_IDENTIFIER.stepfunction_config).toConstantValue(config);
