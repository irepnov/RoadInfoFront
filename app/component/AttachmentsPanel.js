Ext.define('roadInfo.component.AttachmentsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.attachmentspanel',

    defaults: {
        border: 0
    },
    layout: "fit",
    listeners: {
        afterrender: 'attach_onAfterRender'
    },
    initComponent: function () {
        var tree = {
            xtype: 'treepanel',
            reference: 'tree_attachmenttype',
            width: 300,
            height: '100%',
            store: 'RefAttachmentType',
            border: true,
            useArrows: true,
            rootVisible: false,
            listeners:{
                itemclick: 'attach_onNodeSelect'
            }
        };
        var panel = {
            xtype: 'panel',
            reference: 'panel_attachments',
            autoScroll: true,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1,
            /*dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    {
                        text: "Добавить",
                        tooltip: "Добавить",
                        action: "attach_add",
                        iconCls: "fa fa-plus"
                    }, {
                        text: "Изменить",
                        tooltip: "Изменить",
                        action: "attach_edit",
                        iconCls: "fa fa-pencil"
                    }
                ]
            }],*/
            items: []
        };

        this.items = [
            {
                xtype: 'container',
                layout: 'hbox',
                bodyStyle: 'padding: 5px 5px;',
                items: [tree, panel]
            }
        ];

        this.callParent(arguments);
    }
});