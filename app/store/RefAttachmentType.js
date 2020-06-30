Ext.define('roadInfo.model.RefAttachmentType', {
    extend: 'Ext.data.TreeModel',
    fields: [
        {name: 'id', type: 'auto'},
        {name: 'text', type: 'string'},
        {name: 'parent_id', type: 'int'},
        {name: 'leaf', type: 'bool'},
        {name: 'iconHref', type: 'string'},
        {name: 'extensions', type: 'string'}
    ],
    idProperty: 'id'
});

Ext.define('roadInfo.store.RefAttachmentType', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.RefAttachmentType',
    model: 'roadInfo.model.RefAttachmentType',
    proxy: {
        type: 'ajax',
        url: ProxyUrlBackend + '/roadinfo/attach/attachment_type/',
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
                // if (node.get("leaf")) {
                //     node.set("checked", false)
                // }
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

