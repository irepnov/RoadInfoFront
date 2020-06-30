Ext.define('roadInfo.model.RefAccessUsers', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'}
        // ,{name: 'worker_id', type: 'int'}
        , {name: 'auth_user_id', type: 'int'}
        , {name: 'role_id', type: 'int'}
    ],
    idProperty: 'id',
    proxy: {
        type: "ajax",
        withCredentials: true,
        useDefaultXhrHeader: false,
        api: {
            read: ProxyUrlBackend + '/roadinfo/access/users/',
            create: ProxyUrlBackend + '/roadinfo/access/users/create/',
            update: ProxyUrlBackend + '/roadinfo/access/users/update/',
            destroy: ProxyUrlBackend + '/roadinfo/access/users/destroy/'
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
            totalProperty: 'totalcount',
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
                        Ext.Msg.alert('Ошибка', 'При изменении данных возникла ошибка:<br/>' + Ext.decode(response.responseText).message);
                        //Ext.StoreManager.lookup('RefCoefficients').load();
                    }
            }
        }
    }
});
Ext.define('roadInfo.store.RefAccessUsers', {
    extend: 'Ext.data.Store',
    alias: 'store.RefAccessUsers',
    model: 'roadInfo.model.RefAccessUsers',
    autoLoad: false,
    autoSync: false
});

