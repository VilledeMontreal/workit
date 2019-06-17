

import { SpanContext } from "jaeger-client";
import { IMessage } from "../../src/models/camunda-n-mq/specs/message";
import { parseCommaSeparatedBaggage } from "../../src/utils/utils";

export class VdmTextMapCodec {
    private readonly _urlEncoding: boolean;
    private readonly _contextKey: string;
    private readonly _baggagePrefix: string;

    constructor(options: any = {}) {
        this._urlEncoding = !!options.urlEncoding;
        this._contextKey = options.contextKey || 'vdm-trace-id';
        this._contextKey = this._contextKey.toLowerCase();
        this._baggagePrefix = options.baggagePrefix || 'vdmctx-';
        this._baggagePrefix = this._baggagePrefix.toLowerCase();
    }

    public extract(carrier: IMessage): SpanContext {
        let spanContext = new SpanContext();

        if (!carrier.body || !carrier.body.requestInfo) {
            return spanContext;
        }

        const baggage = {};
        let debugId = '';
        const requestInfo = carrier.body.requestInfo;

        for (const key in requestInfo) {
            if (Object.prototype.hasOwnProperty.call(requestInfo, key)) {
                const lowerKey = key.toLowerCase();
                if (lowerKey === this._contextKey) {
                    const decodedContext = SpanContext.fromString(this.decodeValue(requestInfo[key]));
                    if (decodedContext !== null) {
                        spanContext = decodedContext;
                    }
                } else if (lowerKey === 'jaeger-debug-id') {
                    debugId = this.decodeValue(requestInfo[key]);
                } else if (lowerKey === 'jaeger-baggage') {
                    parseCommaSeparatedBaggage(baggage, this.decodeValue(requestInfo[key]));
                } else if (lowerKey.startsWith(this._baggagePrefix)) {
                    const keyWithoutPrefix = key.substring(this._baggagePrefix.length);
                    baggage[keyWithoutPrefix] = this.decodeValue(requestInfo[key]);
                }
            }
        }

        spanContext.debugId = debugId;
        spanContext.baggage = baggage;
        return spanContext;
    }

    public inject(spanContext: SpanContext, carrier: IMessage): void {
        if (!carrier.body || !carrier.body.requestInfo) {
            return;
        }
        const stringSpanContext = spanContext.toString();

        carrier.body.requestInfo[this._contextKey] = stringSpanContext; // no need to encode this

        const baggage = spanContext.baggage;
        for (const key in baggage) {
            if (Object.prototype.hasOwnProperty.call(baggage, key)) {
                const value = this.encodeValue(spanContext.baggage[key]);
                carrier[`${ this._baggagePrefix }${ key }`] = value;
            }
        }
    }

    private encodeValue(value: string): string {
        if (this._urlEncoding) {
            return encodeURIComponent(value);
        }

        return value;
    }

    private decodeValue(value: string): string {
        // only use url-decoding if there are meta-characters '%'
        if (this._urlEncoding && value.indexOf('%') > -1) {
            return this.decodeURIValue(value);
        }

        return value;
    }

    private decodeURIValue(value: string): string {
        // unfortunately, decodeURIComponent() can throw 'URIError: URI malformed' on bad strings
        try {
            return decodeURIComponent(value);
        } catch (e) {
            return value;
        }
    }
}