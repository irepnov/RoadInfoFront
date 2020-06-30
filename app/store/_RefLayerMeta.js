Ext.define('roadInfo.model.RefLayerMeta', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'field_name', type: 'string'},
        {name: 'display_name', type: 'string'},
        {name: 'type_name', type: 'string'},
        {name: 'table_ref_name', type: 'string'},
        {name: 'orderId', type: 'float'},
        {name: 'isHidden', type: 'boolean'},
        {name: 'isDisabled', type: 'boolean'},
        {name: 'maxLength', type: 'int'},
        {name: 'extensions', type: 'string'},
        {name: 'isRequired', type: 'boolean'}
    ],
    idProperty: 'id',
    proxy: {
        type: "ajax",
        api: {
            read: ProxyUrlBackend + "/roadinfo/layer/meta/?type_layer=1",
            create: ProxyUrlBackend + "/roadinfo/layer/meta/update/",
            update: ProxyUrlBackend + "/roadinfo/layer/meta/update/",
            destroy: ProxyUrlBackend + "/roadinfo/layer/meta/update/"
        },
        actionMethods: {
            read: 'GET',
            create: 'POST',
            update: 'POST',
            destroy: 'POST'
        },
        reader: {
            type: "json",
            rootProperty: "metaData.fields",//
            messageProperty: "message",
            successProperty: "success",
            idProperty: 'id'
        },
        writer: {
            type: 'json',
            writeAllFields: true,
            successProperty: 'success',
            idProperty: 'id'
        },
        listeners: {
            exception: function (proxy, response, operation) {
                if (response && response.responseText)
                    if (!Ext.decode(response.responseText).success) {
                        Ext.Msg.alert('Ошибка', 'При изменении ведомости возникла ошибка:<br/>' + Ext.decode(response.responseText).message);
                    }
            }
        }
    }
});

Ext.define('roadInfo.store.RefLayerMeta', {
    extend: 'Ext.data.Store',
    alias: 'store.RefLayerMeta',
    model: 'roadInfo.model.RefLayerMeta',
    autoLoad: false,
    autoSync: false
});

