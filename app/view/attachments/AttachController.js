Ext.define('roadInfo.view.attachments.AttachController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.attachcontroller',

    init: function() {
        this.control({
            "attach button[action=attach_save]": {
                click: this.onSaveClick
            }
        });
    },

    onAttachObjectChange: function (combo, newValue, oldValue, eOpts) {
        var y = this.lookupReference('attach_km_beg');
        if (!y) return;
        y.setObjectId(newValue);
    },

    onSaveClick: function () {
        var objectForm = this.lookupReference('panelattachform').getForm(),
            binding = this.lookupReference('attach_km_beg');

        //определю кооррдинаты и привязку
        binding.onPointOrBinding();
        var coordinates = binding.getPoint();
        var km_beg = binding.getValue();
        if (!coordinates || !km_beg) return;

        if (!objectForm) return;
        if (!objectForm.isDirty()) {
            Ext.Msg.alert('Внимание', 'Нет данных для добавления');
            return;
        } else if (!objectForm.isValid()) {
            Ext.Msg.alert('Внимание', 'Некорректные данные');
            return;
        }

        var valuesForm = objectForm.getValues(),
            fileEl = this.lookupReference('attach_file').fileInputEl,
            file = fileEl.dom.files[0],
            data = new FormData();

        valuesForm['attach_file'] = file;
        valuesForm['attach_coord'] = coordinates;

        if (valuesForm.attach_file) {
            var lastModifiedDate = new Date(valuesForm.attach_file.lastModified);
            data.append('attach_file', valuesForm.attach_file);
            data.append('attach_file_create_date', lastModifiedDate.toJSON().substr(0, 10) + ' ' + lastModifiedDate.toTimeString().substr(0, 8));
        }

        if (valuesForm.attach_desc) data.append('attach_desc', valuesForm.attach_desc);
        if (valuesForm.attach_km_beg) data.append('attach_km_beg', valuesForm.attach_km_beg);
        if (valuesForm.attach_file_id) data.append('attach_file_id', valuesForm.attach_file_id);
        if (valuesForm.attach_object_id) data.append('attach_object_id', valuesForm.attach_object_id);
        if (valuesForm.attach_coord) data.append('attach_coord', valuesForm.attach_coord);

        Ext.Ajax.request({
            url: ProxyUrlBackend + '/roadinfo/attach/attach_file/',
            method: 'POST',
            rawData: data,
            scope: this,
            withCredentials: true,
            cors: true,
            useDefaultXhrHeader: false,
            headers: {'Content-Type': null}, //to use content type of FormData
            callback: function (opt, success, response) {
                var jsonResp = Ext.util.JSON.decode(response.responseText);
                if (success) {
                    Ext.MessageBox.alert("Информация", "Сохранение выполнено успешно", function () {
                                            Ext.getStore('RefAttachList').reload();
                                            var win = this.getView();
                                            if (win) win.destroy();
                                        }, this);
                } else {
                    Ext.Msg.alert("Ошибка", "В загружаемых данных ошибки:<br/>" + jsonResp.message);
                }
            }
        });

    }

});
