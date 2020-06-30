Ext.define('roadInfo.view.access.AccessListController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.accesslistcontroller',

    init: function() {
         this.control({
             "accesslist button[action=add]": {
                 click: this.onAddClick
             },
             "accesslist button[action=edit]": {
                 click: this.onEditClick
             },
             "accesslist button[action=del]": {
                 click: this.onDelClick
             },
             "accesslist button[action=access]": {
                 click: this.onAccessClick
             }
         })
    },

    onAccessClick: function (button, evt) {
        if (this.access){
            this.access.close();
            this.access = null;
        }
        var grid = this.lookupReference('accesslistgrid'),
            selrow = grid.getSelectionModel().getSelection()[0];
        if (grid && selrow && grid.getStore().isLoaded()) {
            this.access = Ext.widget("access", {user_id: selrow.get("id"), munobrs: selrow.get("munobrs"), layers: selrow.get("layers")});
            this.access.show();
        }
    },

    onGridEditorEdit: function (editor, ctx, eOpts) {
        ctx.grid.getStore().sync();
    },

    onGridEditorCancelEdit: function (editor, ctx, eOpts) {
        ctx.grid.getStore().rejectChanges();
    },

    onCloseWindow: function(){
        this.lookupReference('accesslistgrid').getStore().rejectChanges();
    },

    onAddClick: function (button, evt) {
        var grid = this.lookupReference('accesslistgrid');
        if (grid && grid.getStore().isLoaded()) {
            var newRec = Ext.create('roadInfo.model.RefAccessUsers', {});
            grid.getStore().insert(0, newRec);
            grid.getPlugin('RowEditingPlugin').startEdit(newRec);
        }
    },

    onEditClick: function (button, evt) {
        var grid = this.lookupReference('accesslistgrid'),
            selrow = grid.getSelectionModel().getSelection()[0];
        if (grid && selrow && grid.getStore().isLoaded()) {
            grid.getPlugin('RowEditingPlugin').startEdit(selrow);
        }
    },

    onDelClick: function (button, evt) {
        var grid = this.lookupReference('accesslistgrid'),
            selrow = grid.getSelectionModel().getSelection()[0];
        if (grid && selrow && grid.getStore().isLoaded()) {
            this.lookupReference('delete').setDisabled(true);
            grid.getStore().remove(selrow);
            grid.getStore().sync();
        }
        this.lookupReference('delete').setDisabled(false);
    }
});
