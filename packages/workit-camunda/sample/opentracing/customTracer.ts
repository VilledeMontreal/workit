import {initTracer} from 'jaeger-client';
import * as opentracing from "opentracing";
import { VdmTextMapCodec } from './vdmMapCodec';

const config = {
    serviceName: 'WorkIt',
    sampler: {
        type: "const",
        param: 1,
    },
    reporter: {
        logSpans: true,
    },
};

const options = {
    tags: {
        'petition-api.version': '1.1.2',
    },
};
const codec = new VdmTextMapCodec();
export const tracer = initTracer(config, options);
tracer.registerInjector(opentracing.FORMAT_TEXT_MAP, codec);
tracer.registerExtractor(opentracing.FORMAT_TEXT_MAP, codec);
