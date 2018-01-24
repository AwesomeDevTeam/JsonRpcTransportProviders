const providers = require("../dist/JsonRpcTransportProviders.cjs");
const DummyTransportProvider = providers.DummyTransportProvider;

// Suite
describe("DummyTransportProvider", function() {

    var defaultProvider,
        defaultProvider1;

    function prepare() {

        defaultProvider = DummyTransportProvider({
            onMessage : function(){
                return "message arrived";
            },
            onDisconnect : function(){},
            onError : function(){}
        });
        //defaultProvider1 = DummyTransportProvider({});

    }

    beforeAll(prepare);

    it("defaultProvider must be instance of DummyTransportProvider'", function() {

        expect(defaultProvider instanceof DummyTransportProvider).toBe(true);
        //expect(defaultProvider1 instanceof DummyTransportProvider).toBe(true);

    });

    it( "defaultProvider.isConnected must return false", function(){

        expect(defaultProvider.isConnected()).toBe(false);
        //expect(defaultProvider1.isConnected()).toBe(false);
    });

    it("defaultProvider.connect must return resolved promise", function(done) {

        Promise.all( [

        defaultProvider.connect().then( () => {

            expect(true).toBe(true);

        })/*,

        defaultProvider1.connect().then( () => {

            expect(true).toBe(true);

        })*/]).then(done());

    });

    it( "defaultProvider.isConnected must return true after connect", function() {

        expect(defaultProvider.isConnected()).toBe(true);
        //expect(defaultProvider1.isConnected()).toBe(true);

    });


    it("defaultProvider.send must return undefined", function() {

        expect(defaultProvider.send()).toBeUndefined();
        //expect(defaultProvider1.send()).toBeUndefined();

    });

    it("defaultProvider.disconnect must return resolved promise", function(done) {

        Promise.all([
        defaultProvider.disconnect().then( () => {

            expect(true).toBe(true);

        })/*,
        defaultProvider1.disconnect().then( () => {

            expect(true).toBe(true);

        }) */]).then(done());


    });

    it("defaultProvider.isConnected must return false after disconnect", function() {

        expect(defaultProvider.isConnected()).toBe(false);
        //expect(defaultProvider1.isConnected()).toBe(false);

    });


    // On message
    // TODO: Jak mam triggerować event przychodzącego mesydża?
    // Wcześniej to działałao, ale onMessage zmieniłerm na funkcję, która przypisuje callbacka
    /*it("defaultProvider.onMessage must be called", function(){

        expect(defaultProvider.onMessage()).toBe("message arrived");

    });*/

    // On disconnect - musi byc odpalone, po wykonaniu metody disconnect

    // On error - musi być wykonane, jak się

});

