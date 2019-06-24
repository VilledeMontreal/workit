// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

const ZB = require('zeebe-node');

(async() => {
    const zbc = new ZB.ZBClient("localhost:26500");
    // const topology = await zbc.topology();
    // console.log(JSON.stringify(topology, null, 2));
    // let workflows = await zbc.listWorkflows();
    // console.log(workflows);
    await zbc.deployWorkflow(process.cwd()+'/sample/zeebe/test.bpmn');
    // workflows = await zbc.listWorkflows();
    // console.log(workflows);
    // const zbWorker = zbc.createWorker("test-worker", "demo-service", handler);
    zbc.publishMessage();
    zbc.publishStartMessage();
    zbc.failJob();
})();

function handler(payload, complete){
    console.log("ZB payload", payload);
    complete(payload);

}