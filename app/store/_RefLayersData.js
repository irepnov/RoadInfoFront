Ext.define('roadInfo.model.RefLayersData', {
    extend: 'Ext.data.Model'
});

Ext.define('roadInfo.store.RefLayersData', {
    extend: 'Ext.data.Store',
    alias: 'store.RefLayersData',
    model: 'roadInfo.model.RefLayersData',
    autoLoad: false,
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/layer_info_with_meta/',
        withCredentials : true,
        useDefaultXhrHeader: false,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty : 'totalcount',
            metaProperty: 'metaData'
        }
    }
});



