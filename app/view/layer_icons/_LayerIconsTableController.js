Ext.define('roadInfo.view.layer_icons.LayerIconsTableController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.layericonstablecontroller',

    init: function () {
        // this.getView().on("afterlayout", this.onAfterLayout(), this); //либо так

        this.control({
            "layericonstable button[action=edit]": {
                click: {
                    fn: this.onEditButton,
                    act: 'edit'
                }
            },

            "layericonstable button[action=add]": {
                click: {
                    fn: this.onAddButton,
                    act: 'add'
                }
            },

            "layericonstable button[action=delete]": {
                click: this.onDelClick
            }
        })
    },

    onDelClick: function () {
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

    onRowDblClick: function(){
        this.onEditButton();
    },

    onEditButton: function (button, eOpts, parameters) {
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

    onAddButton: function (button, eOpts, parameters) {
        if (this.layericon) {
            this.layericon.close();
            this.layericon = null;
        }
        this.layericon = Ext.widget("layericon");
        this.layericon.setTitle("Добавить новое условие");
        this.layericon.show();
    }
});
