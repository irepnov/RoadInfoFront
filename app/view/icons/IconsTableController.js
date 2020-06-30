Ext.define('roadInfo.view.icons.IconsTableController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.iconstablecontroller',

    init: function () {
        // this.getView().on("afterlayout", this.onAfterLayout(), this); //либо так

        this.control({
            "iconstable button[action=edit]": {
                click: {
                    fn: this.onAddEditButton,
                    act: 'edit'
                }
            },

            "iconstable button[action=add]": {
                click: {
                    fn: this.onAddEditButton,
                    act: 'add'
                }
            },

            "iconstable button[action=delete]": {
                click: this.onDelClick
            }
        })
    },

    onDelClick: function () {
        var gridmain = this.lookupReference('iconsgrid');
        var selrow = gridmain.getSelectionModel().getSelection()[0];
        if (!selrow) return;
        var resSelected = gridmain.store.getByInternalId(selrow.internalId).data;
        if (!resSelected) return;

        Ext.Ajax.request({
            url: ProxyUrlBackend + '/roadinfo/dict/destroy/?dict=' + 'dict_icons',
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
                Ext.Msg.alert("Ошибка", "При удалении документа возникла ошибка:<br/>" + mes);
            }
        });
    },

    onAddEditButton: function (button, eOpts, parameters) {
        var iconsgrid = this.lookupReference('iconsgrid'),
            selrow = iconsgrid.getSelectionModel().getSelection()[0],
            cdef = roadInfo.app.getController('default');
        if (!cdef || !iconsgrid || /*!selrow ||*/ !iconsgrid.getStore().isLoaded()) return;

        if (button.action == "edit" && !selrow){
            Ext.Msg.alert("Ошибка", "Не выбрана редактируемая запись");
            return;
        }

        var storeIcons = cdef.getDictionaryStore('dict_icons'),
            modelIcons = cdef.getDictModel('dict_icons'),
            metaIcons = cdef.getDictMetaInfo('dict_icons'),
            fields = [],
            me = this;

        if (me.createicon) {
            me.createicon.close();
            me.createicon = null;
        }
        me.createicon = Ext.widget("createicon");
        if (parameters.act == "edit"){
            this.createicon.setTitle("Редактирование");
        }
        else
            this.createicon.setTitle("Создание");

        for (var A = 0, z = metaIcons.gridFields.length; A < z; A += 1) {
            var grid_col = metaIcons.gridFields[A];

            if (grid_col.editor) {
                var formfield = grid_col.editor;
                formfield.name = grid_col.dataIndex;
                formfield.id = grid_col.dataIndex;
                formfield.reference = grid_col.dataIndex;
                formfield.fieldLabel = grid_col.text;
                if (grid_col.hidden) {
                    formfield.xtype = "hiddenfield";
                }
                if (formfield.xtype == 'filefield') {
                    formfield.allowBlanc = false;
                }
                if (button.action == "edit") {
                    formfield.value = selrow.get(grid_col.dataIndex);
                }else{
                    formfield.value = null;
                }

                fields.push(formfield);
            }
        }
        var formcreate = me.createicon.down("form");
        formcreate.add(fields);

        me.createicon.show();
        //formcreate.show();
    }
});
