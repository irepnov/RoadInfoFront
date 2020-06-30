Ext.define("roadInfo.view.dicts.Dicts", {
    extend: Ext.window.Window,
    alias: "widget.dicts",
    title: "Справочник",
    id: "dicts",
    layout: "fit",
    iconCls: "fa fa-table",
    config: {
        dict: null
    },
    width: 1000,
    height: 700,
    maximizable: true,
    collapsible: false,
    modal: true,
    border: false,
    bodyStyle: 'padding: 5px 5px;',
    iconAlign: "left",
    requires: ['roadInfo.view.dicts.DictsController', 'Ext.grid.*',
        'Ext.data.*'],
    controller: 'dictscontroller',
    defaults: {
        border: 1
    },
    initComponent: function () {
        var _columns = this.getDictMeta().gridFields,
            _store = this.getDictStore();

        this.tbar = {
            xtype: "toolbar",
            enableOverflow: true,
            defaults: {
                iconAlign: "left",
                scale: "small"
            },
            items: [
                {
                    text: "Добавить",
                    tooltip: "Добавить иконку",
                    action: "add",
                    reference: "add",
                    iconCls: "fa fa-plus"
                },
                {
                    text: "Изменить",
                    tooltip: "Изменить иконку", //изменить фото, название оставить прежднее
                    action: "edit",
                    reference: "edit",
                    iconCls: "fa fa-pencil"
                },
                {
                    text: "Удалить",
                    tooltip: "Удалить иконку", //выбрать все справочники, заменить в Нулл все ссылки
                    action: "delete",
                    reference: "delete",
                    iconCls: "fa fa-minus"
                },
                {
                    //xtype: "tbfill"
                    xtype: "tbseparator"
                },
                {
                    text: "Экспорт",
                    tooltip: "Экспорт ведомости в XLS",
                    action: "xls",
                    reference: "xls",
                    iconCls: "fa fa-file-excel-o"
                }]
        };
        this.items = [{
            xtype: 'grid',
            reference: 'dictsgrid',
            autoScroll: true,
            store: _store,
            bodyStyle: 'padding: 5px 5px;',
            columns: _columns,
            plugins: [
                {
                    ptype: 'bufferedrenderer'
                },
                {
                    ptype: 'rowediting',
                    pluginId: 'RowEditingPlugin',
                    clicksToEdit: 2,
                    listeners: {
                        edit: 'onGridEditorEdit',
                        beforeedit: 'onGridEditorBeforeEdit',
                        canceledit: 'onGridEditorCancelEdit'
                    }
                }
            ],
            excelName: this.getDictMeta().title,
            ObjectDBName: this.getDictMeta().objectDBName,
            forceFit: false
        }];
        this.callParent(arguments);
    },

    getDictMeta: function () {
        var cdef = roadInfo.app.getController('default'),
            dict = this.getDict();

        if (!cdef || !dict) return;
        return cdef.getDictMetaInfo(dict);
    },

    getDictStore: function () {
        var cdef = roadInfo.app.getController('default'),
            dict = this.getDict();

        if (!cdef || !dict) return;
        return cdef.getDictionaryStore(dict);
    }
});