/**
 * WebSocket Transport Provider
 * @param {Object} c Configuration object
 * @param {String} c.server Server address to connect to as proper url with ws or wss protocol (wss://example.com)
 * @param {Boolean} [c.reconnect=false] Reconnect flag
 * @param {Number} [c.reconnectAfter=5000] Reconnect timeout in milliseconds
 * @param {Function} [c.onMessage=function()] Callback with message argument which must be invoked when message arrives. By default its empty function
 * @param {Function} [c.serializer] Message serializer function (any) => string|ByteArray. By default it returns message as is
 * @param {Function} [c.deserializer] Message deserializer function (string|ByteArray) => any. By default it returns message as is
 * @param {Array.<String>} [c.protocols=[]] WebSocket protocols
 * @constructor
 */
export default function WebSocketTransportProvider(c) {

    // TODO: Tutaj sprawdzenie parametrów wejściowych i zapisanie ich do wewnętrznego configa

    if (typeof c === "undefined" || c === null) {
        throw Error("Missing configuration object");
    }

    if ( "server" in c === false ) {
        throw Error("Required param 'server' is not defined");
    }

    var config = {};
    config.server = c.server;
    config.reconnect = "reconnect" in c ? c.reconnect : false;
    config.reconnectAfter = "reconnectAfter" in c ? c.reconnectAfter : 5000;
    if ( "protocols" in c !== false ) {

        // Copy from original array to new
        config.protocols = c.protocols.map( p => p );

    } else {

        config.protocols = [];
    }

    if ( "onMessage" in c  ) {
        if ( typeof c.onMessage !== "function" ) {
            throw Error("onMessage callback is not a function");
        } else {
            config.onMessage = c.onMessage;
        }
    } else {
        // By default call empty function when message arrives
        // Sometimes we need only sending, so we don't force users to set this callback
        config.onMessage = () => {};
    }

    if ( "serializer" in c ) {

        if ( typeof c.serializer !== "function" ) {
            throw Error("Serializer is not a function");
        }

        config.serializer = c.serializer;

    } else {
        config.serializer = req => req;
    }

    if ( "deserializer" in c ) {

        if ( typeof c.deserializer !== "function" ) {
            throw Error("Deserializer is not a function");
        }

        config.deserializer = c.deserializer;

    } else {
        config.deserializer = req => req;
    }

    // By default call empty function
    config.onDisconnect = () => {};

    let socket;

    function onWsOpen(promiseTransporter) {
        promiseTransporter.resolve();
    }

    function onWsClose() {
        config.onDisconnect();
    }

    function onWsError(promiseTransporter, err) {
        promiseTransporter.reject(err);
    }

    function onWsMessage(msg) {

        config.onMessage(config.deserializer(msg));

    }

    return Object.create(WebSocketTransportProvider.prototype, {

        /**
         * Connects to server
         * @return Promise
         */
        connect : { value : function() {

            return new Promise((resolve, reject) => {

                socket = new WebSocket(config.server, config.protocols);

                var promiseTransporter = { resolve  : resolve, reject : reject };

                socket.addEventListener("open", onWsOpen.bind(this, promiseTransporter));
                socket.addEventListener("close", onWsClose.bind(this));
                socket.addEventListener("error", onWsError.bind(this, promiseTransporter));
                socket.addEventListener("message", onWsMessage.bind(this));


            });
        }},

        send : { value : function(req) {

            // Second argument is for node.js websocket implementation
            socket.send(config.serializer(req), {binary: false, mask: true});

        }},

        disconnect : { value : () => socket.close() },

        isConnected : { value : () => socket.readyState === WebSocket.OPEN},

        onMessage : { value : callback => config.onMessage = callback, writable : true },

        onDisconnect : { value : callback => config.onDisconnect = callback, writable : true },

        onError : { value : undefined, writable : true }

    });

}


