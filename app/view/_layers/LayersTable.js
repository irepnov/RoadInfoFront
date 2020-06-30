Ext.define("roadInfo.view.layers.LayersTable", {
    extend: Ext.window.Window,
    alias: "widget.layerstable",
    title: "Ведомость",
    id: "layerstable",
    layout: "fit",
    iconCls: "table16",
    config: {
        fields: null,
        objectDBName: null
    },
    width: 1000,
    height: 600,
    maximizable: true,
    collapsible: false,
    // border: 0,
    border: false,
    // padding: '5px',
    //bodyStyle: 'margin: 10px; padding: 5px 3px;',
    bodyStyle: 'padding: 5px 5px;',
    iconAlign: "left",
    requires: ['roadInfo.view.layers.LayersTableController', 'roadInfo.view.layers.Layer'],
    controller: 'layerstablecontroller',
    defaults: {
        border: 1
    },
    initComponent: function () {
        var s = Ext.getStore('RefLayersDataLocal');
        this.tbar = {
            xtype: "toolbar",
            enableOverflow: true,
            defaults: {
                iconAlign: "top",
                scale: "small"
            },
            items: [
                //{xtype: "tbseparator"},
                {
                    text: "Добавить",
                    tooltip: "Добавить запись в ведомость",
                    action: "add",
                    iconCls: "add16"
                },
                {
                    text: "Изменить",
                    tooltip: "Изменить запись ведомости",
                    action: "edit",
                    iconCls: "edit16"
                },
                {
                    text: "Удалить",
                    tooltip: "Удалить запись",
                    action: "delete",
                    iconCls: "del16"
                },
                {
                    xtype: "tbfill"
                },
                {
                    text: "Экспорт",
                    tooltip: "Экспорт ведомости в XLS",
                    action: "xls-export",
                    iconCls: "excel16"
                }]
        };
        this.items = [{
            xtype: 'grid',
            reference: 'layersgrid',
            autoScroll: true,
          //  store: s,
            plugins: ['excel'],
            bodyStyle: 'padding: 5px 5px;',
            dockedItems: [{
                xtype: 'pagingtoolbar',
              //  store: s,
                dock: 'bottom',
                displayInfo: true,
                beforePageText: 'Страница',
                afterPageText: 'из {0}',
                displayMsg: 'Записи {0} - {1} из {2}'
            }]
        }];
        this.callParent(arguments);
    }

});