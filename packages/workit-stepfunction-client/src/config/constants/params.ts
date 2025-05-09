/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export const MAX_ERROR_CAUSE_LENGTH = Number(process.env.WORKIT_STEP_FUNCTION_MAX_ERROR_CAUSE_LENGTH) || 32768;
export const MAX_PAYLOAD_LENGTH = Number(process.env.WORKIT_STEP_FUNCTION_MAX_PAYLOAD_LENGTH) || 262144;
export const MAX_ERROR_CODE_LENGTH = Number(process.env.WORKIT_STEP_FUNCTION_MAX_ERROR_CODE_LENGTH) || 256;
export const DISABLE_DATETIME_REVIVER = !!process.env.WORKIT_DISABLE_DATETIME_REVIVER;
