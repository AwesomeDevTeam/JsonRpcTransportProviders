/**
 * Dummy transport provider for testing
 * @constructor
 * @param {Object} o Configuration object
 * @param {Promise|Function} [o.onConnectRetValue=Promise.resolve] Value returned from connect method
 * @param {Object|Number|String|Function} [o.onDisconnectValue={}] Message value which is passed to onDisconnect callback
 * @param {Boolean|Function} o.isConnectedRetValue Value returned from isConnected function
 * @param {Promise|Function} [o.disconnectRetValue=Promise.resolve()] Value returned from disconnect method
 * @param {Function} o.onMessage Callback with message argument which must be invoked when message arrives
 * @param {Function} o.onDisconnect Callback which must be invoked on disconnection
 * @param {Function} o.onError Callback which must be invoked when error occurs
 * @returns {DummyTransportProvider}
 */
export default function DummyTransportProvider(c) {

    let connected = false;
    let onMessage;
    let onDisconnect;
    const connectRetValue = "connectRetValue" in c ? c.connectRetValue : Promise.resolve();
    //const onErrorValue = "onErrorValue" in c ? c.onErrorValue : {};
    //const onDisconnectValue = "onDisconnectValue" in c ? c.onDisconnectValue : {};
    const isConnectedRetValue = "isConnectedRetValue" in c ? c.isConnectedRetValue : () => connected;
    const disconnectRetValue = "disconnectRetValue" in c ? c.disconnectRetValue : Promise.resolve();

    if ( "onMessage" in c ) {
        if ( typeof c.onMessage !== "function" ) {
            throw Error("onMessage callback is not a function");
        } else{
            onMessage = c.onMessage;
        }
    } else {
        // By default call empty function when message arrives
        // Sometimes we need only sending, so we don't force users to tet this callback
        onMessage = () => {};

    }

    if ( typeof c.onDisconnect !== "function" ) {
        throw Error("onDisconnect callback is not a function");
    }

    if ( typeof c.onError !== "function" ) {
        throw Error("onError callback is not a function");
    }

    onDisconnect = c.onDisconnect;

    return Object.create( DummyTransportProvider.prototype, {

        /**
         * Connected flag
         * @param {Boolean}
         */
        connected :  { value : connected, writable : true },

        connect : { value : function() {
            connected = true;
            return getOrInvoke(connectRetValue, [Promise]);
        }},

        send : { value : function(msg){
            msg;
        }},

        disconnect : { value : function() {

            return getOrInvoke(disconnectRetValue, [Promise]).then( (v) => {

                connected = false;
                return Promise.resolve(v);

            });

        }},

        isConnected : { value : function() {
            return getOrInvoke(isConnectedRetValue, ["boolean"]);
        }},

        onMessage : { value : callback => onMessage = callback, writable : true },

        onDisconnect : { value : callback => onDisconnect = callback, writable : true },

        onError : { value : undefined, writable : true },

        invokeOnMessage : { value : msg => onMessage(msg) },

        invokeOnDisconnect : { value : () => onDisconnect() }

    });


}

/**
 * Helper function return its argument or invoke if argument is function
 * @param {Object|String|Number|Function} val Value to return or invoke
 * @param {Array} allowedReturnTypes Allowed return types for type checking (checked by instanceof  or typeof operator depending on type) if passed array is empty any type is allowed
 *                                   Allowed array values are: 'boolean' or any other reference type
 * @returns {*}
 */
function getOrInvoke(val, allowedReturnTypes) {

    var ret;
    if ( typeof val === "function" ) {

        ret = val();

    } else {
        ret = val;
    }

    if ( allowedReturnTypes.length == 0 || allowedReturnTypes.filter( allowedType => {

        if ( allowedType === "boolean" ) {

            return typeof ret === allowedType;

        } else {

            return ret instanceof allowedType;

        }

    }).length > 0 ) {

        return ret;

    }

    throw new Error("Return type differs from one of expected " + allowedReturnTypes.join(", "));

}
