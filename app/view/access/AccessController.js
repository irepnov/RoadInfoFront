Ext.define('roadInfo.view.access.AccessController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.accesscontroller',

    init: function() {
        this.control({
            "access button[action=save]": {
                click: this.onSaveClick
            }
        });
    },

    onCheckChangeTree: function (node, check) {
        node.cascadeBy(function (child) {
            child.set("checked", check);
        });
    },

    onSaveClick: function () {
        var layers = this.lookupReference('treeLayersAccess').getChecked(),
            layers_id = [];
        Ext.Array.each(layers, function (rec) {
            if (rec.get("leaf")) layers_id.push(rec.get('id'));
        });
        var munobrs_id = this.lookupReference('munobrs').getValue(),
            user_id = this.getView().getUser_id();

        var user_access = {
            user_id: user_id,
            munobrs: munobrs_id,
            layers: layers_id
        }

        Ext.Ajax.request({
            url: ProxyUrlBackend + '/roadinfo/access/users/access/',
            method: 'POST',
            scope: this,
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
            cors: true,
            jsonData: Ext.util.JSON.encode(user_access),
            useDefaultXhrHeader: false,
            success: function (response, options) {
                var jsonResp = Ext.util.JSON.decode(response.responseText);
                Ext.MessageBox.alert("Информация", "Информация успешно сохранена");
                Ext.getStore('RefAccessUsers').load();
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
