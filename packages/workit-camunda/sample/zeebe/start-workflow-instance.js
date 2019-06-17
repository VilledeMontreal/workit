// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.
const ZB = require('zeebe-node');

(async () => {
    const zbc = new ZB.ZBClient("localhost:26500");
    for (let index = 0; index < 1; index++) {
        const result = await zbc.createWorkflowInstance("DCI_PETITIONS_STATUS_CHANGE", {
            "businessKey": "5c72b4ad21719b001009025d",
            "serviceType": "petitions",
            "internalStatus": "opened",
            "id": "13514",
            "accountIds": {
                "data": [
                    "@!4025.CA62.9BB6.16C5!0001!2212.0010!0000!9C6F.CD68.4E14.DC40"
                ]
            }
        });
        console.log(result);
    }
})();