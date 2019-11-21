/**
 * PostMessage Transport Provider
 * @param {Object} c Configuration object
 * @param {String} c.endpoint Target element to send and receive messages (window, iframe, Worker, SharedWorker port etc)
 * @param {Function} [c.onMessage=function()] Callback with message argument which must be invoked when message arrives. By default its empty function
 * @param {Function} [c.serializer] Message serializer function (any) => string|ByteArray. By default it returns message as is
 * @param {Function} [c.deserializer] Message deserializer function (string|ByteArray) => any. By default it returns message as is
 * @constructor
 */
export default function PostMessageTransportProvider(c) {

    if (typeof c === "undefined" || c === null) {
        throw Error("Missing configuration object");
    }

    if ( "endpoint" in c === false ) {
        throw Error("Required param 'endpoint' is not defined");
    }

    var config = {};
    config.endpoint = c.endpoint;
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

    function onEndpointMessage(msg) {

        config.onMessage(config.deserializer(msg));

    }

    let onEndpointMessageIsBinded = false;
    let onEndpointMessageBinded = onEndpointMessage.bind(this);

    return Object.create(PostMessageTransportProvider.prototype, {

        /**
         * Assigns message listener to receiver
         * @return Promise
         */
        connect : { value : function() {

            return new Promise((resolve) => {
                config.endpoint.addEventListener("message", onEndpointMessageBinded );
                onEndpointMessageIsBinded =  true;
                resolve();
            } );

        }},

        send : { value : function(req) {

            config.endpoint.postMessage(config.serializer(req));

        }},

        disconnect : { value : () => {

            if ( onEndpointMessageIsBinded === true ) {
                config.endpoint.removeEventListener("message", onEndpointMessageBinded);
                onEndpointMessageIsBinded = false;
            }
        }},

        isConnected : { value : () => onEndpointMessageIsBinded },

        onMessage : { value : callback => config.onMessage = callback, writable : true },

        onDisconnect : { value : callback => config.onDisconnect = callback, writable : true },

        onError : { value : undefined, writable : true }

    });

}