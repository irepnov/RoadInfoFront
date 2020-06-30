Ext.define('roadInfo.model.RefTest', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'name', type: 'string'}
        ,{name: 'date', type: 'date'}
            ,{name: 'file_content', type: 'string'} //not real database
        ,{name: 'file_name', type: 'string'} //not edit
        ,{name: 'created_at', type: 'date'} //not edit
        ,{name: 'updated_at', type: 'date'} //not edit
        ,{name: 'deleted_at', type: 'date'} //not edit
    ],
    proxy: {
        type: "ajax",
        api: {
            read: ProxyUrlBackend + "/roadinfo/test/read/",
            create: ProxyUrlBackend + "/roadinfo/test/create/",
            update: ProxyUrlBackend + "/roadinfo/test/update/",
            destroy: ProxyUrlBackend + "/roadinfo/test/destroy/"
        },
        actionMethods: {
            read: 'GET',
            create: 'POST',
            update: 'POST',
            destroy: 'POST'
        },
        reader: {
            type: "json",
            rootProperty: "data",
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
                        //Ext.StoreManager.lookup('RefCoefficients').load();
                    }
            }
        }
    }
});

Ext.define('roadInfo.store.RefTest', {
    extend: 'Ext.data.Store',
    alias: 'store.RefTest',
    model: 'roadInfo.model.RefTest',
    autoLoad: false
});

