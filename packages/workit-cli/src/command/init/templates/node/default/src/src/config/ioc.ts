import { IoC, SERVICE_IDENTIFIER as CORE_IDENTIFIER } from 'workit-camunda';
import { configs } from '.';
import { HelloWorldTask } from '../tasks/helloWorldTask';
enum LOCAL_IDENTIFIER {
  sample_activity = 'sample_activity'
}

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sample_activity);
IoC.bindToObject(configs.camunda, CORE_IDENTIFIER.camunda_external_config);
