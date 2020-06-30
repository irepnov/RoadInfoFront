Ext.define("roadInfo.view.layer_editor.LayerEditor", {
    extend: Ext.window.Window,
    alias: "widget.layereditor",
    title: "Информация о ведомости",
    id: "layereditor",
    iconCls: "fa fa-cogs",
    width: 1200,
    height: 800,
    config: {
        layer: null
    },
    maximizable: true,
    collapsible: false,
    modal: true,
    border: false,
    bodyStyle: 'padding: 5px 5px;',
    iconAlign: "left",
    requires: ['roadInfo.view.layer_editor.LayerEditorController'],
    controller: 'layereditorcontroller',
    defaults: {
        border: 1
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    autoScroll: true,
    initComponent: function () {
        var cdef = roadInfo.app.getController('default'),
            iconsStore = cdef.getDictionaryStore('dict_icons'),
            me = this,
            editorBoolean = {
                xtype: 'combobox',
                store: cdef.getBooleanStore(),
                displayField: "name",
                valueField: 'code',
                queryMode: "local",
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
            };

        if (!this.storeMeta) {
            this.storeMeta = cdef.getLayerMetaStore(this.layer.id);
        }

        if (!this.storeGeometryType){
            var a = [{
                code: 'Point',
                name: "Точка на карте"
            }, {
                code: "LineString",
                name: "Линия на карте"
            }];
            this.storeGeometryType = Ext.create("Ext.data.Store", {
                fields: ["code", "name"],
                data: a,
                proxy: {
                    type: "memory"
                }
            });
        }


        //  Ext.getStore('RefLayersAll').load({
        //    callback: function () {
        Ext.getStore('RefLayerIconsList').load({
            params: {
                layer: me.layer.id
            }
        });
        //    }
        //  });


        this.items = [
            {
                flex: 2,
                autoScroll: true,
                iconCls: 'fa fa-pencil',
                xtype: 'form',
                reference: 'formInfo',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                title: 'Общие сведения о ведомости',
                collapsible: true,
                collapsed: true,
                bodyStyle: 'padding: 5px 5px;',
                items: [
                    {
                        xtype: 'hiddenfield',
                        fieldLabel: 'Наименование:',
                        name: 'id',
                        id: 'id',
                        reference: 'id',
                        labelWidth: 200,
                        allowBlank: false
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Наименование:',
                        name: 'name',
                        id: 'name',
                        reference: 'name',
                        labelWidth: 200,
                        allowBlank: false
                    },
                    {
                        xtype: "combobox",
                        reference: 'geometry_type',
                        name: 'geometry_type',
                        id: 'geometry_type',
                        store: this.storeGeometryType,
                        displayField: "name",
                        fieldLabel: 'Графический элемент:',
                        valueField: "code",
                        queryMode: "local",
                        forceSelection: true,
                        allowBlank: false,
                        //matchFieldWidth: false,
                        labelWidth: 200,
                        allowBlank: true
                        /*listeners: {
                            change: function (combo, newValue, oldValue, eOpts) {
                                var t = me.storeMeta,
                                    g =0;
                            }
                        }*/
                    },
                    {
                        xtype: "combobox",
                        reference: 'dict_icons',
                        name: 'dict_icons',
                        id: 'dict_icons',
                        store: iconsStore,
                        displayField: "name",
                        fieldLabel: 'Иконка:',
                        valueField: "code",
                        queryMode: "local",
                        forceSelection: true,
                        allowBlank: false,
                        matchFieldWidth: false,
                        labelWidth: 200,
                        displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">', '{code} - {name}', '</tpl>'),
                        listConfig: {
                            itemTpl: ['<div><img style="width: 16px; height: 16px" src="resources/layers/icons/{code}" class="icon"/> {name}</div>'],
                            listeners: {
                                beforeshow: function (picker) {
                                    picker.minWidth = picker.up('combobox').getSize().width;
                                }
                            }
                        },
                        listeners: {
                            change: function (combo, newValue, oldValue, eOpts) {
                                this.setFieldStyle("background-image: url('resources/layers/icons/" + newValue + "'); " +
                                    "background-repeat: no-repeat; " +
                                    "background-size: 16px 16px;" +
                                    "background-position-y: 2px;" +
                                    "background-position-x: 2px;" +
                                    "padding-left: 20px;");
                            }
                        },
                        allowBlank: false
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Таблица БД',
                        name: 'table_name',
                        id: 'table_name',
                        reference: 'table_name',
                        labelWidth: 200,
                        allowBlank: false,
                        disabled: true
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Хранимая процедура сводной ведомости',
                        name: 'proc_agr_name',
                        id: 'proc_agr_name',
                        reference: 'proc_agr_name',
                        labelWidth: 250,
                        disabled: true
                    }
                ],
                waitMsgTarget: 'Выполняется длительный процесс..',
                waitTitle: 'Ожидайте',
                listeners: {
                    dirtychange: function () {
                        Ext.getCmp('saveButtonInfo').enable();
                    }
                },
                buttons: [{
                    text: "Сохранить",
                    name: 'saveButtonInfo',
                    id: 'saveButtonInfo',
                    reference: 'saveButtonInfo',
                    tooltip: "Сохранить документ",
                    disabled: true,
                    action: "save",
                    iconCls: "fa fa-floppy-o"
                }]
            },
            {
                margin: {top: 5, left: 0, right: 0, bottom: 0},
                flex: 3,
                xtype: 'grid',
                title: 'Структура ведомости',
                enableCtxMenu: false,  // turn off header context menu
                enableColLock: false,  // turn off column lock context items
                enableColumnMove: false,  // turn off column reorder drag drop
                enableColumnResize: false,  // turn off column resize for whole grid
                collapsible: true,
                collapsed: true,
                iconCls: 'fa fa-list',
                reference: 'layerattributesgrid',
                id: 'layerattributesgrid',
                autoScroll: true,
                store: me.storeMeta,
                bodyStyle: 'padding: 5px 5px;',
                plugins: [
                    {
                        ptype: 'cellediting',
                        pluginId: 'CellEditingMeta',
                        clicksToEdit: 2
                    }
                    // {
                    //     ptype: 'rowediting',
                    //     pluginId: 'RowEditingMeta',
                    //     clicksToEdit: 2,
                    //     listeners: {
                    //         edit: 'onGridEditorEdit',
                    //         canceledit: 'onGridEditorCancelEdit'
                    //     }
                    // }
                ],
                columns: [
                    {
                        xtype: "gridcolumn",
                        text: 'Наименование характеристики',
                        sortable: false,
                        menuDisabled: true,
                        dataIndex: 'display_name',
                        cellWrap: true,
                        editor: {xtype: "textfield", allowBlank: false},
                        flex: 3
                    },
                    //   {
                    //       xtype: "gridcolumn",
                    //       text: 'Справочник',
                    //       dataIndex: 'table_ref_name',
                    //       cellWrap: true,
                    //       flex: 2,
                    //   },
                    // {
                    //       xtype: 'actioncolumn',
                    //       width: 40,
                    //       items: [{
                    //           icon: "resources/table16.png",
                    //           handler: function (grid, rowIndex, colIndex, item) {
                    //               var record = grid.getStore().getAt(rowIndex);
                    //               alert(record.get("table_ref_name"));
                    //           },
                    //           isDisabled: function (view, rowIndex, colIndex, item, record) {
                    //               return !record.get('table_ref_name');
                    //           }
                    //       }]
                    //   },
                    {
                        xtype: "gridcolumn",
                        header: "Справочник",
                        dataIndex: "table_ref_name",
                        sortable: false,
                        menuDisabled: true,
                        flex: 2,
                        renderer: function (value, metaData) {
                            if (value && value !== "amstrad_routes.objects")
                                return '<a href="#">' + value + '</a>'
                            else return value;
                        },
                        listeners: {
                            click: function (grid, htmlSomething, rowIndex, columnIndex, theEvent) {
                                var record = grid.getStore().getAt(rowIndex),
                                    dict = record.get("table_ref_name"),
                                    display_name = record.get("display_name");
                                if (dict && dict !== "amstrad_routes.objects") { //игнорирую справочник Дорог
                                    if (me.editdict) {
                                        me.editdict.close();
                                        me.editdict = null;
                                    }
                                    me.editdict = Ext.widget("dicts", {dict: dict});
                                    me.editdict.setTitle("Редактор справочника: " + display_name);
                                    me.editdict.show();
                                }
                            }
                        }
                    },
                    {
                        xtype: "booleancolumn",
                        text: 'Скрытое',
                        dataIndex: 'isHidden',
                        sortable: false,
                        menuDisabled: true,
                        cellWrap: true,
                        editor: editorBoolean,
                        trueText: "Да",
                        falseText: "Нет",
                        flex: 1
                    },
                    {
                        xtype: "booleancolumn",
                        text: 'Нередактир.',
                        dataIndex: 'isDisabled',
                        sortable: false,
                        menuDisabled: true,
                        cellWrap: true,
                        editor: editorBoolean,
                        trueText: "Да",
                        falseText: "Нет",
                        flex: 1
                    },
                    {
                        xtype: "booleancolumn",
                        text: 'Обязательное',
                        dataIndex: 'isRequired',
                        sortable: false,
                        menuDisabled: true,
                        cellWrap: true,
                        editor: editorBoolean,
                        trueText: "Да",
                        falseText: "Нет",
                        flex: 1
                    }, {
                        xtype: "numbercolumn",
                        text: 'Макс. кол-во символов',
                        sortable: false,
                        menuDisabled: true,
                        dataIndex: 'maxLength',
                        cellWrap: true,
                        editor: {xtype: "numberfield"},
                        flex: 1
                    }, {
                        text: "Смещение элемента",
                        sortable: false,
                        columns: [
                            {
                                xtype: "booleancolumn",
                                text: 'Опред. направление',
                                dataIndex: 'isOffsetPosition',
                                sortable: false,
                                menuDisabled: true,
                                cellWrap: true,
                                editor: editorBoolean,
                                trueText: "Да",
                                falseText: "Нет",
                                flex: 1
                            },
                            {
                                xtype: "booleancolumn",
                                text: 'Опред. величину',
                                dataIndex: 'isOffsetValue',
                                sortable: false,
                                menuDisabled: true,
                                cellWrap: true,
                                editor: editorBoolean,
                                trueText: "Да",
                                falseText: "Нет",
                                flex: 1
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'grid',
                title: 'Условные обозначения и условия их отображения',
                collapsible: true,
                collapsed: true,
                iconCls: 'fa fa-picture-o',
                enableCtxMenu: false,  // turn off header context menu
                enableColLock: false,  // turn off column lock context items
                enableColumnMove: false,  // turn off column reorder drag drop
                enableColumnResize: false,  // turn off column resize for whole grid
                margin: {top: 5, left: 0, right: 0, bottom: 0},
                flex: 2,
                reference: 'layericonsgrid',
                autoScroll: true,
                store: 'RefLayerIconsList',
                bodyStyle: 'padding: 5px 5px;',
                listeners: {
                    itemdblclick: 'onRowDblIconClick'
                },
                tbar: [{
                    text: "Добавить",
                    tooltip: "Добавить иконку",
                    action: "add",
                    iconCls: "fa fa-plus"
                },
                    {
                        text: "Изменить",
                        tooltip: "Изменить иконку", //изменить фото, название оставить прежднее
                        action: "edit",
                        iconCls: "fa fa-pencil"
                    },
                    {
                        text: "Удалить",
                        tooltip: "Удалить иконку", //выбрать все справочники, заменить в Нулл все ссылки
                        action: "delete",
                        iconCls: "fa fa-minus"
                    }],
                columns: [
                    {
                        xtype: "gridcolumn",
                        text: 'Ведомость',
                        dataIndex: 'layer_id',
                        sortable: false,
                        menuDisabled: true,
                        cellWrap: true,
                        lockable: false,
                        flex: 1,
                        hasCustomRenderer: true,
                        renderer: function (G, E) {
                            if (G == null) {
                                return ""
                            }
                            var s = Ext.getStore('RefLayersAll'),
                                F = s.findExact("id", G),
                                c = s.getAt(F);
                            if (c) {
                                return c.get("name")
                            }
                        }
                    },
                    {
                        xtype: "gridcolumn",
                        // text: '',
                        //text: '<img class="header-icon" style="vertical-align:middle;margin-bottom:4px;" src="resources/image16.png"/>',
                        text: '<div style="vertical-align:middle;margin-bottom:4px;" class="fa fa-picture-o"></div>',
                        sortable: false,
                        menuDisabled: true,
                        dataIndex: 'dict_icons',
                        cellWrap: true,
                        lockable: false,
                        width: 50,
                        minWidth: 40,
                        maxWidth: 60,
                        hasCustomRenderer: true,
                        renderer: function (G, E) {
                            if (G == null) {
                                return ""
                            }
                            return '<img style="width: 16px; height: 16px" src="' + roadInfo.config.config.path.icons_layers + G + '" alt="' + roadInfo.config.config.path.icons_layers + G + '"/>';
                        }
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});