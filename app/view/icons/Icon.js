Ext.define("roadInfo.view.icons.Icon", {
    extend: Ext.window.Window,
    alias: "widget.createicon",
    title: "Создание/Изменение иконки",
    layout: "fit",
    requires: ['roadInfo.view.icons.IconController'],
    width: 500,
    height: 200,
    modal: true,
    iconCls: "fa fa-pencil",
    controller: "iconcontroller",
    constrain: true,
   // closable: false,
    closeAction: "destroy",
    initComponent: function () {
        this.items = [
            {
                xtype: 'form',
                reference: 'paneliconform',
                id: 'paneliconform',
                autoScroll: true,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                border: false,
                // padding: '5px',
                //bodyStyle: 'margin: 10px; padding: 5px 3px;',
                bodyStyle: 'padding: 5px 5px;',
                waitMsgTarget: 'Выполняется длительный процесс..',
                waitTitle: 'Ожидайте',
                listeners: {
                    dirtychange: function() {
                        Ext.getCmp('saveButton').enable();
                    }
                },
                buttons: [{
                    text: "Сохранить",
                    name: 'saveButton',
                    id: 'saveButton',
                    tooltip: "Сохранить документ",
                    disabled: true,
                    action: "save",
                    iconCls: "fa fa-floppy-o"
                }]
            }
        ];
        this.callParent(arguments);
    }
});
