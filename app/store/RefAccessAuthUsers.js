Ext.define('roadInfo.model.RefAccessAuthUsers', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'login', type: 'string'}
        ,{name: 'name', type: 'string'}
        ,{name: 'company', type: 'string'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/access/authusers/',
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
Ext.define('roadInfo.store.RefAccessAuthUsers', {
    extend: 'Ext.data.Store',
    alias: 'store.RefAccessAuthUsers',
    model: 'roadInfo.model.RefAccessAuthUsers',
    autoLoad: false
});

