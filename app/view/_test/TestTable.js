
///   https://habr.com/ru/post/158513/

Ext.define("roadInfo.view._test.TestTable", {
    extend: Ext.window.Window,
    alias: "widget.testtable",
    title: "Ведомость",
    id: "testtable",
    layout: "fit",
    iconCls: "table16",
    width: 1000,
    height: 600,
    maximizable: true,
    collapsible: false,
    border: false,
    bodyStyle: 'padding: 5px 5px;',
    iconAlign: "left",
    requires: ['roadInfo.view._test.TestTableController'],
    controller: 'testtablecontroller',
    defaults: {
        border: 1
    },
    initComponent: function () {
        var s = Ext.getStore('RefTest');
        s.load();
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
                }]
        };
        this.items = [
            {
                xtype: 'image',   //<== where the image will be shown
                height: 120,
                reference: 'photo_thumb',
                width: 120,
                src: '%22%22'
            },
            {
                xtype: 'grid',
                flex: 1,
                reference: 'testgrid',
                autoScroll: true,
                store: s,
                plugins: [{
                    ptype: 'rowediting',
                    pluginId: 'RowEditingPlugin',
                    clicksToEdit: 2,
                    listeners: {
                        edit: 'onGridEditorEdit',
                        canceledit: 'onGridEditorCancelEdit'
                    }
                }],
                selModel: {selType: 'checkboxmodel'},
                columns: [
                    {dataIndex: 'id', text: 'id'}
                    , {dataIndex: 'name', text: 'name', editor: {xtype: "textfield"}}
                    , {dataIndex: 'date', text: 'date', xtype: 'datecolumn', format: 'd.m.y', editor: {xtype: "datefield"}}

                    , {dataIndex: 'file_name', text: 'file_name'} //not edit
                    , {dataIndex: 'file_dialog', text: 'file_dialog', editor: {xtype: "filefield", buttonText: "", buttonConfig: {
                                iconCls: "fa fa-paperclip"
                            }, buttonOnly: true, hideLabel: true, listeners: {change: 'onFileChange'}}} //added column grid
                    , {dataIndex: 'file_content', text: 'file_content'} //added column model

                    , {dataIndex: 'created_at', text: 'date', xtype: 'datecolumn', format: 'd.m.y H:i:s'} //not edit
                    , {dataIndex: 'updated_at', text: 'date', xtype: 'datecolumn', format: 'd.m.y H:i:s'} //not edit
                    , {dataIndex: 'deleted_at', text: 'date', xtype: 'datecolumn', format: 'd.m.y H:i:s'} //not edit
                ]
            }

        ];
        this.callParent(arguments);
    }

});

