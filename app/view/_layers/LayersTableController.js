Ext.define('roadInfo.view.layers.LayersTableController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.layerstablecontroller',

    init: function () {
        // this.getView().on("afterlayout", this.onAfterLayout(), this); //либо так

        this.control({
            "layerstable button[action=xls-export]": {
                click: this.onExportExcelButton
            },

            "layerstable button[action=edit]": {
                click: this.onEditButton
            },

            "layerstable button[action=add]": {
                click: this.onAddButton
            }

        })
    },

    onExportExcelButton: function () {
        //  alert(this.getView().getFields());
        var a = this.lookupReference('layersgrid');
        if (a.getStore().getCount()) {
            a.downloadExcelXml(false, this.getView().getTitle())
        }
    },

    onEditButton: function () {
        var gridmain = this.lookupReference('layersgrid');
        var selrow = gridmain.getSelectionModel().getSelection()[0];
        if (!selrow) return;
        var resSelected = gridmain.store.getByInternalId(selrow.internalId).data;
        if (!resSelected) return;

        if (this.layer) {
            this.layer.close();
            this.layer = null;
        }
        if (!this.layer) {
            this.layer = Ext.widget("layer", {
                table: this.getView().getTablename(),
                fields: this.getView().getFields(),
                values: resSelected
            });

            this.layer.on("close", function(){
                //alert('ggg');
                //refresh store
            }, this.layer); //повешу событие

            this.layer.setTitle("Изменить запись");
            this.layer.show();
        }
    },

    onAddButton: function () {
        if (this.layer) {
            this.layer.close();
            this.layer = null;
        }
        if (!this.layer) {
            this.layer = Ext.widget("layer", {
                table: this.getView().getTablename(),
                fields: this.getView().getFields(),
                values: {object_id: Ext.getCmp('yandexmap').getUserSelectObject().id}
            });

            this.layer.on("close", function(){
                //alert('ggg');
                //refresh store
            }, this.layer); //повешу событие

            this.layer.setTitle("Добавить запись");
            this.layer.show();
        }
    }
});
