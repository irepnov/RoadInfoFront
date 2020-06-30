Ext.define("roadInfo.component.LayerInfoPanel", {
    extend: Ext.window.Window,
    alias: "widget.layerinfo",
    id: "layer-info-window",
    title: "Информация",
    width: 250,
    height: 600,
    border: false,
    defaultAlign: "tr",
    bodyPadding: "10px 0",
    minimizable: false,
    constrain: true,
    collapsible: true,
    style: {
        backgroundColor: "#fff",
        opacity: 0.8
    },
    bodyStyle: {
        backgroundColor: "#fff",
        overflow: "auto"
    },
    pinned: false,
    initComponent: function() {
        this.tools = [{
            type: "pin",
            tooltip: "Закрепить/открепить панель",
            handler: function(e, d, a, c) {
                var b = a.up("window");
                b.pinned = !b.pinned;
                if (b.pinned) {
                    c.setType("unpin")
                } else {
                    c.setType("pin")
                }
            }
        }];
        this.bbar = [{
            xtype: "tbfill"
        }, {
            text: "Экспорт",
            iconCls: "excel",
            tooltip: "Экспорт в xlsx",
            action: "export"
        }];
        this.callParent(arguments)
    }
});