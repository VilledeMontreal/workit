/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

process.env.ZEEBE_ADDRESS = '<uuid-from-camunda-cloud>.zeebe.camunda.io:443';
process.env.ZEEBE_CLIENT_ID = '<your-client-id>';
process.env.ZEEBE_CLIENT_SECRET = '<your-client-secret>';
process.env.ZEEBE_AUTHORIZATION_SERVER_URL = 'https://login.cloud.camunda.io/oauth/token';
