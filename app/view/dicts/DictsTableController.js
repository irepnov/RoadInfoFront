Ext.define('roadInfo.view.dicts.DictsTableController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.dictstablecontroller',

    init: function () {
        this.control({
            "dictstable button[action=edit]": {
                click: this.onRowDblClickDict
            }
        })
    },

    onRowDblClickDict: function(view, record, item, index, e, eOpts){
        var gridmain = this.lookupReference('dictstablegrid');
        var selrow = gridmain.getSelectionModel().getSelection()[0];
        if (!selrow) return;

        if (this.editdict) {
            this.editdict.close();
            this.editdict = null;
        }
        if (selrow.get("table_name") == "dict_icons"){
            this.editdict = Ext.widget("iconstable");
        }else{
            this.editdict = Ext.widget("dicts", {dict: selrow.get("table_name")});
        }
        this.editdict.setTitle("Редактор справочника: " + selrow.get("name"));
        this.editdict.show();
    }

});
