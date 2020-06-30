Ext.define('roadInfo.view.main.MainMapToolbar', {
    extend: Ext.toolbar.Toolbar,
    alias: "widget.mainmaptoolbar",
    //layout: 'fit',
    dock: 'top',
    enableOverflow: true,
    defaults: {
        iconAlign: "left",
        scale: "small",
        listeners: {
            afterrender: function (a) {
            }
        }
    },
    initComponent: function () {
        this.items = [
            /*{
                text: "Поиск по км",
                tooltip: "Поиск участка (точки) на объекте содержания по километру",
                action: "searchkm",
                reference: 'searchkm',
                disabled: true,
                iconCls: "mappoint16"
            }*/
            {
                xtype: 'splitbutton',
                text: 'Поиск по км',
                action: "searchkm",
                reference: 'searchkm',
                id: 'searchkm',
                disabled: true,
                iconCls: "fa fa-map-marker",
                menu: {
                    items: [{
                        text: 'Отменить результат',
                        //iconCls: "fa fa-ban",
                        action: "searchkmcancel",
                        reference: 'searchkmcancel'
                    }]
                }
            }
        ];
        this.callParent(arguments)
    }
});

