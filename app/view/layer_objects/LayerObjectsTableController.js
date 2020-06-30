Ext.define('roadInfo.view.layer_objects.LayerObjectsTableController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.layerobjectstablecontroller',

    init: function () {
    },

    onLayerSelect: function (picker, record) {
        Ext.getStore('RefLayersObjects').load(
            {
                params: {
                    layers_id: Ext.encode(record.get('id'))
                }
            }
        );
    },

    onExcel: function () {
        this.lookupReference('objectsgrid').downloadExcelXml(false, this.lookupReference('layers').getRawValue());
    },

    onFilterCheck: function () {
        var selrow = this.lookupReference('objectsgrid').getSelectionModel().getSelection(),
            me = this;
        var objects_ids = [];
        Ext.each(selrow, function (item) {
            objects_ids.push(item.get('object_id'));
        });

        if (objects_ids.length == 0) return;

        Ext.getStore('RefMunobrs').load( //перезагружу районы, оставлю только те районы и дороги, которые отмечены пользователем
            {
                params: {
                    object_ids: Ext.encode(objects_ids)
                },
                callback: function () {
                    var combo = Ext.getCmp('comboMunobr');
                    combo.getTrigger('clear').show();
                    combo.clearValue();
                    combo.setValue(null);

                    var win = me.getView();
                    if (win) win.destroy();
                }
            }
        );
    }
});
