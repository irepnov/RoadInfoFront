Ext.define("roadInfo.view.layer_icons.LayerIconsTable", {
    extend: Ext.window.Window,
    alias: "widget.layericonstable",
    title: "Справочник условий отображения иконок для ведомостей",
    id: "layericonstable",
    layout: "fit",
    iconCls: "image16",
    width: 1000,
    height: 700,
    maximizable: true,
    collapsible: false,
    modal: true,
    border: false,
    bodyStyle: 'padding: 5px 5px;',
    iconAlign: "left",
    requires: ['roadInfo.view.layer_icons.LayerIconsTableController', "roadInfo.view.layer_icons.LayerIcon"],
    controller: 'layericonstablecontroller',
    defaults: {
        border: 1
    },
    initComponent: function () {
        this.tbar = {
            xtype: "toolbar",
            enableOverflow: true,
            defaults: {
                iconAlign: "left",
                scale: "small"
            },
            items: [
                {
                    text: "Добавить",
                    tooltip: "Добавить иконку",
                    action: "add",
                    iconCls: "add16"
                },
                {
                    text: "Изменить",
                    tooltip: "Изменить иконку", //изменить фото, название оставить прежднее
                    action: "edit",
                    iconCls: "edit16"
                },
                {
                    text: "Удалить",
                    tooltip: "Удалить иконку", //выбрать все справочники, заменить в Нулл все ссылки
                    action: "delete",
                    iconCls: "del16"
                }]
        };
        this.items = [{
            xtype: 'grid',
            reference: 'layericonsgrid',
            autoScroll: true,
            store: 'RefLayerIconsList',
            bodyStyle: 'padding: 5px 5px;',
            plugins: [
                {
                    ptype: 'gridfilters'
                }
            ],
            listeners: {
                itemdblclick: 'onRowDblClick'
            },
            columns: [
                {
                    xtype: "gridcolumn",
                    text: 'layer',
                    dataIndex: 'layer_id',
                    filter: {
                        type: "list",
                        labelField: "name",
                        idField: "id",
                        store: 'RefLayersAll',
                        loadingText: "Загрузка..."
                    },
                    cellWrap: true,
                    // editor: {
                    //     xtype: "combobox",
                    //     store: 'RefLayersAll',
                    //     displayField: "name",
                    //     valueField: "id",
                    //     queryMode: "local",
                    //     forceSelection: true,
                    //     typeAhead: true,
                    //     typeAheadDelay: 30,
                    //     enableRegEx: true,
                    //     caseSensitive: false,
                    //     matchFieldWidth: false,
                    //     listConfig: {
                    //         listeners: {
                    //             beforeshow: function (picker) {
                    //                 picker.minWidth = picker.up('combobox').getSize().width;
                    //             }
                    //         }
                    //     }
                    // },
                    lockable: false,
                    flex: 1,
                    hasCustomRenderer: true,
                    renderer: function (G, E) {
                        if (G == null) {
                            return ""
                        }
                        var s = Ext.getStore('RefLayersAll'),
                            F = s.findExact("id", G),
                            c = s.getAt(F);
                        if (c) {
                            return c.get("name")
                        }
                    }
                },
                {
                    xtype: "gridcolumn",
                    text: 'dict',
                    dataIndex: 'dict_icons',
                    cellWrap: true,
                    lockable: false,
                    width: 50,
                    minWidth: 40,
                    maxWidth: 60,
                    hasCustomRenderer: true,
                    renderer: function (G, E) {
                        if (G == null) {
                            return ""
                        }
                        return '<img style="width: 16px; height: 16px" src="' + roadInfo.config.config.path.icons_layers + G + '" alt="' + roadInfo.config.config.path.icons_layers + G + '"/>';
                    }
                }
            ]
        }]
        ;
        this.callParent(arguments);
    }
});