Ext.define('roadInfo.model.RefAccessWorkers', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'fam', type: 'string'}
        ,{name: 'im', type: 'string'}
        ,{name: 'ot', type: 'string'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/access/workers/',
        withCredentials : true,
        useDefaultXhrHeader: false,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty : 'totalcount'
        }
    }
});
Ext.define('roadInfo.store.RefAccessWorkers', {
    extend: 'Ext.data.Store',
    alias: 'store.RefAccessWorkers',
    model: 'roadInfo.model.RefAccessWorkers',
    autoLoad: false
});

