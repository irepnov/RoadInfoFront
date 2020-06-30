Ext.define('roadInfo.view.dicts.DictsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.dictscontroller',

    init: function () {
         this.control({
            "dicts button[action=edit]": {
                click: {
                    fn: this.onEditButton
                }
            },

            "dicts button[action=add]": {
                click: {
                    fn: this.onAddButton
                }
            },

            "dicts button[action=delete]": {
                click: this.onDelClick
            },

             "dicts button[action=xls]": {
                 click: this.onExcelClick
             }
        })
    },

    onGridEditorEdit: function (editor, ctx, eOpts) {
        ctx.grid.getStore().sync();
        this.lookupReference('add').setDisabled(false);
        this.lookupReference('edit').setDisabled(false);
        this.lookupReference('delete').setDisabled(false);
    },

    onGridEditorBeforeEdit: function (editor, ctx, eOpts) {
        this.lookupReference('add').setDisabled(true);
        this.lookupReference('edit').setDisabled(true);
        this.lookupReference('delete').setDisabled(true);
    },

    onGridEditorCancelEdit: function (editor, ctx, eOpts) {
        ctx.grid.getStore().rejectChanges();
        this.lookupReference('add').setDisabled(false);
        this.lookupReference('edit').setDisabled(false);
        this.lookupReference('delete').setDisabled(false);
    },

    onAddButton: function (button, evt) {
        var grid = this.lookupReference('dictsgrid');
        if (grid && grid.getStore().isLoaded()) {
            var cdef = roadInfo.app.getController('default');
            var newRec = Ext.create(cdef.getDictModel(grid.ObjectDBName, 1).$className, {});
            grid.getStore().insert(0, newRec);
            grid.getPlugin('RowEditingPlugin').startEdit(newRec);
        }
    },

    onEditButton: function (button, evt) {
        var grid = this.lookupReference('dictsgrid'),
            selrow = grid.getSelectionModel().getSelection()[0];
        if (grid && selrow && grid.getStore().isLoaded()) {
            grid.getPlugin('RowEditingPlugin').startEdit(selrow);
        }
    },

    onDelClick: function (button, evt) {
        var grid = this.lookupReference('dictsgrid'),
            selrow = grid.getSelectionModel().getSelection()[0];
        if (grid && selrow && grid.getStore().isLoaded()) {
            this.lookupReference('delete').setDisabled(true);
            grid.getStore().remove(selrow);
            grid.getStore().sync();
        }
        this.lookupReference('delete').setDisabled(false);
    },

    onExcelClick: function () {
        var grid = this.lookupReference('dictsgrid');
        if (grid.getStore().getCount()) {
            grid.exportExcelXml(false, grid.excelName)
        }
    }
});
