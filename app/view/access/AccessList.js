Ext.define("roadInfo.view.access.AccessList", {
    extend: Ext.window.Window,
    alias: "widget.accesslist",
    title: "Пользователи",
    id: "accesslist",
    layout: "fit",
    width: 1000,
    height: 500,
    modal: true,
    maximizable: true,
    collapsible: false,
    border: 0,
    iconAlign: "left",
    iconCls: 'fa fa-users',
    requires: [
        'roadInfo.view.access.AccessListController',
        "roadInfo.view.access.Access"
    ],
    controller: 'accesslistcontroller',
    defaults: {
        border: 0
    },
    listeners:{
        'close': 'onCloseWindow'
    },
    initComponent: function () {
        this.tbar = {
            xtype: "toolbar",
            enableOverflow: true,
            defaults: {
                iconAlign: "left",
                scale: "small"
            },
            items: [
                //{xtype: "tbseparator"},
                {
                    text: "Добавить",
                    reference: "add",
                    tooltip: "Добавить пользователя",
                    action: "add",
                    iconCls: "fa fa-plus"
                }, {
                    text: "Изменить",
                    reference: "edit",
                    tooltip: "Изменить пользователя",
                    action: "edit",
                    iconCls: "fa fa-pencil"
                }, {
                    text: "Удалить",
                    reference: "delete",
                    tooltip: "Удалить пользователя",
                    action: "del",
                    iconCls: "fa fa-minus"
                },
                {xtype: "tbseparator"},
                {
                    xtype: 'button',
                    iconCls: 'fa fa-lock',
                    tooltip: "Назначить пользователю доступ к списку районов и ведомостей",
                    text: 'Доступ',
                    reference: 'access',
                    action: 'access'
                }
            ]
        };
        this.items = [{
            xtype: 'grid',
            reference: 'accesslistgrid',
            id: 'accesslistgrid',
            autoScroll: true,
            store: 'RefAccessUsers',
            plugins: [{
                ptype: 'rowediting',
                pluginId: 'RowEditingPlugin',
                clicksToEdit: 2,
                listeners: {
                    edit: 'onGridEditorEdit',
                    canceledit: 'onGridEditorCancelEdit'
                }
            }],
            columns: [
                //{dataIndex: 'id', text: 'id'},
                {
                    dataIndex: 'auth_user_id',
                    text: 'Имя пользователя',
                    flex: 1,
                    editor: {
                        xtype: 'combobox',
                        store: 'RefAccessAuthUsers',
                        displayField: "name",
                        displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">', '{name} - [{login}] - [{company}]', '</tpl>'),
                        valueField: 'id',
                        queryMode: "local",
                        forceSelection: false,
                        anyMatch: true,
                        typeAhead: true,
                        typeAheadDelay: 30,
                        caseSensitive: false,
                        matchFieldWidth: false,
                        allowBlank: false,
                        listConfig: {
                           // itemTpl: '{name} - [{login}]',
                            itemTpl: ['<div><b style="font-size:12px">{name} - [{login}]</b><div style="font-size:10px; padding-left:20px;"><i>{company}</i></div></div>'],
                            listeners: {
                                beforeshow: function (picker) {
                                    picker.minWidth = picker.up('combobox').getSize().width;
                                }
                            }
                        }
                    },
                    renderer: function (G, E) {
                        if (G == null) {
                            return ""
                        }
                        var s = Ext.getStore('RefAccessAuthUsers'),
                            F = s.findExact("id", G),
                            c = s.getAt(F);
                        if (c) {
                            return c.get("name") + ' - [' + c.get("login") + ']' + ' - [' + c.get("company") + ']';
                        }
                    }
                },
                {
                    dataIndex: 'role_id',
                    text: 'Роль пользователя',
                    width: 200,
                    editor: {
                        xtype: 'combobox',
                        store: 'RefAccessRoles',
                        displayField: "name",
                        valueField: 'id',
                        queryMode: "local",
                        anyMatch: true,
                        forceSelection: false,
                        typeAhead: true,
                        typeAheadDelay: 30,
                        caseSensitive: false,
                        matchFieldWidth: false,
                        allowBlank: false,
                        listConfig: {
                            listeners: {
                                beforeshow: function (picker) {
                                    picker.minWidth = picker.up('combobox').getSize().width;
                                }
                            }
                        }
                    },
                    renderer: function (G, E) {
                        if (G == null) {
                            return ""
                        }
                        var s = Ext.getStore('RefAccessRoles'),
                            F = s.findExact("id", G),
                            c = s.getAt(F);
                        if (c) {
                            return c.get("name");
                        }
                    }
                }
            ]
        }];
        this.callParent(arguments);
    }

});