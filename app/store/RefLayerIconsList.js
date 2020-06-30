Ext.define('roadInfo.model.RefLayerIconsList', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'layer_id', type: 'int'}
        ,{name: 'dict_icons', type: 'string'}
        ,{name: 'where_param', type: 'auto'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/layericons/list/',
        withCredentials : true,
        useDefaultXhrHeader: false,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty : 'totalcount'
        }
    }
});

Ext.define('roadInfo.store.RefLayerIconsList', {
    extend: 'Ext.data.Store',
    alias: 'store.RefLayerIconsList',
    model: 'roadInfo.model.RefLayerIconsList',
    autoLoad: false
});

