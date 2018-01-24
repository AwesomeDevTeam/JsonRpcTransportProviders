# JsonRpcTransportProviders

Transport providers for JsonRpcClient

# !!! WARNING !!! NOT PRODUCTION READY

## Available providers

- DummyTransportProvider
- WebsocketTransportProvider

## Writing own providers
Provider is an object, which must implement ProviderInterface.
What will be done inside interface methods is up to you.
How provider is constructed is up to you. It can be done by new operator, literal object, Objec.create etc...
See next chapter for ProviderInterface details

### Provider Interface
