Ext.define("roadInfo.view.icons.IconsTable", {
    extend: Ext.window.Window,
    alias: "widget.iconstable",
    title: "Справочник иконок",
    id: "iconstable",
    layout: "fit",
    iconCls: "fa fa-picture-o",
    width: 1000,
    height: 700,
    maximizable: true,
    collapsible: false,
    modal: true,
    border: false,
    bodyStyle: 'padding: 5px 5px;',
    iconAlign: "left",
    requires: ['roadInfo.view.icons.IconsTableController', "roadInfo.view.icons.Icon"],
    controller: 'iconstablecontroller',
    defaults: {
        border: 1
    },
    initComponent: function () {
        //var s = Ext.getStore('RefLayersDataLocal');

        var cdef = roadInfo.app.getController('default');
        if (cdef) {
            var storeIcons = cdef.getDictionaryStore('dict_icons'),
                modelIcons = cdef.getDictModel('dict_icons'),
                metaIcons = cdef.getDictMetaInfo('dict_icons');
        }

        Ext.each(metaIcons.gridFields, function (item) {  //для сводной ведомости растянем столбцы
            item['sortable'] = false;
            item['menuDisabled'] = true;
        });

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
                    iconCls: "fa fa-plus"
                },
                {
                    text: "Изменить",
                    tooltip: "Изменить иконку", //изменить фото, название оставить прежднее
                    action: "edit",
                    iconCls: "fa fa-pencil"
                },
                {
                    text: "Удалить",
                    tooltip: "Удалить иконку", //выбрать все справочники, заменить в Нулл все ссылки
                    action: "delete",
                    iconCls: "fa fa-minus"
                }]
        };
        this.items = [{
            xtype: 'grid',
            reference: 'iconsgrid',
            enableCtxMenu: false,  // turn off header context menu
            enableColLock: false,  // turn off column lock context items
            enableColumnMove: false,  // turn off column reorder drag drop
            enableColumnResize: false,  // turn off column resize for whole grid
            autoScroll: true,
            store: storeIcons,
            bodyStyle: 'padding: 5px 5px;',
            columns: metaIcons.gridFields/*[
                {dataIndex: "id", text: "ИД", hidden: true, sortable: false, hideable: false},
                {
                    dataIndex: "code",
                    sortable: false,
                    hideable: false,
                    width: 50,
                    renderer: function (value) {
                        return '<img style="width: 24px; height: 24px" src="' + roadInfo.config.config.path.icons_layers + value + '" alt="' + roadInfo.config.config.path.icons_layers + value + '"/>';
                    }
                },
                {dataIndex: "code", text: "Имя файла", width: 250, cellWrap: true},
                {dataIndex: "name", text: "Описание", flex: 1, cellWrap: true}
            ]*/
            /* xtype:'dataview',
             reference: 'picsList',
             cls:'pics-list-content',
             store: storeIcons,
             tpl: new Ext.XTemplate(
                 '<tpl for=".">',
                 '<div class="thumb"><img src="{[smthExternalInternalVar]}{code}" title="{name}"></div>',
                 '</tpl>',
                 {
                     definitions: "var smthExternalInternalVar=\"" + roadInfo.config.config.path.icons_layers + "\";\n"
                 }
             ),
             multiSelect: true,
             minHeight: 400,
             flex:1,
             trackOver: true,
             overItemCls: 'x-item-over',
             itemSelector: 'div.thumb',
             emptyText: 'No images to display'*/
        }];
        this.callParent(arguments);
    }
});