Ext.define("roadInfo.view.dicts.DictsTable", {
    extend: Ext.window.Window,
    alias: "widget.dictstable",
    title: "Список справочников",
    id: "dictstable",
    layout: "fit",
    iconCls: "fa fa-table",
    width: 1200,
    height: 800,
    maximizable: true,
    collapsible: false,
    modal: true,
    border: false,
    bodyStyle: 'padding: 5px 5px;',
    iconAlign: "left",
    requires: ['roadInfo.view.dicts.DictsTableController', "roadInfo.view.dicts.Dicts", "roadInfo.view.icons.IconsTable"],
    controller: 'dictstablecontroller',
    defaults: {
        border: 1
    },
    initComponent: function () {
        var storeDicts = Ext.getStore('RefDictsList');
        storeDicts.load();

        this.tbar = {
            xtype: "toolbar",
            enableOverflow: true,
            defaults: {
                iconAlign: "left",
                scale: "small"
            },
            items: [
                {
                    text: "Редактировать",
                    tooltip: "Вызвать редактор справочника", //изменить фото, название оставить прежднее
                    action: "edit",
                    iconCls: "fa fa-pencil"
                }]
        };
        this.items = [{
            xtype: 'grid',
            reference: 'dictstablegrid',
            autoScroll: true,
            store: storeDicts,
            bodyStyle: 'padding: 5px 5px;',
            columns:[
                {dataIndex: "id", text: "ИД", hidden: true, sortable: false, hideable: false},
                {dataIndex: "table_name", text: "Имя таблицы", width: 250, cellWrap: true},
                {dataIndex: "name", text: "Наименование", flex: 1, cellWrap: true}
            ],
            listeners: {
                itemdblclick: 'onRowDblClickDict'
            }
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