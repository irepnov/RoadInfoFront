Ext.define('roadInfo.view.layer_upload.LayerUploadController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.layeruploadcontroller',

    init: function () {
        this.control({
            "layerupload button[action=save]": {
                click: this.onSaveClick
            }
        });
    },

    onSaveClick: function () {
        var objectForm = this.lookupReference('panellayeruploadform').getForm();
        if (!objectForm) return;
        if (!objectForm.isDirty()) {
            Ext.Msg.alert('Внимание', 'Нет данных для добавления или изменения');
            return;
        } else if (!objectForm.isValid()) {
            Ext.Msg.alert('Внимание', 'Некорректные данные');
            return;
        }

        if (objectForm.isValid()) {

            /*
            var fileEl = this.lookupReference('importfile'),
            fileEl = fileEl.fileInputEl,
            file = fileEl.dom.files[0],
            data = new FormData();
        data.append('file', file);
        Ext.Ajax.request({
            url: ProxyUrlBackend + "/roadinfo/resources/importxls",
            rawData: data,
            headers: {'Content-Type': null}, //to use content type of FormData
            callback: function (opt, success, response) {
                var jsonResp = Ext.util.JSON.decode(response.responseText);
                console.log(jsonResp);
                if (success) {
                    Ext.Msg.alert("Информация", "Данные успешно загружены");
                } else {
                    Ext.Msg.alert("Ошибка", "В загружаемых данных ошибки:<br/>" + jsonResp.data.join('<br/>'));
                }
            }
        });
            * */

            objectForm.submit({
                url: ProxyUrlBackend + '/roadinfo/layer/create_layer_from_xls/',
                method: 'POST',
                scope: this,
                success: function (form, response) {
                    Ext.MessageBox.alert("Информация", "Ведомость успешно загружена. Обновите страницу", function () {
                        var win = this.getView();
                        if (win) win.destroy();
                    }, this);
                    jsonResp = null;
                },
                failure: function (form, response) {
                    var jsonResp = Ext.util.JSON.decode(response.response.responseText),
                        mes = jsonResp.message,
                        text = "";
                    console.log(JSON.stringify(mes));
                    Ext.each(mes, function (item) {
                        file = item.file;
                        error = item.error.join('<br/>');
                        console.log(JSON.stringify(item));
                        text = text + '<br/>' + 'Файл - ' + file + '<br/>' + error + '<br/>';
                    });
                    Ext.Msg.alert("Ошибка", "При загрузке ведомости возникла ошибка:<br/>" + text);
                }
            });
        }
    }

});
