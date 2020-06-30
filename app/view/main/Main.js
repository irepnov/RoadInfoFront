//  http://qaru.site/questions/15749556/filter-on-a-extjs-store-using-an-array
//  https://examples.sencha.com/extjs/6.7.0/examples/classic/multiselect/multiselect-demo.html

Ext.define('roadInfo.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',
        'roadInfo.view.main.MainController',
        'roadInfo.view.main.MainModel',
        'roadInfo.component.yandexmap',

        'roadInfo.component.BindingVType',
        'roadInfo.component.bindingfield',

        //'roadInfo.view.main.MapToolbar',
        'roadInfo.view.main.MainMapToolbar',
        //'roadInfo.view.layers.LayersTable',

     //   "roadInfo.view._test.TestTable",

        'roadInfo.view.attachments.AttachList',
        'roadInfo.view.attachments.Attach',
        'roadInfo.component.AttachmentsPanel',


        //  'roadInfo.component.ExtraIcons',
        'roadInfo.view.searchkm.Searchkm',
        //'roadInfo.component.LayerInfoPanel',
        "roadInfo.view.dicts.DictsTable",
        //"roadInfo.view.layer_icons.LayerIconsTable",
        "roadInfo.view.layer_editor.LayerEditor",
        "roadInfo.view.access.AccessList",
        "roadInfo.view.layer_upload.LayerUpload",

        "roadInfo.view.layer_objects.LayerObjectsTable",
        //  'roadInfo.component.MyGridField'
        //  'roadInfo.component.yandexfield',

        'Ext.grid.*',
        'Ext.data.*'

    ],

    controller: 'main',
    plugins: 'viewport',
    layout: 'border',
    listeners: {
        afterlayout: 'onAfterLayout',
        afterrender: 'onAfterRender'
    },

    initComponent: function () {

        if (!this.storeInfoSelect) this.storeInfoSelect = Ext.create("Ext.data.Store", {
            fields: ["layer_id", "layer_name", "munobr_id", "object_name"],
            groupField: 'layer_name',
            proxy: {
                type: "memory"
            }
        });

        this.items = [
            {
                xtype: 'panel',
                region: 'west',
                title: 'Информация',
                iconCls: 'fa fa-filter',
                reference: 'mainnavig',
                collapsible: true,
                split: true,
                width: 500,
                minWidth: 400,
                maxWidth: 600,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                // tools: [
                //     {
                //         type: 'search',
                //         tooltip: "Фильтрация объектов содержания согласно списка ведомостей"
                //         ,handler: 'onFilterObjectsByLayer'
                //         //,callback: 'onFilterObjectsByLayer'
                //         // ,callback: function(panel, tool, event) {
                //         //     alert('call');
                //         // }
                //     }
                // ],
                items: [
                    {
                        xtype: 'panel',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        padding: '5px',
                        items: [
                            {
                                // margin: {top: 5, left: 5, right: 5, bottom: 5},
                                xtype: 'combo',
                                reference: 'comboMunobr',
                                id: 'comboMunobr',
                                fieldLabel: 'Район',
                                labelWidth: 100,
                                store: 'RefMunobrs',
                                multiSelect: true,
                                queryMode: 'local',
                                forceSelection: false,
                                allowBlank: false,
                                displayField: 'name',
                                valueField: 'id',
                                listeners: {
                                    //select: 'onComboMunobrSelect'
                                    change: 'onComboMunobrChange'
                                },
                                triggers: {
                                    filter: {
                                        cls: Ext.baseCSSPrefix + 'fa fa-filter',
                                        hidden: false,
                                        weight: 1,
                                        handler: 'onComboMunobrSetFilter'
                                    },
                                    clear: {
                                        cls: Ext.baseCSSPrefix + 'fa fa-eraser',
                                        hidden: true,
                                        weight: 0,
                                        handler: 'onComboMunobrClear'
                                    }
                                }
                            }, {
                                xtype: 'combo',
                                reference: 'comboObject',
                                id: 'comboObject',
                                fieldLabel: 'Объект',
                                labelWidth: 100,
                                store: 'RefObjects',
                                multiSelect: true,
                                queryMode: 'local',

                                //forceSelection: false,
                                forceSelection: true,
                                anyMatch: true,
                                // typeAhead: true,

                                allowBlank: true,
                                displayField: 'name',
                                disabled: true,
                                valueField: 'id',
                                matchFieldWidth: false,
                                /*displayTpl: new Ext.XTemplate( '<tpl for=".">',
                                    '{munobr}{[values.name && values.name ? \' - \' : \'\']}{name}',
                                    '<tpl if="xindex < xcount">,</tpl>',
                                    '</tpl>'),*/
                                listConfig: {
                                    // itemTpl: '[{munobr}] &nbsp&nbsp&nbsp [{name}] &nbsp&nbsp&nbsp [{km_beg}&nbsp-&nbsp{km_end}]',
                                    listeners: {
                                        beforeshow: function (picker) {
                                            picker.minWidth = picker.up('combobox').getSize().width;
                                        }
                                    }

                                },
                                listeners: {
                                    // select: 'onComboObjectsSelect',
                                    change: 'onComboObjectsChange'
                                }
                            },
                            {
                                xtype: 'button',
                                text: 'Показать на карте',
                                reference: 'showOnMap',
                                id: 'showOnMap',
                                disabled: true,
                                cls: "btn",
                                iconCls: 'fa fa-search',
                                listeners: {
                                    click: 'onClickShowYandexButton'
                                }
                            }/*,
                            {
                                xtype: 'bindingfield',
                                reference: "ttest",
                                allowBlankPoint: false,
                                vtype: 'vbinding',
                               // value: '4.777',
                                object_id: 251
                            },{
                                xtype: 'button',
                                text: 'Привязка',
                                cls: "btn",
                                iconCls: 'fa fa-search',
                                listeners: {
                                    click: 'onClickTestButton'
                                }
                            },
                            ,{
                                xtype: 'button',
                                text: 'roweditors + filefield',
                                cls: "btn",
                                iconCls: 'fa fa-search',
                                listeners: {
                                    click: 'onClickFileFieldButton'
                                }
                            }*/

                        ]
                    },
                    {
                        xtype: 'treepanel',
                        reference: 'treeLayers',
                        disabled: true,
                        id: 'treeLayers',
                        padding: '5px',
                        useArrows: true, // +/- позле папочки
                        lines: false,
                        store: 'RefLayersTreeForUser',
                        rootVisible: false,
                        border: false,
                        flex: 1,
                        columns: [{
                            xtype: 'treecolumn',
                            dataIndex: 'text',
                            flex: 1,
                            cellWrap: true
                        }],
                        listeners: {
                            itemcontextmenu: 'onTreeContextMenu',
                            checkchange: 'onTreeChackChange'
                        }
                    }
                ]
            },

            {
                xtype: "panel",
                id: "mappanel",
                iconCls: "fa fa-globe",
                title: 'Объекты содержания',
                cls: "my-header",
                header: {
                    titlePosition: 0,
                    items: [
                        {
                            xtype: 'button',
                           // margin: {top: 0, left: 10, right: 0, bottom: 0},
                            text: 'Справка',
                            iconCls: 'fa fa-question',
                            handler: 'onHelpClick'
                        },
                        {
                            xtype: 'button',
                            margin: {top: 0, left: 10, right: 0, bottom: 0},
                            iconCls: 'fa fa-lock',
                            text: 'Администрирование',
                            tooltip: "",
                            reference: 'access',
                            action: 'access',
                            menu: {
                                items: [{
                                    text: 'Справочники',
                                    iconCls: 'fa fa-th-list',
                                    listeners: {
                                        click: 'onClickDictsListButton'
                                    }
                                }, {
                                    text: 'Загрузка ведомости',
                                    iconCls: 'fa fa-cloud-upload',
                                    listeners: {
                                        click: 'onClickLayerImportButton'
                                    }
                                },
                                    {
                                        text: 'Пользователи',
                                        iconCls: 'fa fa-users',
                                        listeners: {
                                            click: 'onClickUsersButton'
                                        }
                                    }]
                            }
                        },
                        {
                            xtype: 'button',
                            margin: {top: 0, left: 10, right: 0, bottom: 0},
                            text: 'Выход',
                            iconCls: 'fa fa-sign-out',
                            handler: 'onExitClick'
                        }
                    ]
                },
                dockedItems: [
                    {
                        xtype: "mainmaptoolbar",
                        id: 'mainmaptoolbar',
                        reference: 'mainmaptoolbar'
                    }],
                region: "center",
                layout: "absolute",
                border: false,
                items: [
                    {
                        xtype: 'yandexmap',
                        id: 'yandexmap',
                        reference: 'yandexmap',
                        anchor: "100% 100%"
                    }/*,
                    {
                        xtype: 'maptoolbar',
                        id: 'maptoolbar',
                        reference: 'maptoolbar',
                        anchor: "40%"
                    }*/]
            },
            {
                region: 'south',
                split: true,
                collapsible: true,
                collapsed: true,
                disabled: true,
                height: 250,
                xtype: 'tabpanel',
                header: false,
                //hideCollapseTool: true,
                collapseMode: 'mini',
                reference: 'layerpanel',
                autoScroll: true,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                id: 'layerpanel',
                dockedItems: [
                    {
                        xtype: "toolbar",
                        reference: 'layertoolbar',
                        id: 'layertoolbar',
                        dock: 'top',
                        enableOverflow: true,
                        defaults: {
                            iconAlign: "left",
                            scale: "small"
                        },
                        items: [
                            {
                                text: "Добавить",
                                tooltip: "Добавить запись в ведомость",
                                action: "layer_add",
                                reference: "layer_add",
                                id: "layer_add",
                                iconCls: "fa fa-plus",
                                handler: "onLayerAddClick"
                            },
                            {
                                text: "Изменить",
                                tooltip: "Изменить запись из ведомости",
                                action: "layer_edit",
                                reference: "layer_edit",
                                id: "layer_edit",
                                iconCls: "fa fa-pencil",
                                handler: "onLayerEditClick"
                            },
                            {
                                text: "Удалить",
                                tooltip: "Переместить запись в архив",
                                action: "layer_delete",
                                reference: "layer_delete",
                                id: "layer_delete",
                                iconCls: "fa fa-minus",
                                handler: "onLayerDeleteClick"
                            },
                            {
                                xtype: "tbseparator"
                            },
                            {
                                text: "Показать на карте",
                                tooltip: "Показать отобранные элементы на карте",
                                action: "layer_map",
                                reference: "layer_map",
                                id: "layer_map",
                                iconCls: "fa fa-map",
                                handler: "onLayerMapClick"
                            },
                            /*{
                                text: "Местоположение",
                                tooltip: "Местоположение элемента на карте",
                                action: "layer_map_point",
                                reference: "layer_map_point",
                                id: "layer_map_point",
                                iconCls: "fa fa-map-marker",
                                handler: "onLayerMapPointClick"
                            },*/
                            {
                                xtype: "tbseparator"
                                //xtype: "tbfill"
                            },
                            {
                                text: "Экспорт",
                                tooltip: "Экспорт ведомости в XLS",
                                action: "layer_xls",
                                reference: "layer_xls",
                                id: "layer_xls",
                                iconCls: "fa fa-file-excel-o",
                                handler: 'onLayerExcelClick'
                            }
                        ]
                    }
                ],
                items: [
                    {
                        xtype: 'grid',
                        iconCls: 'fa fa-tasks',
                        title: 'Общие характеристики',
                        reference: 'gridInfoSelect',
                        id: 'gridInfoSelect',
                        store: this.storeInfoSelect,
                        flex: 1,
                        viewConfig: {
                            trackOver: false,
                            stripeRows: false
                        },
                        stateId: "gridInfoSelect",
                        stateful: true,
                        stateEvents: ['columnresize', 'columnmove', 'show', 'hide' /*,  'sortchange', 'groupchange'*/],
                        features: [{
                            id: 'group',
                            ftype: 'groupingsummary',
                            //  groupHeaderTpl: 'Ведомость:     {name}     ({rows.length} <tpl if="rows.length &gt; 1">объектов</tpl><tpl if="rows.length == 1">объект</tpl>)',   //'Раздел ресурса: {name}',//'{name}',{[values.rows[0].data.name]}
                            groupHeaderTpl: 'Ведомость:     {name}',
                            hideGroupedHeader: true,
                            enableGroupingMenu: false,
                            showSummaryRow: false,
                            startCollapsed: true
                        }],
                        columns:
                            [
                                {
                                    xtype: 'gridcolumn',
                                    text: 'Район',
                                    flex: 2,
                                    dataIndex: 'munobr_id',
                                    renderer: function (G, E) {
                                        if (G == null) {
                                            return ""
                                        }
                                        var s = Ext.getStore('RefMunobrs'),
                                            F = s.findExact("id", G),
                                            c = s.getAt(F);
                                        if (c) {
                                            return c.get("name")
                                        }
                                    }
                                },
                                {
                                    xtype: 'gridcolumn',
                                    text: 'Объект',
                                    flex: 3,
                                    dataIndex: 'object_name'
                                }
                            ]
                    }
                ],
                listeners: {
                    'tabchange': 'onTabChange'
                }
            }

        ];

        this.callParent();
    }

});





