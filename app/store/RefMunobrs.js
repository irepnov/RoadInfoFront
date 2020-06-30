Ext.define('roadInfo.model.RefMunobrs', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'name', type: 'string'}
        ,{name: 'objects_id', type: 'auto'}
        ,{name: 'geo_json', type: 'string'}
        ,{name: 'color_hex', type: 'string'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/munobr/',
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

Ext.define('roadInfo.store.RefMunobrs', {
    extend: 'Ext.data.Store',
    alias: 'store.RefMunobrs',
    model: 'roadInfo.model.RefMunobrs',
    autoLoad: true
});

