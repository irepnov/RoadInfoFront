Ext.define('roadInfo.view.attachments.AttachListController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.attachlistcontroller',

    init: function () {
        // this.getView().on("afterlayout", this.onAfterLayout(), this); //либо так

        this.control({
            "attachlist button[action=attach_add]": {
                click: this.attach_onAddClick
            },
            "attachlist button[action=attach_edit]": {
                click: this.attach_onEditClick
            },
            "attachlist button[action=attach_del]": {
                click: this.attach_onDelClick
            },
            "attachlist button[action=attach_download]": {
                click: this.attach_onDownloadClick
            }
        })
    },

    attach_onAfterRender: function () {
        var tr = this.lookupReference('tree_attachmenttype'),
            newSelection = tr.getStore().findRecord('id', -1);

        /*tr.setSelection(newSelection);
        tr.doFireEvent('itemclick', [null, newSelection]);*/

        var record = tr.getStore().getNodeById('-1');
        tr.getSelectionModel().select(record);
        tr.doFireEvent('itemclick', [tr, record]);
    },

    attach_onNodeSelect: function (treeview, rec_node) {
        var me = this,
            type_id = rec_node.get('id');
            this.type_extensions = null,
                panel_attachments = this.lookupReference('panel_attachments');

        rec_node.cascadeBy(function () { //если отмечены только районы, то визаулизация графических элементов отключена совсем
            if (me.type_extensions)
                me.type_extensions = me.type_extensions + "|" + this.get('extensions');
            else
                me.type_extensions = this.get('extensions');
        });

        if (me.type_extensions)
            me.type_extensions = new RegExp("(.+)(" + me.type_extensions + ")","i");

        var old_view = this.lookupReference('attachlist_view');
        if (old_view) {
            panel_attachments.remove(old_view);
        }

        //http://static.uji.es/js/extjs/ext-6.2.1/build/examples/classic/view/data-view.js

        var store = Ext.getStore('RefAttachList'),
            obj = {
                xtype: 'grid',
                reference: 'attachlist_view',
                autoScroll: true,
                store: 'RefAttachList',
                columns: [
                      //{dataIndex: 'id', text: 'id'},
                      {dataIndex: 'km_beg', text: 'Привязка (км.)'}
                    , {dataIndex: 'name', text: 'Наименование файла'}
                    , {dataIndex: 'desc', text: 'Описание'}
                    , {dataIndex: 'size', text: 'Размер (мб.)'}
                    , {dataIndex: 'file_created_at', text: 'Дата создания документа', xtype: 'datecolumn', format: 'd.m.y'}
                ],
                listeners: {
                    itemdblclick: 'onRowDblClickAttach',
                    scope: this
                }
            },
            tpl = [],
            itemSelector = null;
        switch (type_id) {
            case -1:
                store.clearFilter(true);
                break;
            case 1:
                store.clearFilter(true);
                store.filterBy(function (record, id) {
                    return Ext.Array.contains([3, 4], parseInt(record.get('attachment_type_id')));
                });
                break;
            case 3:
                store.clearFilter(true);
                store.filterBy(function (record, id) {
                    return Ext.Array.contains([type_id], parseInt(record.get('attachment_type_id')));
                });
                tpl = [
                    '<tpl for=".">',
                    '<div class="thumb_photo">' +
                    '<img src="{path}" title="{name}"></img>' +
                    '<div class="info">' +
                    '<a style="text-decoration: none;" href="{path}" target="_blank"><b>Файл:</b> &nbsp&nbsp {name}</a>' +
                    '</br>' +
                    '<b>Привязка:</b> &nbsp&nbsp {km_beg}' +
                    '</br>' +
                    '<b>Описание:</b> &nbsp&nbsp {desc}' +
                    '</div>' +
                    '</div>',
                    '</tpl>'
                ];
                itemSelector = 'div.thumb_photo';
                break;
            case 4:
                store.clearFilter(true);
                store.filterBy(function (record, id) {
                    return Ext.Array.contains([type_id], parseInt(record.get('attachment_type_id')));
                });
                tpl = [
                    '<tpl for=".">',
                    '<div class="thumb_video">' +
                    '<video controls><source src="{path}" type="{mime}"></video>' +  //type="video/mp4"
                    '<div class="info">' +
                    '<a style="text-decoration: none;" href="{path}" target="_blank"><b>Файл:</b> &nbsp&nbsp {name}</a>' +
                    '</br>' +
                    '<b>Привязка:</b> &nbsp&nbsp {km_beg}' +
                    '</br>' +
                    '<b>Описание:</b> &nbsp&nbsp {desc}' +
                    '</div>' +
                    '</div>',
                    '</tpl>'
                ];
                itemSelector = 'div.thumb_video';
                break;
            case 2:
                store.clearFilter(true);
                store.filterBy(function (record, id) {
                    return Ext.Array.contains([type_id], parseInt(record.get('attachment_type_id')));
                });
                tpl = [
                    '<tpl for=".">',
                    '<div class="thumb_pdf">' +
                    '<embed src="{path}" frameborder="0" allowfullscreen>' +
                    '<div class="info">' +
                    '<a style="text-decoration: none;" href="{path}" target="_blank"><b>Файл:</b> &nbsp&nbsp {name}</a>' +
                    '</br>' +
                    '<b>Привязка:</b> &nbsp&nbsp {km_beg}' +
                    '</br>' +
                    '<b>Описание:</b> &nbsp&nbsp {desc}' +
                    '</div>' +
                    '</div>',
                    '</tpl>'
                ];
                itemSelector = 'div.thumb_pdf';
                break;
            case 5:
                store.clearFilter(true);
                store.filterBy(function (record, id) {
                    return Ext.Array.contains([type_id], parseInt(record.get('attachment_type_id')));
                });
                break;
            default:
                store.clearFilter(true);
        }
        if (Ext.Array.contains([2, 3, 4], type_id)) {
            obj = {
                xtype: 'dataview',
                reference: 'attachlist_view',
                cls: 'pics-list-content',
                store: 'RefAttachList',
                tpl: tpl,
                multiSelect: false,
                minHeight: 400,
                flex: 1,
                trackOver: true,
                overItemCls: 'x-item-over',
                itemSelector: itemSelector,
                emptyText: 'файлы отсутствуют',
                listeners: {
                    itemdblclick: 'onRowDblClickAttach',
                    scope: this
                }
            };
        }

        panel_attachments.add(obj);
        panel_attachments.updateLayout();
    },

    onRowDblClickAttach: function (dv, record, item, index, e) {
        this.attach_onEditClick();   // ошибка, т.к. this - это не контроллер, а грид
    },

    attach_onEditClick: function () {
        var attachlist_view = this.lookupReference('attachlist_view'),
            select_row = null,
            resSelected = null;
        if (attachlist_view) {
            select_row = attachlist_view.getSelectionModel().getSelection()[0];
            if (!select_row) return;
            resSelected = attachlist_view.store.getByInternalId(select_row.internalId).data;
        }

        if (!resSelected) return;

        if (this.attach) {
            this.attach.close();
            this.attach = null;
        }
        if (!this.attach) {
            this.attach = Ext.widget("attach", {
                object: {
                    fileId: resSelected.id,
                    objectId: resSelected.object_id,
                    km_beg: resSelected.km_beg,
                    desc: resSelected.desc
                },
                extensions: this.type_extensions
            });
            this.attach.setTitle("Изменить документ");
            this.attach.show();
        }
    },

    attach_onAddClick: function () {
        if (this.attach) {
            this.attach.close();
            this.attach = null;
        }
        if (!this.attach) {
            this.attach = Ext.widget("attach", {extensions: this.type_extensions});
            this.attach.setTitle("Прикрепить документ");
            this.attach.show();
        }
    },

    attach_onDelClick: function () {
        var attachlist_view = this.lookupReference('attachlist_view'),
            select_row = null,
            resSelected = null;
        if (attachlist_view) {
            select_row = attachlist_view.getSelectionModel().getSelection()[0];
            if (!select_row) return;
            resSelected = attachlist_view.store.getByInternalId(select_row.internalId).data;
        }

        if (!resSelected) return;

        Ext.Ajax.request({
            url: ProxyUrlBackend + '/roadinfo/attach/attach_file/?id=' + resSelected.id + '&name=' + resSelected.name,
            method: 'delete',
            scope: this,
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
            cors: true,
            useDefaultXhrHeader: false,
            success: function (response, options) {
                var jsonResp = Ext.util.JSON.decode(response.responseText);
                Ext.MessageBox.alert("Информация", "Документ успешно удален", function () {
                    attachlist_view.getStore().reload();
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

    downloadFile: function(url){
        var gridEl = this.lookupReference('attachlist_view').getEl();
        var el = Ext.DomHelper.append(gridEl, {
            tag: "a",
            download: url.substr(url.lastIndexOf('/') + 1),
            href: url
        });
        el.click();
        Ext.fly(el).destroy();
    },

    attach_onDownloadClick: function () {
        var attachlist_view = this.lookupReference('attachlist_view'),
            select_row = null,
            resSelected = null;
        if (attachlist_view) {
            select_row = attachlist_view.getSelectionModel().getSelection()[0];
            if (!select_row) return;
            resSelected = attachlist_view.store.getByInternalId(select_row.internalId).data;
        }

        if (!resSelected.path) return;

        this.downloadFile(window.location.origin + '/roadinfo/' + resSelected.path);
    }
});
