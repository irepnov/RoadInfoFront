//списко дорог с координатами
Ext.define('roadInfo.model.RefObjectsYandex', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',  type: 'int'}
        ,{name: 'munobr_color',  type: 'string'}
        ,{name: 'yandex_properties', type: 'auto'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/objects_with_yandex/',
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

Ext.define('roadInfo.store.RefObjectsYandex', {
    extend: 'Ext.data.Store',
    alias: 'store.RefObjectsYandex',
    model: 'roadInfo.model.RefObjectsYandex',
    autoLoad: false
});

