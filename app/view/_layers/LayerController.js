/*Ext.define('roadInfo.view.layers.LayerController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.layercontroller',

    init: function () {
        this.control({
            "layer button[action=save]": {
                click: this.onSaveClick
            }
        });
    },

    onSaveClick: function () {
        var objectForm = this.lookupReference('panellayerform').getForm();
        if (!objectForm) return;
        if (!objectForm.isDirty()) {
            Ext.Msg.alert('Внимание', 'Нет данных для добавления или изменения');
            return;
        } else if (!objectForm.isValid()) {
            Ext.Msg.alert('Внимание', 'Некорректные данные');
            return;
        }
        var valuesForm = objectForm.getValues();

        if (objectForm.isValid()) {
            objectForm.submit({
                url: ProxyUrlBackend + '/roadinfo/layer_update/?layer=' + this.getView().getTable(),
                method: 'POST',
                scope: this,
                success: function (form, response) {
                    var jsonResp = Ext.util.JSON.decode(response.responseText);
                    Ext.MessageBox.alert("Информация", "Сохранение выполнено успешно", function () {
                        var store = Ext.getStore('RefLayersData'); //глобальное хранилище, содержащее данные ведомости
                        if (!store) return;
                        store.load();
                        var win = this.getView();
                        if (win) win.destroy();
                    }, this);
                    jsonResp = null;
                },
                failure: function (form, response) {
                    var mes;
                    try {
                        var jsonResp = Ext.util.JSON.decode(response.response.responseText);
                        mes = jsonResp.message;
                        jsonResp = null;
                    } catch (e) {
                        mes = response.statusText;
                    }
                    Ext.Msg.alert("Ошибка", "При фиксации изменений возникла ошибка:<br/>" + mes);
                    mes = null;
                }
            });


        }
    }

});
*/