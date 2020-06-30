Ext.define('roadInfo.view.layer_icons.LayerIconController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.layericoncontroller',

    init: function () {
        this.control({
            "layericon button[action=save]": {
                click: this.onSaveClick
            }
        });

        if (this.getView().getLayer_id()) {
            var combolayer = this.lookupReference('combolayer');
            combolayer.setValue(this.getView().getLayer_id());
            combolayer.setDisabled(true);
        }

        if (this.getView().row_id) {
            var comboicon = this.lookupReference('comboicon');
            comboicon.setValue(this.getView().getDict_icons());
        }
    },

   /* callbackDictLoading: function () {
        var whereparamiconsgrid = Ext.getCmp('whereparamiconsgrid');
        if (whereparamiconsgrid) whereparamiconsgrid.getView().refresh();
    },*/

    onComboLayersChange: function (combo, newValue, oldValue, eOpts) {
        var cdef = roadInfo.app.getController('default'),
            me = this;
        if (cdef) {
            if (this.getView().row_id) {
                var callback = function () {
                    var layy = cdef.getLayerMetaInfo(newValue, 1);
                    loadedStores = true;
                    Ext.each(layy.storeFields, function (store) {
                        if (store.isLoading()) {
                            loadedStores = false;
                        }
                    });
                    if (loadedStores) {
                        var whereparamiconsgrid = me.lookupReference('whereparamiconsgrid');
                        if (whereparamiconsgrid) whereparamiconsgrid.getView().refresh();
                    }
                },
                    layerMetaInfo = cdef.getLayerMetaInfo(newValue, 1, callback); //в случае редактирования записи, добавляю калбак, колторый обновит Грид, при окончании загрузке справочника
            } else {
                layerMetaInfo = cdef.getLayerMetaInfo(newValue, 1, null);
            }
        }
        if (!layerMetaInfo) return;

        if (!this.storeParams) {
            this.storeParam = Ext.create('Ext.data.Store', {
                fields: ['field', 'display', 'value', 'editor', 'typeAttributeValue'],
                proxy: {
                    type: 'memory'
                }
            })
        }

        var me = this;
        Ext.each(layerMetaInfo.gridFields, function (item) {
            if (/*item.typeAttributeValue == 12 ||*/ item.typeAttributeValue == 13) {
                var val;
                if (me.getView().getWhere_param()) {
                    val = me.getView().getWhere_param()[item.dataIndex];
                } else val = null;

                me.storeParam.add({
                    field: item.dataIndex,
                    display: item.text,
                    value: val,
                    editor: item.editor,
                    typeAttributeValue: item.typeAttributeValue
                });
            }
        });

        var layericonspanel = this.lookupReference('layericonspanel'),
            whereparamiconsgrid = this.lookupReference('whereparamiconsgrid');
        if (whereparamiconsgrid){
            layericonspanel.remove(whereparamiconsgrid);
        }

        var grid = Ext.create("Ext.grid.Panel", {
            reference: 'whereparamiconsgrid',
            //id: 'whereparamiconsgrid',
            autoScroll: true,
            store: this.storeParam,
            selModel: {
                type: 'cellmodel'
            },
            plugins: {
                ptype: 'cellediting',
                clicksToEdit: 1
            },
            columns: [
                {
                    xtype: "gridcolumn",
                    text: 'Характеристика',
                    dataIndex: 'display',
                    cellWrap: true,
                    lockable: false,
                    flex: 2
                },
                {
                    xtype: "gridcolumn",
                    text: 'Значение',
                    dataIndex: 'value',
                    cellWrap: true,
                    lockable: false,
                    flex: 1,
                    getEditor: function (record) {
                        var grid = this.up('grid'),
                            cellediting = grid.findPlugin('cellediting'),
                            editors = cellediting.editors,
                            editor = editors.getByKey(this.id);
                        if (editor) {
                            editors.remove(editor);
                        }
                        if (record.get("editor")) {
                            return record.get("editor");
                        } else return {
                            xtype: 'textfield',
                            allowBlank: true
                        };
                    },
                    renderer: function (G, E) {
                        if (G == null) {
                            return ""
                        }
                        var Ed = E.record.get("editor"),
                            T = E.record.get("typeAttributeValue");
                        if (Ed) {
                            var S, F, c;
                            if (T == 12) {
                                S = cdef.getBooleanStore();
                                F = S.findExact("code", (G == true));
                                c = S.getAt(F);
                            } else {
                                S = Ed.store;
                                F = S.findExact("code", G.toString().trim());
                                c = S.getAt(F);
                            }
                        }
                        if (c) {
                            return c.get("name")
                        }
                    }
                }
            ]

        });


        layericonspanel.add(grid);
        layericonspanel.updateLayout();
    },

    onSaveClick: function () {
        var whereparamiconsgrid = this.lookupReference('whereparamiconsgrid'),
            layercombo = this.lookupReference('combolayer'),
            iconcombo = this.lookupReference('comboicon'),
            me = this;

        if (!layercombo.getValue()) {
            Ext.Msg.alert('Внимание', 'Не указана ведомость');
            return;
        }

        if (!iconcombo.getValue()) {
            Ext.Msg.alert('Внимание', 'Не указана иконка');
            return;
        }

        if (!whereparamiconsgrid) {
            Ext.Msg.alert('Внимание', 'Не заданы условия отображения иконки');
            return;
        }

        var rows = whereparamiconsgrid.getStore().getRange(),
            where_param = {};

        Ext.each(rows, function (item) {
            if (item.data.value !== null && item.data.value !== undefined) {
                if (item.data.typeAttributeValue == 12) {
                    where_param[item.data.field] = item.data.value === true ? 1 : 0;
                } else where_param[item.data.field] = item.data.value;
            }
        });

        if (Object.keys(where_param).length == 0) {
            Ext.Msg.alert('Внимание', 'Не заданы условия отображения иконки');
            return;
        };

        var uri, json;
        if (this.getView().getRow_id()) {
            uri = ProxyUrlBackend + '/roadinfo/layericons/update/';
            json = Ext.util.JSON.encode({
                "id": this.getView().getRow_id(),
                "layer_id": layercombo.getValue(),
                "dict_icons": iconcombo.getValue(),
                "where_param": where_param
            })
        } else {
            uri = ProxyUrlBackend + '/roadinfo/layericons/create/';
            json = Ext.util.JSON.encode({
                "layer_id": layercombo.getValue(),
                "dict_icons": iconcombo.getValue(),
                "where_param": where_param
            })
        }

        Ext.Ajax.request({
            url: uri,
            method: 'post',
            scope: this,
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
            cors: true,
            useDefaultXhrHeader: false,
            jsonData: json,
            success: function (response, options) {
                var jsonResp = Ext.util.JSON.decode(response.responseText);
                Ext.MessageBox.alert("Информация", "Сохранение выполнено успешно", function () {
                    Ext.getStore('RefLayerIconsList').reload();
                    var win = this.getView();
                    if (win) win.destroy();
                }, this);
            },
            failure: function (response, options) {
                var mes;
                try {
                    var jsonResp = Ext.util.JSON.decode(response.responseText);
                    mes = jsonResp.message;
                } catch (e) {
                    mes = response.statusText;
                }
                Ext.Msg.alert("Ошибка", "При создании (изменении) записи возникла ошибка:<br/>" + mes);
            }
        });


    }

});
