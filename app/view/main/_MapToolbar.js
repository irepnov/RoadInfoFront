Ext.define('roadInfo.view.main.MapToolbar', {
    extend: Ext.toolbar.Toolbar,
    alias: "widget.maptoolbar",
    defaults: {
        iconAlign: "left",
        scale: "large",
        listeners: {
            afterrender: function(a) {
                if (a.is("button") && a.textTip != undefined) {
                    a.setTooltip({
                        title: a.textTip,
                        trackMouse: true,
                        cls: "tbar-ttip",
                        width: 130,
                        mouseOffset: [-75, 20]
                    })
                }
            }
        }
    },
    initComponent: function() {
       // this.items = roadInfo.config.config.MapToolbar;
        this.items = [/*{
            xtype: "textfield",
            name: "searchfield",
            id: "searchfield",
            emptyText: "Поиск",
            width: "30%",
            margin: "0 8",
            triggers: {
                clearbutton: {
                    cls: "clearbutton",
                    handler: function() {
                        this.reset()
                    }
                },
                search: {
                    cls: "mapshow",
                    handler: function() {
                        //LT.app.getController("Search").startSearch()
                    }
                }
            }
        }, {
            textTip: "Поиск по Км",
            action: "find-segment",
            iconCls: "kmsearch",
            enableToggle: true,
            weight: 0,
            listeners: {
                click: 'onClickk'
            }
        }, "-",*/ {
            textTip: 'Панорама',
            action: 'panorama',
            iconCls: "panorama",
            enableToggle: true,
            weight: 50
        }];

        this.callParent(arguments)
    }
});