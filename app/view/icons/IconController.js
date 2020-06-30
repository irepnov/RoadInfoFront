Ext.define('roadInfo.view.icons.IconController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.iconcontroller',

    init: function () {
        this.control({
            "createicon button[action=save]": {
                click: this.onSaveClick
            }
        });
    },

    onSaveClick: function () {
        var objectForm = this.lookupReference('paneliconform').getForm();
        if (!objectForm) return;
        if (!objectForm.isDirty()) {
            Ext.Msg.alert('Внимание', 'Нет данных для добавления или изменения');
            return;
        } else if (!objectForm.isValid()) {
            Ext.Msg.alert('Внимание', 'Некорректные данные');
            return;
        }
        var valuesForm = objectForm.getValues(),
            cdef = roadInfo.app.getController('default'),
            uri = '';

        if (valuesForm.id){
            uri = ProxyUrlBackend + '/roadinfo/dict/update/?dict=dict_icons'
        }else{
            uri = ProxyUrlBackend + '/roadinfo/dict/create/?dict=dict_icons'
        }

        if (objectForm.isValid()) {
            objectForm.submit({
                url: uri,
                method: 'POST',
                scope: this,
                success: function (form, response) {
                    var jsonResp = Ext.util.JSON.decode(response.responseText);
                    Ext.MessageBox.alert("Информация", "Сохранение выполнено успешно", function () {
                        var store = cdef.getDictionaryStore('dict_icons'); //глобальное хранилище, содержащее данные ведомости
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
