// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.
// tslint:disable: no-floating-promises
// tslint:disable: no-console

import '../src/config/ioc';

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import { TAG } from '../src/config/constants/tag';
import { Worker } from '../src/models/core/worker';
import { IoC } from '../src/models/IoC'
import { HelloWorldTask } from './tasks/helloWorldTask';

(async () => {
    console.log();

enum LOCAL_IDENTIFIER {
    sample_activity= 'sample_activity'
}
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sample_activity);


const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm); // TAG.zeebe

const stop = () => {
    console.info('SIGTERM signal received.');
    console.log('Closing worker');
    worker
        .stop()
        .then(() => {
            console.log('worker closed');
            process.exit(0);
        })
        .catch((e: Error) => {
            console.log(e);
            process.exit(1);
        });
};

worker.start();
worker.run();

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

})();