Ext.define('roadInfo.view.layer_editor.LayerEditorController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.layereditorcontroller',

    init: function () {

        this.control({
            "layereditor button[action=save]": {
                click: {
                    fn: this.onSaveButton,
                    act: 'save'
                }
            },

            "layereditor button[action=edit]": {
                click: {
                    fn: this.onEditIconButton,
                    act: 'edit'
                }
            },
            "layereditor button[action=add]": {
                click: {
                    fn: this.onAddIconButton,
                    act: 'add'
                }
            },
            "layereditor button[action=delete]": {
                click: {
                    fn: this.onDelIconClick,
                    act: 'del'
                }
            }

        })

        var formInfo = this.lookupReference('formInfo'),
            me = this;
        if (formInfo){
            formInfo.getForm().setValues(this.getView().getLayer());
        }
    },

    onDelIconClick: function () {
        var gridmain = this.lookupReference('layericonsgrid');
        var selrow = gridmain.getSelectionModel().getSelection()[0];
        if (!selrow) return;
        var resSelected = gridmain.store.getByInternalId(selrow.internalId).data;
        if (!resSelected) return;

        Ext.Ajax.request({
            url: ProxyUrlBackend + '/roadinfo/layericons/destroy/',
            method: 'POST',
            scope: this,
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
            cors: true,
            jsonData: Ext.util.JSON.encode({
                "id": resSelected.id
            }),
            useDefaultXhrHeader: false,
            success: function (response, options) {
                var jsonResp = Ext.util.JSON.decode(response.responseText);
                Ext.MessageBox.alert("Информация", "Документ успешно удален", function () {
                    gridmain.getStore().reload();
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
                Ext.Msg.alert("Ошибка", "При удалении записи возникла ошибка:<br/>" + mes);
            }
        });
    },

    onRowDblIconClick: function(){
        this.onEditIconButton();
    },

    onEditIconButton: function (button, eOpts, parameters) {
        var gridmain = this.lookupReference('layericonsgrid');
        var selrow = gridmain.getSelectionModel().getSelection()[0];
        if (!selrow) return;
        var resSelected = gridmain.store.getByInternalId(selrow.internalId);
        if (!resSelected) return;

        if (this.layericon) {
            this.layericon.close();
            this.layericon = null;
        }
        this.layericon = Ext.widget("layericon", {
            row_id: resSelected.get("id"),
            layer_id: resSelected.get("layer_id"),
            dict_icons: resSelected.get("dict_icons"),
            where_param: Ext.util.JSON.decode(resSelected.get("where_param"))
        });
        this.layericon.setTitle("Изменить условие");
        this.layericon.show();
    },

    onAddIconButton: function (button, eOpts, parameters) {
        if (this.layericon) {
            this.layericon.close();
            this.layericon = null;
        }
        this.layericon = Ext.widget("layericon", {layer_id: this.getView().getLayer().id});
        this.layericon.setTitle("Добавить новое условие");
        this.layericon.show();
    },

    onSaveButton: function () {
        var objectForm = this.lookupReference('formInfo').getForm();
        if (!objectForm) return;
        if (!objectForm.isDirty()) {
            Ext.Msg.alert('Внимание', 'Нет данных для добавления или изменения');
            return;
        } else if (!objectForm.isValid()) {
            Ext.Msg.alert('Внимание', 'Некорректные данные');
            return;
        }
        var valuesForm = objectForm.getValues(),
            storeMeta = this.getView().storeMeta;

        if (!valuesForm.geometry_type) valuesForm.geometry_type = null;
        if (!valuesForm.dict_icons) valuesForm.dict_icons = null;
        if (!valuesForm.proc_agr_name) valuesForm.proc_agr_name = null;

        if (valuesForm.geometry_type){
            var km_beg = storeMeta.data.items.filter(function (item) {
                return item.get('field_name') == this;
            }, 'km_beg')[0];
            var km_end = storeMeta.data.items.filter(function (item) {
                return item.get('field_name') == this;
            }, 'km_end')[0];
            if (valuesForm.geometry_type == 'Point' && !km_beg){
                Ext.Msg.alert('Внимание', 'Для географического элемента типа "Точка" ведомость не содержит привязку (реквизит km_beg)', function () {
                    Ext.getCmp('geometry_type').focus(false, 200);
                });
                return;
            }
            if (valuesForm.geometry_type == 'LineString' && (!km_beg || !km_end)){
                Ext.Msg.alert('Внимание', 'Для географического элемента типа "Линия" ведомость не содержит привязку начала и окончания участка (реквизиты km_beg - km_end)', function () {
                    Ext.getCmp('geometry_type').focus(false, 200);
                });
                return;
            }
        }

        Ext.Ajax.request({
            url: ProxyUrlBackend + '/roadinfo/layer/info/update/',
            method: 'POST',
            scope: this,
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
            cors: true,
            jsonData: Ext.util.JSON.encode(valuesForm),
            useDefaultXhrHeader: false,
            success: function (response, options) {
                var jsonResp = Ext.util.JSON.decode(response.responseText);
                Ext.MessageBox.alert("Информация", "Информация о ведомости успешно сохранена");
            },
            failure: function (response, options) {
                var mes;
                try {
                    var jsonResp = Ext.util.JSON.decode(response.responseText);
                    mes = jsonResp.message;
                } catch (e) {
                    mes = response.statusText;
                }
                Ext.Msg.alert("Ошибка", "При сохранении информации возникла ошибка:<br/>" + mes);
            }
        });
    }

});
