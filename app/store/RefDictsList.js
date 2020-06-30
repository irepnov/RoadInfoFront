Ext.define('roadInfo.model.RefDictsList', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'table_name', type: 'string'}
        ,{name: 'desc', type: 'string'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/dict/list/',
        withCredentials : true,
        useDefaultXhrHeader: false,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty : 'totalcount'
        }
    }
});

Ext.define('roadInfo.store.RefDictsList', {
    extend: 'Ext.data.Store',
    alias: 'store.RefDictsList',
    model: 'roadInfo.model.RefDictsList',
    autoLoad: false
});

