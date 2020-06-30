Ext.define('roadInfo.view._test.TestTableController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.testtablecontroller',

    init: function () {
        this.control({
            "testtable button[action=edit]": {
                click: this.onEditButton
            },

            "testtable button[action=add]": {
                click: this.onAddButton
            }
        })
    },

    onEditButton: function () {
        var grid = this.lookupReference('testgrid'),
            store = grid.getStore(),
            selrow = grid.getSelectionModel().getSelection()[0];

            grid.getPlugin('RowEditingPlugin').startEdit(selrow);
    },

    onAddButton: function () {
        var grid = this.lookupReference('testgrid');

        var newRec = Ext.create('roadInfo.model.RefTest', {});
        grid.getStore().insert(0, newRec);
        grid.getPlugin('RowEditingPlugin').startEdit(newRec);
    },

    onFileChange: function(filefield, value, eOpts) { //<== the function to show the image in the image field, using the Javascript' API "File"
        var grid = filefield.up('grid'),
            store = grid.getStore(),
            selrow = grid.getSelectionModel().getSelection()[0]; //пробюлема, т.к. несколько записей отмеченных

        if (!selrow) return;

        //inputFile.fileInputEl.dom.files[0].size

        var file = filefield.fileInputEl.dom.files[0],
            reader;
        if (file === undefined || !(file instanceof File)) {
            return;
        }
        if ((file.size / 1048576) > 3){ //размер файлов не более 3 Мб
            Ext.Msg.alert('Ошибка', "Максимальный размер прикрепляеммого файла не должен превышать 3 Мб.");
            return;
        }
        reader = new FileReader();
        reader.onload = function (event) {
            selrow.set('file_content', event.target.result);
        };
        reader.readAsDataURL(file);
    },

    onGridEditorEdit: function (editor, ctx, eOpts) {
//        var store = ctx.grid.getStore();
        ctx.grid.getStore().sync();
    },

    onGridEditorCancelEdit: function (editor, ctx, eOpts) {
        ctx.grid.getStore().rejectChanges();
    }

});
