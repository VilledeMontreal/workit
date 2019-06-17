import { APM } from '../enums/apm';
import { ICamundaClientInstrumentation } from './camundaClientInstrumentation';

export interface ICCInstrumentationHandler extends ICamundaClientInstrumentation {
  get(kind: APM): ICamundaClientInstrumentation | undefined;
}
