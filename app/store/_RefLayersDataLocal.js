Ext.define('roadInfo.store.RefLayersDataLocal', {
    extend: 'Ext.data.Store',
    alias: 'store.RefLayersDataLocal',
    model: 'roadInfo.model.RefLayersData',
    autoLoad: true,
    proxy: {
        type: 'memory',
        enablePaging: true,
        reader: {
            rootProperty: 'data',
            totalProperty: 'totalCount',
            metaProperty: 'metaData'
        }
    },
    pageSize: 50
});