Ext.define('roadInfo.model.RefLayersAll', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'name', type: 'string'}
        ,{name: 'parent_id', type: 'int'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/layer/list/',
        withCredentials : true,
        useDefaultXhrHeader: false,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty : 'totalcount'
        }
    }
});

Ext.define('roadInfo.store.RefLayersAll', {
    extend: 'Ext.data.Store',
    alias: 'store.RefLayersAll',
    model: 'roadInfo.model.RefLayersAll',
    autoLoad: true
});

