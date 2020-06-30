Ext.define("roadInfo.view.attachments.AttachList", {
    extend: Ext.window.Window,
    alias: "widget.attachlist",

    title: "Документы",
    id: "attachlist",
    layout: "fit",
    width: 1000,
    height: 600,
    modal: true,
    maximizable: true,
    collapsible: false,
    border: 0,
    iconAlign: "left",
    iconCls: 'fa fa-paperclip',
    requires: [
        'roadInfo.view.attachments.AttachListController'
        // 'roadInfo.view.attachments.Attach',
        // 'roadInfo.component.AttachmentsPanel'
    ],
    controller: 'attachlistcontroller',
    defaults: {
        border: 0
    },
    initComponent: function () {
        this.tbar = {
            xtype: "toolbar",
            enableOverflow: true,
            defaults: {
                iconAlign: "top",
                scale: "small"
            },
            items: [
                {
                    text: "Добавить",
                    tooltip: "Добавить документ",
                    action: "attach_add",
                    iconCls: "fa fa-plus"
                }, {
                    text: "Изменить",
                    tooltip: "Изменить документ",
                    action: "attach_edit",
                    iconCls: "fa fa-pencil"
                }, {
                    text: "Удалить",
                    tooltip: "Удалить документ",
                    action: "attach_del",
                    iconCls: "fa fa-minus"
                }, {
                    xtype: "tbfill"
                },
                {
                    text: "Скачать",
                    tooltip: "Скачать документ",
                    action: "attach_download",
                    iconCls: "fa fa-cloud-upload"
                }]
        };
        this.items = [
            {
                xtype: 'attachmentspanel',
                reference: 'attachmentspanel'
            }
        ];

        this.callParent(arguments);
    }

});