Ext.define('roadInfo.model.RefAccessRoles', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'name', type: 'string'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/access/roles/',
        withCredentials : true,
        useDefaultXhrHeader: false,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty : 'totalcount'
        },
        listeners: {
            exception: function (proxy, response, operation) {
                if (response && response.responseText)
                    if (!Ext.decode(response.responseText).success) {
                        alert('При загрузке данных возникла ошибка: ' + Ext.decode(response.responseText).message);
                    }
            }
        }
    }
});
Ext.define('roadInfo.store.RefAccessRoles', {
    extend: 'Ext.data.Store',
    alias: 'store.RefAccessRoles',
    model: 'roadInfo.model.RefAccessRoles',
    autoLoad: false
});

