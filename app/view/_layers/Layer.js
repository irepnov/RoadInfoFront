Ext.define("roadInfo.view.layers.Layer", {
    extend: Ext.window.Window,
    alias: "widget.createlayer",
    title: "Создание/Изменение объекта",
    layout: "fit",
    width: 800,
    height: 600,
    modal: true,
    iconCls: "pencil",
    constrain: true,
    closable: false,
    closeAction: "destroy",
    initComponent: function() {
        this.items = [{
            xtype: "form",
            autoScroll: true,
            bodyStyle: {
                padding: "10px"
            },
            fieldDefaults: {
                anchor: "100%",
                allowBlank: true,
                labelWidth: 150,
                labelAlign: "left",
                labelStyle: "font: 12px helvetica,arial,verdana,sans-serif;color: #666"
            }
        }];
        this.buttons = [{
            text: "Сохранить",
            action: "apply",
            iconCls: "tick"
        }, {
            text: "Отмена",
            action: "cancel",
            iconCls: "cross"
        }];
        this.tools = [{
            type: "close",
            tooltip: "Закрыть",
            action: "close"
        }];
        this.callParent(arguments)
    }
});

/*Ext.define("roadInfo.view.layers.Layer", {
    extend: Ext.window.Window,
    alias: "widget.layer",
    title: "Документы",
    id: "layer",
    layout: "fit",
    iconCls: "table16",
    config: {
        fields: null,
        values: null,
        table: null
    },
    width: 800,
    height: 500,
    modal: true,
    maximizable: true,
    collapsible: false,
    autoScroll: true,
    border: 0,
    iconAlign: "left",
    requires: [
        'roadInfo.view.layers.LayerController'
    ],
    controller: 'layercontroller',
    defaults: {
        border: 0
    },
    listeners:{
      'close': function () {
          //alert('1');
      }
    },
    initComponent: function () {
        this.items = [
            {
                xtype: 'form',
                reference: 'panellayerform',
                id: 'panellayerform',
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
                items: this.loadComponent(), //создам поля динамиченски
                listeners: {
                    dirtychange: function() {
                        alert('cccc');
                        saveButton.enable();
                    }
                },
                buttons: [{
                    text: "Сохранить",
                    name: 'saveButton',
                    id: 'saveButton',
                    tooltip: "Сохранить документ",
                    disabled: true,
                    action: "save",
                    iconCls: "save16"
                }]
            }
        ];
        this.callParent(arguments);
    },

    loadComponent: function(){
        var me = this,
            comp = [];
        if (!me.getFields()) return;
        Ext.each(me.getFields(), function (obj) {
            var new_obj = null;
            switch (obj.xtype) {
                case "combobox":
                    new_obj = {
                        xtype: obj.xtype,
                        name: obj.name,
                        id: obj.id,
                        reference: obj.reference,
                        fieldLabel: obj.fieldLabel,
                        labelWidth: obj.labelWidth,
                        forceSelection: obj.forceSelection,
                        typeAhead: obj.typeAhead,
                        typeAheadDelay: obj.typeAhead,
                        store: new Ext.data.SimpleStore({id: 0, fields: ['id', 'text'], data: obj.values}),
                        valueField: 'id',
                        displayField: 'text',
                        queryMode: obj.queryMode
                    }
                    break;
                default:
                    new_obj = obj;
                    break;
            }
            if (new_obj){
                if (me.getValues()) {//если есть массив значений для инициализации, то установлю их
                    var v = me.getValues()[new_obj['name']];

                    if (v) {
                        typeof(v) === 'string' ? new_obj['value'] = v.trim() : new_obj['value'] = v;
                    }
                }
                comp.push(new_obj);
            }
        });
        return comp;
    }

});*/

