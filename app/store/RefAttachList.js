Ext.define('roadInfo.model.RefAttachList', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',  type: 'int'}
        ,{name: 'attachment_type_id', type: 'int'}
        ,{name: 'user_id', type: 'int'}
        ,{name: 'name', type: 'string'}
        ,{name: 'desc', type: 'string'}
        ,{name: 'mime', type: 'string'}
        ,{name: 'path', type: 'string'}
        ,{name: 'size', type: 'float'}
        ,{name: 'km_beg', type: 'float'}
        ,{name: 'object_id', type: 'int'}
        ,{name: 'file_created_at', type: 'date'}
    ],
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/attach/attach_list/',
        withCredentials : true,
        useDefaultXhrHeader: false,
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty : 'totalcount'
        }
    }
});

Ext.define('roadInfo.store.RefAttachList', {
    extend: 'Ext.data.Store',
    alias: 'store.RefAttachList',
    model: 'roadInfo.model.RefAttachList',
    autoLoad: false
});

