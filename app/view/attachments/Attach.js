Ext.define("roadInfo.view.attachments.Attach", {
    extend: Ext.window.Window,
    alias: "widget.attach",
    title: "Документы",
    id: "attach",
    layout: "fit",
    config: {
        object: null,
        extensions: null
    },
    width: 600,
    height: 400,
    modal: true,
   // maximizable: true,
    collapsible: false,
    border: false,
    iconAlign: "left",
    iconCls: 'fa fa-paperclip',
    requires: [
        'roadInfo.view.attachments.AttachController'
        //'roadInfo.view.attachments.AttachVType'
    ],
    controller: 'attachcontroller',
    initComponent: function () {
        var cdef = roadInfo.app.getController('default'),
            selectedMode = cdef.getSelectedMode(),
            stor = cdef.getDictionaryStore('amstrad_routes.objects');
        stor.clearFilter(true);
        stor.filterBy(function (record, id) {
            return Ext.Array.contains(selectedMode.objects_id, record.get('id'));
        });

        this.items = [
            {
                xtype: 'form',
                reference: 'panelattachform',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                border: false,
                bodyStyle: 'padding: 5px 5px;',
                waitMsgTarget: 'Выполняется длительный процесс..',
                waitTitle: 'Ожидайте',
                listeners: {
                    dirtychange: function () {
                        Ext.getCmp('attach_save').enable();
                    }
                },
                items: [
                    {
                        xtype: 'combo',
                        reference: 'attach_object_id',
                        name: 'attach_object_id',
                        fieldLabel: 'Объект содержания',
                        labelWidth: 150,
                        store: stor,
                        queryMode: 'local',
                        forceSelection: false,
                        allowBlank: false,
                        displayField: 'name',
                        valueField: 'id',
                        value: (this.object && this.object.objectId) ? this.object.objectId : null,
                        listeners: {
                            change: 'onAttachObjectChange'
                        }
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'attach_file_id',
                        reference: 'attach_file_id',
                        value: (this.object && this.object.fileId) ? this.object.fileId : null
                    },
                    {
                        xtype: 'bindingfield',
                        name: 'attach_km_beg',
                        reference: 'attach_km_beg',
                        emptyText: '4.455 или 45.7878,39.656565',
                        fieldLabel: 'Привязка (км.)',
                        allowBlank: false,
                        allowBlankPoint: false,
                        labelWidth: 150,
                        vtype: 'vbinding',
                        value: (this.object && (this.object.km_beg || this.object.km_beg == 0)) ? this.object.km_beg : null,
                        object_id: (this.object && this.object.objectId) ? this.object.objectId : null
                    },
                    {
                        xtype: 'textareafield',
                        fieldLabel: 'Описание',
                        labelWidth: 150,
                        name: 'attach_desc',
                        reference: 'attach_desc',
                        allowBlank: false,
                        maxLength: 255,
                        height: '100px',
                        value: (this.object && this.object.desc) ? this.object.desc : null
                    },
                    {
                        xtype: 'filefield',
                        name: 'attach_file',
                        reference: 'attach_file',
                        fieldLabel: 'Документ',
                        clearOnSubmit: false,
                        allowBlank: (this.object && this.object.fileId) ? true : false,
                        labelWidth: 150,
                        regex: (this.extensions) ? this.extensions : null,
                        regexText: (this.extensions) ? "Не верный тип файла" : null
                    }
                ],
                buttons: [{
                    text: "Сохранить",
                    tooltip: "Сохранить документ",
                    disabled: true,
                    action: "attach_save",
                    id: "attach_save",
                    iconCls: "fa fa-floppy-o"
                }]
            }
        ];
        this.callParent(arguments);
    }

});