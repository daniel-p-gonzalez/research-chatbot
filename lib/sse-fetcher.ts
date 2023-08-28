interface Message {
  data: string;
  type: string;
}

export class SSEFetcher {
    /** URL to be fetched */
    private _url: RequestInfo;
    /** Uncollected messages */
    private _messageQueue: Message[] = [];
    /** Queued calls to nextMessage(). Also holds error state. */
    private _promiseQueue: Promise<any> = Promise.resolve();
    /** Latest unresolved item in _promiseQueue */
    private _pendingPromiseResolve?: (value: Message | PromiseLike<Message>) => void;
    /** ID of last received message */
    private _lastId = '';
    /** Decoder for the current connection */
    private _decoder?: TextDecoder;
    /** Buffered fetch data that doesn't form a whole message */
    private _buffer = '';
    /** Event type for the partial message */
    private _eventType = '';
    /** Data for the partial message */
    private _data = '';
    /** Last id: received for the partial message */
    private _lastIdBuffer = '';
    /** True when the user has requested the connection aborts */
    private _aborted = false;
    /** Milliseconds between reconnection */
    //  private _reconnectionDelay: number;
    private _opts: RequestInit;

    constructor(url: RequestInfo, opts: RequestInit = {}) {
        this._url = url;
        this._opts = opts;
        this._connect()
    }

    /** Get the next server-sent message */
    nextMessage(): Promise<Message> {
        return this._promiseQueue = this._promiseQueue.then(() => {
            if (this._messageQueue.length > 0) {
                return this._messageQueue.shift()!;
            }

            return new Promise<Message>((resolve) => {
                this._pendingPromiseResolve = resolve;
            });
        });
    }

    /** Terminate the SSE */
    private _error(error: Error) {
        const rejection = Promise.reject(error);

        if (this._pendingPromiseResolve) {
            this._pendingPromiseResolve(rejection);
            this._pendingPromiseResolve = undefined;
        }

        this._promiseQueue = rejection;
    }

    get isReading() {
        return !this._aborted
    }

    /** Read from the stream until a whole line is found */
    private async _readNextLine(reader: ReadableStreamDefaultReader<Uint8Array>) {
        while (true) {
            const re = /\r?\n/.exec(this._buffer);
            if (re) {
                const line = this._buffer.slice(0, re.index);
                this._buffer = this._buffer.slice(re.index + re[0].length);
                return line;
            }

            const { done, value } = await reader.read();
            if (done) {
                this.close();
                return;
            }
            const textValue = this._decoder!.decode(value, { stream: true });
            this._buffer += textValue;
        }
    }

    /** Emit a message */
    private _flush() {
        this._lastId = this._lastIdBuffer;
        if (this._data === '') {
            this._eventType = '';
            return;
        }
        if (this._data.slice(-1) === '\n') this._data = this._data.slice(0, -1);

        const message: Message = {
            data: this._data,
            type: this._eventType
        };

        if (this._pendingPromiseResolve) {
            this._pendingPromiseResolve(message);
            this._pendingPromiseResolve = undefined;
        } else {
            this._messageQueue.push(message);
        }

        this._data = '';
        this._eventType = '';
    }

    /** Process a given field + value */
    private _process(field: string, value: string) {
        switch (field) {
            case 'event':
                this._eventType = value;
                break;
            case 'data':
                this._data += value + '\n';
                break;
            case 'id':
                this._lastIdBuffer = value;
                break;
        }
    }

    private async _connect() {
        const headers: any = {
            'Accept': 'text/event-stream',
            ...(this._opts.headers || {})
        };

        if (this._lastId) {
            headers['Last-Event-ID'] = this._lastId;
        }

        const response = await fetch(this._url, {
            ...this._opts,
            headers,
            cache: 'no-store',
        });

        if (response.status !== 200) {
            this._error(Error('Bad status'));
            response.body!.cancel();
            return;
        }

        const type = response.headers.get('content-type');

        if (!type || type.split(';')[0] !== 'text/event-stream') {
            this._error(Error('Bad content-type'));
            response.body!.cancel();
            return;
        }

        const reader = response.body!.getReader();

        // Reset everything for the new stream.
        this._decoder = new TextDecoder();
        this._buffer = '';
        this._eventType = '';
        this._data = '';
        this._lastIdBuffer = '';

        while (true) {
            if (this._aborted) {
                reader.cancel();
                return;
            }

            const line = await this._readNextLine(reader);
            if (line == null) {
                return
            }
            if (line === '') {
                this._flush();
            } else if (line[0] === ':') {
                // Ignore - comment
            } else if (line.includes(':')) {
                const index = line.indexOf(':');
                const field = line.slice(0, index);
                let value = line.slice(index + 1);
                // Strip single leading space in value
                if (value[0] === ' ') value = value.slice(1);
                this._process(field, value);
            } else {
                this._process(line, '');
            }
        }
    }

    close() {
        this._aborted = true;
    }
}
