Ext.define('Munobr', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',  type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'objects_id', type: 'auto'}
    ]
});

Ext.define('MunobrStore', {
    extend: 'Ext.data.Store',
    model: 'Munobr'
});

Ext.define("roadInfo.view.searchkm.Searchkm", {
    extend: Ext.window.Window,
    alias: "widget.searchkm",
    title: "Поиск по километру",
    // id: "searchkm",
    layout: "fit",
    iconCls: "fa fa-map-marker",
    width: 600,
    height: 330,
    modal: true,
    maximizable: false,
    collapsible: false,
    autoScroll: true,
    border: 0,
    iconAlign: "left",
    requires: [
        'roadInfo.view.searchkm.SearchkmController'
    ],
    controller: 'searchkmcontroller',
    defaults: {
        border: 0
    },
    listeners: {
        'close': function () {
            //alert('1');
        }
    },
    initComponent: function () {
        var cdef = roadInfo.app.getController('default'),
            selectedMode = cdef.getSelectedMode(),
            stor = cdef.getDictionaryStore('amstrad_routes.objects');
        stor.clearFilter(true);
        stor.filterBy(function (record, id) {
            return Ext.Array.contains(selectedMode.objects_id, record.get('id'));
        });

        if (!this.storeMunobrs){
            var me = this;
            this.storeMunobrs = Ext.create('MunobrStore');

            if (selectedMode.munobrsSelectedID.length > 0){
                if (selectedMode.munobrsSelectedID.length > 1) this.storeMunobrs.add({id: 0, name: "ВСЕ", objects_id: selectedMode.objects_id});
                selectedMode.munobrsSelectedID.forEach(function (element) {
                    var munStore = Ext.getStore('RefMunobrs'),
                        munobr = munStore.getById(element),
                        objects_id = munobr.get('objects_id'),
                        name = munobr.get('name');
                    me.storeMunobrs.add({id: element, name: name, objects_id: objects_id});
                })
            }
        }

        this.items = [
            {
                xtype: 'form',
                reference: 'panelsearchkmform',
                id: 'panelsearchkmform',
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
                items: [
                    /* {xtype: 'mygridfield', value: [[1, 'ddd'], [2, 'ffff']]},
                     {xtype: 'yandexfield'},*/
                    {
                        xtype: 'combobox',
                        name: 'munobr',
                        id: 'munobr',
                        reference: 'munobr',
                        fieldLabel: 'Район',
                        labelWidth: 150,
                        store: this.storeMunobrs,
                        valueField: 'objects_id',
                        displayField: 'name',
                        queryMode: 'local',
                        allowBlanc: false,
                        forceSelection: true,
                        anyMatch: true,
                        typeAhead: true,
                        typeAheadDelay: 30,
                        listeners: {
                            change: 'onComboMunobrChange'
                        }
                    },
                    {
                        xtype: 'combobox',
                        name: 'object',
                        id: 'object',
                        reference: 'object',
                        fieldLabel: 'Объект содержания',
                        labelWidth: 150,
                        store: stor,
                        valueField: 'id',
                        displayField: 'name',
                        disabled: true,
                        queryMode: 'local',
                        allowBlanc: false,
                        forceSelection: true,
                        anyMatch: true,
                        typeAhead: true,
                        typeAheadDelay: 30,
                        listConfig: {
                            // itemTpl: '[{munobr}] &nbsp&nbsp&nbsp [{name}] &nbsp&nbsp&nbsp [{km_beg}&nbsp-&nbsp{km_end}]',
                            listeners: {
                                beforeshow: function (picker) {
                                    picker.minWidth = picker.up('combobox').getSize().width;
                                }
                            }
                        },
                        listeners: {
                            select: 'onComboObjectsSelect'
                        }
                    },
                    {
                        xtype: 'numberfield',
                        name: 'km_beg',
                        id: 'km_beg',
                        reference: 'km_beg',
                        fieldLabel: 'Километр с ' + ' <span class="req" style="color:red">*</span>',
                        labelWidth: 150,
                        disabled: true,
                        allowBlanc: false,
                        minValue: -100,
                        maxValue: 100,
                        allowDecimals: true,
                        decimalPrecision: 3
                    },
                    {
                        xtype: 'numberfield',
                        name: 'km_end',
                        id: 'km_end',
                        reference: 'km_end',
                        fieldLabel: 'Километр по',
                        disabled: true,
                        labelWidth: 150,
                        minValue: -100,
                        maxValue: 100,
                        allowDecimals: true,
                        decimalPrecision: 3
                    },
                    {
                        xtype: 'box',
                        autoEl: {cn: '<span class="req" style="color:red">*</span>' + 'Если заполнено только поле "Километр с" - будет произведен поиск точки на объекте содержания'}
                    }
                ], //создам поля динамиченски
                buttons: [{
                    text: "Показать на карте",
                    tooltip: "Показать на карте искомый участок",
                   // disabled: true,
                    action: "search",
                    reference: "search",
                    iconCls: "fa fa-search"
                }]
            }
        ];
        this.callParent(arguments);
    }


});