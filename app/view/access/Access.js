Ext.define("roadInfo.view.access.Access", {
    extend: Ext.window.Window,
    alias: "widget.access",
    title: "Доступ",
    id: "access",
    layout: "fit",
    config: {
        user_id: null,
        munobrs: null,
        layers: null
    },
    width: 900,
    height: 700,
    modal: true,
    maximizable: true,
    collapsible: false,
    border: 0,
    iconAlign: "left",
    iconCls: 'fa fa-lock',
    requires: [
        'roadInfo.view.access.AccessController',
        'Ext.ux.form.ItemSelector'
    ],
    controller: 'accesscontroller',
    defaults: {
        border: 0
    },
    initComponent: function () {

        var storeLayers = Ext.getStore('RefAccessLayersTreeAll'),
            nodeRoot = storeLayers.getRoot(),
            layers = this.layers || [];
        nodeRoot.cascadeBy(function (child) {
            child.set("checked", false);
            if (child.get("leaf")) {
                child.set("checked", layers.includes(child.get("id")));
            }
        });

        this.items = [
            {
                xtype: 'form',
                reference: 'panelaccessform',
                layout: {
                    type: 'fit'
                    //align: 'stretch'
                },
                border: 0,
                //padding: '10px',
                defaults: {
                    bodyPadding: 10
                },
                waitMsgTarget: 'Выполняется длительный процесс..',
                waitTitle: 'Ожидайте',
                autoScroll: true,
                items: [
                    {
                        xtype: 'tabpanel', // TabPanel itself has no title
                        activeTab: 0,      // First tab active by default
                        defaults: {
                            labelWidth: 50,
                            autoScroll: true,
                            anchor: '100%'
                        },
                        items: [
                            {
                                title: 'Районы',
                                iconCls: 'fa fa-bars',
                                layout: {
                                    type: 'fit'
                                },
                                items: [
                                    {
                                        xtype: 'itemselector',
                                        name: 'munobrs',
                                        reference: 'munobrs',
                                        anchor: '100%',
                                        // fieldLabel: 'Районы',
                                        store: 'RefAccessMunobrs',
                                        displayField: 'name',
                                        valueField: 'id',
                                        value: this.munobrs || null,
                                        allowBlank: true,
                                        msgTarget: 'side',
                                        fromTitle: 'Все',
                                        toTitle: 'Доступные'
                                    }
                                ]
                            },

                            {
                                title: 'Ведомости',
                                iconCls: 'fa fa-table',
                                layout: {
                                    // type: 'vbox',
                                    // align: 'stretch'
                                    type: 'fit'
                                },
                                items: [
                                    {
                                        xtype: 'treepanel',
                                        reference: 'treeLayersAccess',
                                        // padding: '5px',
                                        useArrows: true, // +/- позле папочки
                                        lines: false,
                                        store: 'RefAccessLayersTreeAll',
                                       // checkPropagation: 'both',
                                        rootVisible: false,
                                        border: true,
                                        flex: 1,
                                        columns: [{
                                            xtype: 'treecolumn',
                                            dataIndex: 'text',
                                            flex: 1,
                                            cellWrap: true
                                        }],
                                        listeners: {
                                            checkchange: 'onCheckChangeTree'
                                        }
                                    }
                                ]
                            }
                        ]
                    }

                ],
                buttons: [{
                    text: "Сохранить",
                    tooltip: "Сохранить документ",
                    // disabled: true,
                    action: "save",
                    iconCls: "fa fa-floppy-o"
                }]
            }
        ];
        this.callParent(arguments);
    }

});