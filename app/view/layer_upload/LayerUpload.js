Ext.define('roadInfo.view.layer_upload.ImportVType', {
    override: 'Ext.form.field.VTypes',
    mime: function(value) {
        var phoneRegex = /^.*\.(zip|ZIP|Zip)$/;
        return (phoneRegex.test(value));
    },
    mimeText: 'Допустимы только Zip архивы '
});

Ext.define("roadInfo.view.layer_upload.LayerUpload", {
    extend: Ext.window.Window,
    alias: "widget.layerupload",
    title: "Загрузка ведомости",
    layout: "fit",
    requires: ['roadInfo.view.layer_upload.LayerUploadController'],
    width: 600,
    height: 200,
    modal: true,
    iconCls: "fa fa-cloud-upload",
    controller: "layeruploadcontroller",
    constrain: true,
   // closable: false,
    closeAction: "destroy",
    initComponent: function () {
        this.items = [
            {
                xtype: 'form',
                reference: 'panellayeruploadform',
                id: 'panellayeruploadform',
                autoScroll: true,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                border: false,
                // padding: '5px',
                //bodyStyle: 'margin: 10px; padding: 5px 3px;',
                bodyStyle: 'padding: 5px 5px;',
                waitMsgTarget: 'Выполняется длительный процесс..',
                waitTitle: 'Ожидайте',
                items: [
                    {
                        xtype: 'filefield',
                        emptyText: 'Выберите импортируемый файл',
                        fieldLabel: 'Архивированный Excel (*.zip)',
                        name: 'layerupload',
                        labelWidth: 130,
                        clearOnSubmit: false,
                        allowBlanc: false,
                        vtype: 'mime',
                        buttonText: '',
                        buttonConfig: {
                            iconCls: 'fa fa-cloud-upload'
                        }
                    },
                    {
                        fieldLabel: 'Шаблон импорта',
                        xtype: 'box',
                        autoEl: {
                            tag: 'a',
                            target: '_blank',
                            href: 'create_layer_good.zip',
                            html: 'Это шаблон импортируемого файла. Удаление, перемещение столбцов, вставка пустых строк запрещены'
                        }
                    }
                ],
                listeners: {
                    dirtychange: function() {
                        Ext.getCmp('saveButton').enable();
                    }
                },
                buttons: [{
                    text: "Загрузить",
                    name: 'saveButton',
                    id: 'saveButton',
                    tooltip: "Загрузить ведомость из файла",
                    disabled: true,
                    action: "save",
                    iconCls: "fa fa-floppy-o"
                }]
            }
        ];
        this.callParent(arguments);
    }
});
