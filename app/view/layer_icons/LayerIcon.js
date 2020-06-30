Ext.define("roadInfo.view.layer_icons.LayerIcon", {
    extend: Ext.window.Window,
    alias: "widget.layericon",
    title: "Создание/Изменение иконки",
    layout: "fit",
    requires: ['roadInfo.view.layer_icons.LayerIconController'],
    width: 500,
    height: 600,
    config: {
        row_id: null,
        layer_id: null,
        dict_icons: null,
        where_param: null
    },
    modal: true,
    iconCls: "fa fa-picture-o",
    controller: "layericoncontroller",
    constrain: true,
    closeAction: "destroy",
    autoScroll: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function () {
        var cdef = roadInfo.app.getController('default'),
            iconsStore = cdef.getDictionaryStore('dict_icons');

        this.items = [{
            xtype: 'panel',
            reference: 'layericonspanel',
            autoScroll: true,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            id: 'layericonspanel',
            bodyStyle: 'padding: 5px 5px;',
            items: [{
                xtype: "combobox",
                reference: 'combolayer',
                id: 'combolayer',
                store: 'RefLayersAll',
                displayField: "name",
                fieldLabel: 'Ведомость:',
                valueField: "id",
                queryMode: "local",
                forceSelection: true,
                typeAhead: true,
                typeAheadDelay: 30,
                caseSensitive: false,
                allowBlank: false,
                matchFieldWidth: false,
                listConfig: {
                    listeners: {
                        beforeshow: function (picker) {
                            picker.minWidth = picker.up('combobox').getSize().width;
                        }
                    }
                },
                listeners: {
                    change: 'onComboLayersChange'
                }
            },
                {
                    xtype: "combobox",
                    reference: 'comboicon',
                    id: 'comboicon',
                    store: iconsStore,
                    displayField: "name",
                    fieldLabel: 'Иконка:',
                    valueField: "code",
                    queryMode: "local",
                    forceSelection: true,
                    allowBlank: false,
                    matchFieldWidth: false,
                    displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">', '{code} - {name}', '</tpl>'),
                    listConfig: {
                       /* getInnerTpl: function (displayField) {
                            return '<img style="width: 16px; height: 16px" src="resources/layers/icons/{code}" class="icon"/> {name}';
                        },*/
                        itemTpl: ['<div><img style="width: 16px; height: 16px" src="resources/layers/icons/{code}" class="icon"/> {name}</div>'],
                        listeners: {
                            beforeshow: function (picker) {
                                picker.minWidth = picker.up('combobox').getSize().width;
                            }
                        }
                    },
                    listeners: {
                        change: function (combo, newValue, oldValue, eOpts) {
                            this.setFieldStyle("background-image: url('resources/layers/icons/" + newValue + "'); "+
                                "background-repeat: no-repeat; " +
                                "background-size: 16px 16px;"+
                                "background-position-y: 2px;"+
                                "background-position-x: 2px;"+
                                "padding-left: 20px;");
                        }
                    }
                }
            ]
        }
        ];
        this.buttons = [{
            text: "Сохранить",
            name: 'saveButtonIcon',
            id: 'saveButtonIcon',
            tooltip: "Сохранить документ",
            // disabled: true,
            action: "save",
            iconCls: "fa fa-floppy-o"
        }];

        /*if (this.row_id){
            var combolayer = Ext.getCmp('combolayer'),
                comboicon = Ext.getCmp('comboicon');
            combolayer.setValue(this.layer_id);
            comboicon.setValue(this.dict_icons);
        }*/

        this.callParent(arguments);
    }
});
