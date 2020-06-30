Ext.define('roadInfo.view.searchkm.SearchkmController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.searchkmcontroller',

    init: function () {
        this.control({
            "searchkm button[action=search]": {
                click: this.onSearchClick
            }
        });
    },

    onComboMunobrChange: function (combo, newValue, oldValue, eOpts) {
        if (!newValue) return;

        var comboObject = this.lookupReference('object');
        comboObject.clearValue();
        comboObject.setValue(null);
        comboObject.disable();

        comboObject.getStore().clearFilter(true);
        comboObject.getStore().filterBy(function (record, id) {
            return Ext.Array.contains(newValue, record.get('id'));
        });

        comboObject.enable();
    },

    onComboObjectsSelect: function (combo, record, eOpts) {
        if (record.data.id === 0) {
            combo.clearValue();
            combo.setValue(null);
            Ext.Msg.alert('Внимание', 'Необходимо выбрать один объект содержания');
            return;
        }
        var beg = this.lookupReference('km_beg'),
            end = this.lookupReference('km_end');

        beg.disable();
        end.disable();

        beg.setMinValue(record.data.km_beg);
        beg.setMaxValue(record.data.km_end);
        end.setMinValue(record.data.km_beg);
        end.setMaxValue(record.data.km_end);

        beg.enable();
        end.enable();
      /*  beg.setValue(record.data.km_beg);
        end.setValue(record.data.km_end);*/
    },

    onSearchClick: function () {
        var y = Ext.getCmp('yandexmap');
        if (!y) return;


        this.selectedObjectId = this.lookupReference('object').getValue();
        this.selectedObjectName = this.lookupReference('object').getStore().getById(this.selectedObjectId).get("nameshort");
        this.km_beg = this.lookupReference('km_beg').getValue();
        this.km_end = this.lookupReference('km_end').getValue();

        if (!y.checkShowOnMap(2)) {
            Ext.Msg.alert('Внимание', 'Объект содержания отсутствует на карте');
            return;
        }

        var _url = null,
            _param = {},
            _type = null;

        if (this.km_end) {
            _url = '/distances/binding_km_between'
            _param = {
                "api_key": '8cf97f5a-d9b4-4533-b33c-ef46b21c9d72',
                "object_id": this.selectedObjectId,
                "km_beg": this.km_beg,
                "km_end": this.km_end
            }
        } else {
            _url = '/distances/binding_km'
            _param = {
                "api_key": '8cf97f5a-d9b4-4533-b33c-ef46b21c9d72',
                "object_id": this.selectedObjectId,
                "km": this.km_beg
            }
        }

        // #bc0f46
        Ext.Ajax.request({
            url: ProxyUrlBackRoutes + _url,
            method: 'GET',
            params: _param,
            scope: this,
            withCredentials: true,
            cors: true,
            useDefaultXhrHeader: false,
            success: function (response, options) {
                var jsonResp = Ext.util.JSON.decode(response.responseText);
                if (_url == '/distances/binding_km') {
                    y.showSearchKm(this.selectedObjectId, jsonResp.binding, 'Point', this.selectedObjectName + ', км. ' + this.km_beg);
                } else {
                    y.showSearchKm(this.selectedObjectId, jsonResp.binding_km_between, 'LineString', this.selectedObjectName + ', км. ' + this.km_beg + ' - ' + this.km_end);
                }
                jsonResp = null;
                var win = this.getView();
                if (win) win.destroy();
            },
            failure: function (response, options) {
                var mes;
                try {
                    var jsonResp = Ext.util.JSON.decode(response.responseText);
                    mes = jsonResp.message;
                    jsonResp = null;
                } catch (e) {
                    mes = response.statusText;
                }
                Ext.Msg.alert("Ошибка", "При поиске возникла ошибка:<br/>" + mes);
                mes = null;
            }
        });

    }
});
