//выпадающий список объектов содержания
//зависит от списка районов
Ext.define('roadInfo.model.RefObjects', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',  type: 'int'}
        ,{name: 'nameshort', type: 'string'}
        ,{name: 'munobr', type: 'string'}
        ,{name: 'munobr_id', type: 'auto'}
        ,{name: 'km_beg', type: 'float'}
        ,{name: 'km_end', type: 'float'}
        ,{name: 'name', type: 'string'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/objects/',
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

Ext.define('roadInfo.store.RefObjects', {
    extend: 'Ext.data.Store',
    alias: 'store.RefObjects',
    model: 'roadInfo.model.RefObjects',
    autoLoad: false
});

