Ext.define('roadInfo.model.RefLayersTreeForUser', {
    extend: 'Ext.data.TreeModel',
    fields: [
        {name: 'id', type: 'auto'},
        {name: 'text', type: 'string'},
        {name: 'parent_id', type: 'int'},
        {name: 'iconHref', type: 'string'},
        {name: 'leaf', type: 'bool'},
        {name: 'table_name', type: 'string'},
        {name: 'proc_agr_name', type: 'string'},
        {name: 'geometry_type', type: 'string'}
    ],
    idProperty: 'id'
});

Ext.define('roadInfo.store.RefLayersTreeForUser', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.RefLayersTreeForUser',
    model: 'roadInfo.model.RefLayersTreeForUser',
    /*root: {
        text: 'Все разделы',
        expanded: false,
       // iconCls: 'dorgis16',
        checked: false,
        id: 0
    },*/
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/layers/?foruser=1',
        withCredentials: true,
        useDefaultXhrHeader: false,
        reader: {
            type: 'json',
            rootProperty: 'children'
        },
        listeners: {
            exception: function (proxy, response, operation) {
                if (response && response.responseText)
                    if (!Ext.decode(response.responseText).success) {
                        alert('При загрузке данных возникла ошибка: ' + Ext.decode(response.responseText).message);
                    }
            }
        }
    },
    autoLoad: true,

    checkImage: function (file, c) {
        var img = new Image();
        img.onload = function () {
            c(true)
        };
        img.onerror = function () {
            c(false)
        };
        img.src = file
    },

    listeners: {
        load: function (me) {
            var nodeRoot = me.getRoot();
            var chImageFn = me.checkImage;

            nodeRoot.cascadeBy(function (node) {
                if (node.get("leaf")) {
                    node.set("checked", false)
                }

                if (node != nodeRoot && node.get("iconHref") && !node.get("icon")) {
                    var file = roadInfo.config.config.path.icons_layers + node.get("iconHref");
                    node.set("icon", file);
                    var def = roadInfo.config.config.path.icons_layers + "table.png";
                    chImageFn(file, function (ff) {
                        if (ff) {
                            node.set("icon", file)
                        } else {
                            node.set("icon", def)
                        }
                    })
                }

            })
        }
    }
});

