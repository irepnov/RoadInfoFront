//фильтр объектов содержания на основании ведомости
Ext.define('roadInfo.model.RefLayersObjects', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',  type: 'int'}
        ,{name: 'object_name', type: 'string'}
        ,{name: 'object_id', type: 'int'}
        ,{name: 'munobr_name', type: 'string'}
        ,{name: 'munobr_id', type: 'int'}
        ,{name: 'counts', type: 'int'}
        ,{name: 'layer_name', type: 'string'}
        ,{name: 'layer_id', type: 'int'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/layers_objects/',
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

Ext.define('roadInfo.store.RefLayersObjects', {
    extend: 'Ext.data.Store',
    alias: 'store.RefLayersObjects',
    model: 'roadInfo.model.RefLayersObjects',
    groupField: 'munobr_name',
    autoLoad: false
});

