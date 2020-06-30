function uniques(arr) {
    var a = [];
    for (var i = 0, l = arr.length; i < l; i++)
        if (a.indexOf(arr[i].data.object_id) === -1 && arr[i].data.object_id !== '')
            a.push(arr[i].data.object_id);
    return a;
}

Ext.define('roadInfo.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    init: function () {
        // this.getView().on("afterlayout", this.onAfterLayout(), this); //либо так

        this.control({
            "mainmaptoolbar button[action=searchkm]": {
                click: this.onSearchKmClick
            },

            "mainmaptoolbar menuitem[action=searchkmcancel]": {
                click: this.onSearchKmCancelClick
            },

            "layertoolbar button[action=layer_add]": {
                click: this.onLayerAddClick
            },

            "layertoolbar button[action=layer_del]": {
                click: this.onLayerDelClick
            },

            "layertoolbar button[action=layer_xls]": {
                click: this.onLayerExcelClick
            }
        })
    },

//      onClickTestButton: function(){
//          //this.lookupReference('ttest').onBinding();
//          var tt = this.lookupReference('ttest');
//          tt.setObjectId(251);
//         // tt.setCoordinates("dddd");
//
// console.clear();
//          /*console.log('V1 ' + tt.getValue());
//          console.log('SV1 ' + tt.getSubmitValue());
//          console.log('C1 ' + tt.getCoordinates());*/
//          //tt.clearValue();
//
//          console.log(' FUNC ' + tt.onPointOrBinding());
//          console.log('O2 ' + tt.getObjectId());
//          console.log('V2 ' + tt.getValue());
//          console.log('SV2 ' + tt.getSubmitValue());
//          console.log('C2 ' + tt.getPoint());
//
//      },

    onComboMunobrSetFilter: function (combo, trigger, event) {
        if (this.layerobjects) { //вызову диалог выбора дорог согласно ведомости
            this.layerobjects.close();
            this.layerobjects = null;
            Ext.getStore('RefLayersObjects').removeAll();
        }
        this.layerobjects = Ext.widget("layerobjectstable");
        this.layerobjects.show();
    },

    onComboMunobrClear: function (combo, trigger, event) {
        Ext.getStore('RefMunobrs').load(); //отменю фильтр на районы
        trigger.hide();
        combo.clearValue();
        combo.setValue(null);
    },

    onClickFileFieldButton: function () {
        if (this.filefield) {
            this.filefield.close();
            this.filefield = null;
        }
        this.filefield = Ext.widget("testtable");
        this.filefield.show();
    },

    onAfterRender: function () {
        var cdef = roadInfo.app.getController('default');
        this.userInfo = cdef.getUserInfo();
        var btnAccess = this.lookupReference('access');
        if (btnAccess){
            btnAccess.setTooltip(this.userInfo.namefull);
            if (this.userInfo.role_id != '1') btnAccess.destroy();
        }
    },

    onHelpClick: function(){
        var down = function (url, filename) {
            var a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', filename);
            var aj = $(a);
            aj.appendTo('body');
            aj[0].click();
            aj.remove();
        }
        down("readme.doc", "readme.doc");
    },

    onClickLayerImportButton: function () {
        if (this.layerupload) {
            this.layerupload.close();
            this.layerupload = null;
        }
        this.layerupload = Ext.widget("layerupload");
        this.layerupload.show();
    },

    onClickUsersButton: function () {
        if (this.accesslist) {
            this.accesslist.close();
            this.accesslist = null;
        }
        this.accesslist = Ext.widget("accesslist");
        this.accesslist.show();
    },

    onSearchKmClick: function () {
        var cdef = roadInfo.app.getController('default');
        if (cdef) {
            cdef.onShowSearchKm();
        }
    },

    onSearchKmCancelClick: function () {
        var y = this.lookupReference('yandexmap');
        y.clearSearch();
    },

    onExitClick: function () {
        //sessionStorage.clear(); //очищу сессионное хранилище
        // логаут
        Ext.Ajax.request({
            url: ProxyUrlBackend + '/roadinfo/logout/',
            method: 'GET',
            scope: this,
            withCredentials: true,
            cors: true,
            useDefaultXhrHeader: false,
            success: function (response, options) {
            },
            failure: function (response, options) {
            },
            callback: function (opt, success, response) {
                if (success)
                    window.location.replace(Ext.decode(response.responseText).uri);
            }
        });
    },

    getMunobrsIdFromStore: function (items, val) {
        var ids = [];
        if (val.includes(0)) {  //если позиция ВСЕ, то верну все ИД кроме нулевого
            if (items.length > 0) {
                Ext.each(items, function (item) {
                    if (item.id > 0)
                        ids.push(item.id);
                });
            }
        }
        return ids;
    },

    onComboMunobrChange: function (combo, newValue, oldValue, eOpts) {
        var y = this.lookupReference('yandexmap'),
            me = this;
        if (!y) return;

        var val = newValue; //combo.getValue(); //выбранные пользователем списко
        if (!val) return;

        var comboObject = this.lookupReference('comboObject');
        comboObject.clearValue();
        comboObject.setValue(null);
        comboObject.disable();
        this.lookupReference('showOnMap').setDisabled(true);
        this.lookupReference('searchkm').setDisabled(true);
        this.lookupReference('treeLayers').setDisabled(true);
        //this.lookupReference('layerpanel').setDisabled(true);
        //this.lookupReference('layerpanel').setCollapsed(true);
        //this.lookupReference('layerpanel').setTitle();

        if ((val) && (
            val.includes(0)  //если среди выбранных позиций есть ВСЕ, то отмечу тольуо ЕЕ
            ||
            (!val.includes(0) && val.length == combo.getStore().data.items.length - 1) //если количество выбранных позиций равно общему количеству выбранных позиций, то это означает, что выбраны ВСЕ
        )) { //
            combo.setRawValue('ВСЕ');
            val = me.getMunobrsIdFromStore(combo.getStore().data.items, [0]);
        }

        y.clearMunobr();
        y.clearSearch();
        y.clearObject();
        y.removeLayerAll();
        this.lookupReference('treeLayers').getRootNode().cascadeBy(function () { //если отмечены только районы, то визаулизация графических элементов отключена совсем
            this.set('checked', null);
        });

        Ext.each(val, function (item) {
            var ind = combo.getStore().findExact('id', item);
            var rec = combo.getStore().getAt(ind);
            y.addMunobr({
                id: rec.data.id,
                name: rec.data.name,
                color: rec.data.color_hex,
                objects_ids: rec.data.objects_id,
                geo_object: rec.data.geo_json//me.updateJsonMunobr(rec)
            });
        });

        var storeObjects = Ext.StoreManager.lookup('RefObjects');
        storeObjects.clearData();
        storeObjects.removeAll();
        //  this.selectedObjectID = [];

        if (y.getMunobrsID().length === 0) return; //если списко муницпалитетов пуст, то ничего не запрашиваю
        if (storeObjects) storeObjects.load(
            {
                params: {
                    //munobr_ids: Ext.encode(y.getMunobrsID()),
                    object_ids: Ext.encode(y.getObjectsIDFromMunobrs()) //написать функцию Брать ИД объектов из свойства Района
                },
                callback: function () {
                    comboObject.clearValue();
                    comboObject.setValue(null);
                    comboObject.enable();
                    me.lookupReference('showOnMap').setDisabled(false);
                    me.lookupReference('treeLayers').setDisabled(false);
                }
            }
        );
    },

    onComboObjectsChange: function (combo, newValue, oldValue, eOpts) {
        var y = this.lookupReference('yandexmap');
        if (!y) return;
        var me = this;
        var val = newValue;//combo.getValue(); //выбранные пользователем списко

        if ((val) && (
            val.includes(0)  //если среди выбранных позиций есть ВСЕ, то отмечу только ЕЕ
            ||
            (!val.includes(0) && val.length == combo.getStore().data.items.length - 1) //если количество выбранных позиций равно общему количеству выбранных позиций, то это означает, что выбраны ВСЕ
        )) { //
            combo.setRawValue('ВСЕ');
            val = me.getMunobrsIdFromStore(combo.getStore().data.items, [0]);
        }

        y.clearSearch();
        y.clearObject();
        y.removeLayerAll();

        //поубираю в дереве ранее отмеченные галочки, если графического элемента нет, то уберу галочку вообще
        this.lookupReference('treeLayers').getRootNode().cascadeBy(function () {
            if (this.data.geometry_type && this.data.iconHref) {
                this.set('checked', false);
            } else {
                this.set('checked', null);
            }
        });

        Ext.each(val, function (item) {
            y.addObject({
                id: item
            });
        });

        // this.selectedObjectID = val;
    },

    onClickShowYandexButton: function () {
        var y = this.lookupReference('yandexmap');
        if (!y) return;
        this.lookupReference('showOnMap').setDisabled(true);
        this.lookupReference('searchkm').setDisabled(true);
        y.showMunobrs_OR_Objects();
        //кнопки включу уже в yandexmap
    },

    /*onClickPhotosButton: function(){
        var y = this.lookupReference('yandexmap');
        if (!y) return;
        y.addPhotoLayer("/photo-map.xml");
    },*/

    onTreeChackChange: function (node, checked, eOpts) {
        var cdef = roadInfo.app.getController('default'),
            y = this.lookupReference('yandexmap');
        if (!cdef) return;

        var selectedMode = cdef.getSelectedMode();

        if (checked) { //если включаем галочку, то делаем проверки
            // y.checkShowOnMap(1);
            // if (!selectedMode.objects_id || selectedMode.objects_id.length > 1) {
            if (!y.checkShowOnMap()) {   //можно передать параметр 1, который означет что элементы только для одной дороги
                node.set('checked', false);
                Ext.Msg.alert('Внимание', 'Визуализация географических объектов не доступна');
                return;
            }
        }

        var record = node.data,
            me = this;
        if (record && record.leaf) {

            if (checked) {
                var t = cdef.onShowLayerOnMap(record.id, selectedMode.objects_id, null);
            } else {
                y.removeLayer({layer_id: record.id});
            }

        }
    },

    onTabChange: function (tabPanel, tab) {
        //оставлю в справочнике Объектов, только те объекты которые выбраны пользователм
        //  console.log('срфтпу');
        var cdef = roadInfo.app.getController('default'),
            toolbar = this.lookupReference('layertoolbar'),
            selectedMode = cdef.getSelectedMode(),
            layergrid = (tab.layerID && tab.alias == "widget.layergrid") ? tab : null;
        if (layergrid) {
            cdef.getDictionaryStore('amstrad_routes.objects').clearFilter(true);
            cdef.getDictionaryStore('amstrad_routes.objects').filterBy(function (record, id) {
                return Ext.Array.contains(layergrid.objects_id, record.get('id'));
            });

            if (layergrid.typeDetail == 1) {
                Ext.getCmp('layer_add').setDisabled(false);
                Ext.getCmp('layer_edit').setDisabled(false);
                Ext.getCmp('layer_delete').setDisabled(false);
                Ext.getCmp('layer_map').setDisabled(layergrid.geometry_type ? false : true);
                Ext.getCmp('layer_xls').setDisabled(false);
            } else {
                Ext.getCmp('layer_add').setDisabled(true);
                Ext.getCmp('layer_edit').setDisabled(true);
                Ext.getCmp('layer_delete').setDisabled(true);
                Ext.getCmp('layer_map').setDisabled(true);
                Ext.getCmp('layer_xls').setDisabled(false);
            }

        } else {
            toolbar.items.items.forEach(function (btn) {//еслиактттрована вкладка Общих характерии, то отключу кноки
                btn.setDisabled(true);
            })
        }
    },

    updateStoreInfoSelect: function (layerMetaInfo, rowsCount) {
        //  console.log('update');
        var gridInfoSelect = this.lookupReference('gridInfoSelect'),
            cdef = roadInfo.app.getController('default'),
            selectedMode = cdef.getSelectedMode(),
            arrDublic = function duplicat(b, c) {
                for (var d = [], e = {}, f = {}, a = 0; a < b.length; a++) e[b[a]] = !0;
                for (a = 0; a < c.length; a++) f[c[a]] = !0;
                for (var g in e) f[g] && d.push(g);
                return d
            };
        if (!gridInfoSelect) return;
        var storeInfoSelect = gridInfoSelect.getStore();

        //удалю записи по ведомости
        storeInfoSelect.remove(
            storeInfoSelect.queryBy(function (record) {
                return record.get('layer_id') == layerMetaInfo.meta.id;
            }).getRange()
        )

        if (selectedMode.objects_id.length == 0) return;

        if (selectedMode.objects_id.length == 1) {
            var row = cdef.getDictionaryStore('amstrad_routes.objects').getById(selectedMode.objects_id[0]);
            if (row) storeInfoSelect.add({
                layer_id: layerMetaInfo.meta.id,
                layer_name: layerMetaInfo.meta.title + '      [ ' + rowsCount + ' записей ]',
                munobr_id: row.get('munobr_id'),
                object_name: row.get('name')
            })
        } else {
            //есть районы нет дорог
            if (selectedMode.munobrsSelectedID.length > 0 && selectedMode.objectsSelectedID.length == 0) {
                selectedMode.munobrsSelectedID.forEach(function (element) {
                    storeInfoSelect.add({
                        layer_id: layerMetaInfo.meta.id,
                        layer_name: layerMetaInfo.meta.title + '      [ ' + rowsCount + ' записей ]',
                        munobr_id: element,
                        object_name: null
                    })
                });
            }
            //есть районы есть дороги
            if (selectedMode.munobrsSelectedID.length > 0 && selectedMode.objectsSelectedID.length > 0) {
                selectedMode.munobrsSelectedID.forEach(function (element) {
                    var munStore = Ext.getStore('RefMunobrs'),
                        munobr = munStore.getById(element),
                        dubl = arrDublic(selectedMode.objectsSelectedID, munobr.get('objects_id')); //найду пересекающиеся элементы

                    if (dubl.length == munobr.get('objects_id').length) {//дороги все в районе
                        storeInfoSelect.add({
                            layer_id: layerMetaInfo.meta.id,
                            layer_name: layerMetaInfo.meta.title + '      [ ' + rowsCount + ' записей ]',
                            munobr_id: element,
                            object_name: "ВСЕ"
                        })
                    } else {//дороги не все в арйоне
                        dubl.forEach(function (object) {
                            storeInfoSelect.add({
                                layer_id: layerMetaInfo.meta.id,
                                layer_name: layerMetaInfo.meta.title + '      [ ' + rowsCount + ' записей ]',
                                munobr_id: element,
                                object_name: cdef.getDictionaryStore('amstrad_routes.objects').getById(object).get("name")
                            })
                        })
                    }

                });
            }
        }

        /*Ext.each(cdef.getDictionaryStore('amstrad_routes.objects').getRange(), function (row) {
            if (row.get('code')) {
                storeInfoSelect.add({layer_id: layerMetaInfo.meta.id, layer_name: layerMetaInfo.meta.title, munobr_id: row.get('munobr_id'), object_id: row.get('id')})
            }
        });*/

        gridInfoSelect.getView().refresh();
    },

    onTreeContextMenu: function (tree, record, item, index, e, eOpts) {
        var me = this;
        if (record && record.data.leaf) {

            var items = [{
                text: 'Открыть ведомость',
                iconCls: 'fa fa-table',
                handler: function () {
                    var cdef = roadInfo.app.getController('default');
                    if (cdef) {
                        var selectedMode = cdef.getSelectedMode();
                        // if (selectedMode.objects_id && selectedMode.objects_id.length > 1 && selectedMode.munobrsSelectedID.length > 1) {
                        //     Ext.Msg.alert('Внимание', 'Просмотр ведомости доступен для не более одного муниципального образования');
                        //     return;
                        // } else {

                        if (selectedMode.objectsSelectedID && selectedMode.objectsSelectedID.length > 0) { //детальная ведомость по объектам
                            if (!record.data.table_name) {
                                Ext.Msg.alert('Внимание', 'Для данной ведомости отсутствует конфигурация');
                                return;
                            } else {
                                me.onShowLayerGrid(record.data.id, 1, selectedMode.objects_id);
                            }
                        } else if (selectedMode.munobrsSelectedID && selectedMode.munobrsSelectedID.length > 0) { //сводная ведомость по району
                            if (!record.data.proc_agr_name) {
                                Ext.Msg.alert('Внимание', 'Для данной ведомости отсутствует конфигурация сводной ведомости по муниципальному району');
                                return;
                            } else {
                                me.onShowLayerGrid(record.data.id, 2, selectedMode.objects_id);
                            }
                        }

                        // }
                    }
                }
            }];

            if (this.userInfo && this.userInfo.role_id == 1) {
                items.push({
                    text: 'Редактор ведомости',
                    iconCls: 'fa fa-cogs',
                    handler: function () {
                        if (me.layereditor) {
                            me.layereditor.close();
                            me.layereditor = null;
                        }
                        me.layereditor = Ext.widget("layereditor", {
                            layer: {
                                id: record.data.id,
                                name: record.data.text,
                                table_name: record.data.table_name,
                                proc_agr_name: record.data.proc_agr_name,
                                parent_id: record.data.parent_id,
                                dict_icons: record.data.iconHref,
                                geometry_type: record.data.geometry_type
                            }
                        });
                        me.layereditor.setTitle("Редактор ведомости: " + record.get("text"));
                        me.layereditor.show();
                    }
                })
            }

            var menu_grid = new Ext.menu.Menu({items: items});
            var position = [e.getX() - 10, e.getY() - 10];
            e.stopEvent();
            menu_grid.showAt(position);
        } else {
            e.stopEvent();
        }
    },

    onShowLayerGrid: function (layerID, typeDetail, objectsID) {
        var cdef = roadInfo.app.getController('default'),
            me = this;
        if (cdef) {
            layerMetaInfo = cdef.getLayerMetaInfo(layerID, typeDetail); //cdef.getLayerAttributesStore('_dgLayer_336');
        }

        var layerpanel = this.lookupReference('layerpanel'),
            layergridname = 'layergrid_' + layerID;

        if (!layerMetaInfo || !layerpanel) return;

        var store_grid = cdef.getLayerTableStore(layerID, typeDetail, objectsID, layerMetaInfo.modelFields);

        var oldGrid = this.lookupReference(layergridname);
        if (oldGrid) {
            layerpanel.remove(oldGrid);
        }
        var plug = [
            {
                ptype: 'bufferedrenderer'
            },
            {
                ptype: 'gridfilters'
            }
        ];
        var colum = layerMetaInfo.gridFields.slice();

        if (typeDetail == 1) { //если детализация до объекта, то добавлю плагин редактирования
            plug.push({
                ptype: 'rowediting',
                pluginId: 'RowEditingPlugin',
                clicksToEdit: 2,
                listeners: {
                    edit: this.onGridEditorEdit,
                    beforeedit: this.onGridEditorBeforeEdit,
                    canceledit: this.onGridEditorCancelEdit,
                    validateedit: this.onGridEditorValidateEdit
                }
            });
            selmodel = {selType: 'checkboxmodel'};

            if (layerMetaInfo.meta.geometry_type) {
                colum.unshift({
                    xtype: 'actioncolumn',
                    width: 20,
                    hideable: false,
                    sortable: false,
                    menuDisabled: true,
                    items: [{
                        iconCls: 'mappoint16',
                        // getClass: function(v, meta, rec) {
                        //     return 'fa fa-map-marker';
                        // },
                        tooltip: 'Местоположение элемента на карте',
                        handler: 'onLayerMapPointClick',
                        scope: this
                    }]
                });
            }

        } else {
            Ext.each(layerMetaInfo.gridFields, function (item) {  //для сводной ведомости растянем столбцы
                item['flex'] = 1;
            });
            selmodel = null;
        }

        var grid = Ext.create("Ext.grid.Panel", {
            id: layergridname,
            icon: layerMetaInfo.meta.icons,
            reference: layergridname,
            alias: "widget.layergrid",
            title: layerMetaInfo.title,
            plugins: plug,
            autoScroll: true,
            loadMask: true,
            loadingText: "Загрузка...",
            store: store_grid,
            columns: colum,
            excelName: layerMetaInfo.title,
            ObjectDBName: layerMetaInfo.objectDBName,
            objects_id: objectsID,
            layerID: layerID,
            typeDetail: typeDetail,
            geometry_type: (typeDetail == 1 && layerMetaInfo.meta.geometry_type) ? layerMetaInfo.meta.geometry_type : null,
            forceFit: false,
            scroll: "both",
            flex: 1,
            viewConfig: {
                trackOver: true,
                xtype: "gridview",
                enableTextSelection: true
            },
            selModel: selmodel,
            stateId: "layergrid_" + layerID + "_" + typeDetail,
            stateful: true,
            stateEvents: ['columnresize', 'columnmove', 'show', 'hide' /*,  'sortchange', 'groupchange'*/]
        });

        store_grid.load({
            callback: function () {
                layerpanel.setDisabled(false);
                layerpanel.setCollapsed(false);
                layerpanel.add(grid);
                layerpanel.updateLayout();
                layerpanel.setActiveTab(layergridname);
                me.updateStoreInfoSelect(layerMetaInfo, this.getCount()); //обновлю вкладку в которой инфа о выборке
            }
        });
    },

    onLayerMapClick: function (button, evt) {
        var layerpanel = this.lookupReference('layerpanel');
        var layergrid = layerpanel.getActiveTab();
        layergrid = (layergrid.layerID && layergrid.alias == "widget.layergrid") ? layergrid : null;

        var cdef = roadInfo.app.getController('default'),
            y = this.lookupReference('yandexmap');
        if (layergrid && layergrid.getStore().isLoaded() && y) {
            // var rows = layergrid.getStore().getRange(),
            //     rows_id = [];
            // var object_ids = uniques(rows);
            // Ext.each(rows, function (item) {
            //     if (item.data.id) {
            //         rows_id.push(item.data.id)
            //     }
            // });
            // if (rows_id.length == 0) { //если нет записей, то отправлю отсутствующий ИД
            //     rows_id.push(-100);
            // }
            // //y.setObjectZoom(object_ids[0]);
            // cdef.onShowLayerOnMap(layergrid.layerID, null, rows_id);

            var rows_id = [],
                selected = layergrid.getView().getSelectionModel().getSelection();
            Ext.each(selected, function (item) {
                rows_id.push(item.data.id);
            });
            if (rows_id.length == 0) { //если нет записей, то отправлю отсутствующий ИД
                rows_id.push(-100);
            }
            cdef.onShowLayerOnMap(layergrid.layerID, null, rows_id);
        }
    },

    onLayerMapPointClick: function (grid, rowIndex, colIndex) {
        var layerpanel = this.lookupReference('layerpanel');
        var layergrid = layerpanel.getActiveTab();
        var y = this.lookupReference('yandexmap');
        layergrid = (layergrid.layerID && layergrid.alias == "widget.layergrid") ? layergrid : null;

        if (layergrid) {
            var selected = layergrid.getView().getSelectionModel().getSelection();
            // var arrayList = [];
            // Ext.each(selected, function (item) {
            //     arrayList.push(item.data.id);
            // });
            // if (selected.length > 1){
            //     Ext.Msg.alert('Внимание', 'Функция местоположения элемента на карте доступна только для одного (последнего) отмеченного элемента');
            // }
            var arrayList = grid.getStore().getAt(rowIndex).get("id");
            //selected[selected.length - 1].data.id; //покажем последний отмеченный галочкой элемент
            if (y) y.onShowBallonLayer(layergrid.layerID, arrayList);
        }
    },

    onGridEditorValidateEdit: function (c, w) {
        var cdef = roadInfo.app.getController('default'),
            object_store = cdef.getDictionaryStore('amstrad_routes.objects');
        if (object_store && object_store.isLoaded()) {
            var row = object_store.getAt(object_store.findExact("code", w.newValues['object_id'])),
                object_km_beg = (row) ? parseFloat(row.get("km_beg")) : null,
                object_km_end = (row) ? parseFloat(row.get("km_end")) : null
        }

        if (w.field == "km_beg" && w.newValues["km_end"] && w.newValues["km_beg"] > w.newValues["km_end"]) {
            Ext.Msg.alert('Ошибка', "Км начала должен быть меньше км конца");
            return false
        }
        if (w.field == "km_end" && w.newValues["km_beg"] && w.newValues["km_end"] < w.newValues["km_beg"]) {
            Ext.Msg.alert('Ошибка', "Км конца должен быть больше км начала");
            return false
        }

        if (w.field == "km_beg" && object_km_beg && object_km_end && (w.newValues["km_beg"] < object_km_beg || w.newValues["km_beg"] > object_km_end)) {
            Ext.Msg.alert('Ошибка', "Км должен быть в диапазоне привязки км начала и конца объекта");
            return false
        }
        if (w.field == "km_end" && object_km_beg && object_km_end && (w.newValues["km_end"] < object_km_beg || w.newValues["km_end"] > object_km_end)) {
            Ext.Msg.alert('Ошибка', "Км должен быть в диапазоне привязки км начала и конца объекта");
            return false
        }
    },

    onGridEditorEdit: function (editor, ctx, eOpts) {
        var selr = ctx.record;
        if (!selr) return;
        if ("km_beg" in selr.data) { //преобразую координаты в километры
            var ed_km_beg = editor.editor.down('bindingfield[name=km_beg]');
            if (ed_km_beg) {
                ed_km_beg.setObjectId(selr.get('object_id'));
                ed_km_beg.onPointOrBinding();
                var km_beg = ed_km_beg.getValue();
                selr.set("km_beg", km_beg);
            }
        }
        if ("km_end" in selr.data) { //преобразую координаты в километры
            var ed_km_end = editor.editor.down('bindingfield[name=km_end]');
            if (ed_km_end) {
                ed_km_end.setObjectId(selr.get('object_id'));
                ed_km_end.onPointOrBinding();
                var km_end = ed_km_end.getValue();
                selr.set("km_end", km_end);
            }
        }

        ctx.grid.getStore().sync({
            callback: function (y, u, i) {
                // Callback action here
                var t = 0;
            }
        });
        Ext.getCmp('layer_add').setDisabled(false);
        Ext.getCmp('layer_edit').setDisabled(false);
        Ext.getCmp('layer_delete').setDisabled(false);
    },

    onGridEditorBeforeEdit: function (editor, ctx, eOpts) {
        Ext.getCmp('layer_add').setDisabled(true);
        Ext.getCmp('layer_edit').setDisabled(true);
        Ext.getCmp('layer_delete').setDisabled(true);
    },

    onGridEditorCancelEdit: function (editor, ctx, eOpts) {
        ctx.grid.getStore().rejectChanges();
        Ext.getCmp('layer_add').setDisabled(false);
        Ext.getCmp('layer_edit').setDisabled(false);
        Ext.getCmp('layer_delete').setDisabled(false);
    },

    onLayerAddClick: function (button, evt) {
        var layerpanel = this.lookupReference('layerpanel');
        var layergrid = layerpanel.getActiveTab();
        layergrid = (layergrid.layerID && layergrid.alias == "widget.layergrid") ? layergrid : null;
        if (layergrid && layergrid.getStore().isLoaded()) {
            var cdef = roadInfo.app.getController('default'),
                objectSelected = cdef.getSelectedMode().objectSelected;
            var newRec = Ext.create(cdef.getLayerModel(layergrid.layerID, 1).$className, {"object_id": (objectSelected) ? objectSelected.properties.get("id") : null});
            layergrid.getStore().insert(0, newRec);
            layergrid.getPlugin('RowEditingPlugin').startEdit(newRec);
        }
    },

    onLayerEditClick: function (button, evt) {
        var layerpanel = this.lookupReference('layerpanel');
        var layergrid = layerpanel.getActiveTab();
        layergrid = (layergrid.layerID && layergrid.alias == "widget.layergrid") ? layergrid : null;
        var selrow = (layergrid) ? layergrid.getSelectionModel().getSelection()[0] : null;
        if (layergrid && selrow && layergrid.getStore().isLoaded()) {
            layergrid.getPlugin('RowEditingPlugin').startEdit(selrow);
        }
    },

    onLayerDeleteClick: function (button, evt) {
        var layerpanel = this.lookupReference('layerpanel');
        var layergrid = layerpanel.getActiveTab();
        layergrid = (layergrid.layerID && layergrid.alias == "widget.layergrid") ? layergrid : null;
        var selrow = (layergrid) ? layergrid.getSelectionModel().getSelection() : null;
        if (layergrid && selrow && layergrid.getStore().isLoaded()) {
            this.getView().lookupReference('layer_delete').setDisabled(true);
            Ext.each(selrow, function (item) {
                layergrid.getStore().remove(item);
            });
            layergrid.getStore().sync();
        }
        this.getView().lookupReference('layer_delete').setDisabled(false);
    },

    onAfterLayout: function () {
        var y = this.lookupReference('yandexmap');
        if (y) {
            y.onResize();
        }
    },

    onLayerExcelClick: function () {
        var layerpanel = this.lookupReference('layerpanel');
        var layergrid = layerpanel.getActiveTab();
        layergrid = (layergrid.layerID && layergrid.alias == "widget.layergrid") ? layergrid : null;
        if (layergrid && layergrid.getStore().getCount()) {
            layergrid.exportExcelXml(false, layergrid.excelName)
        }
    },

    onClickDictsListButton: function () {
        if (this.dictslist) {
            this.dictslist.close();
            this.dictslist = null;
        }
        this.dictslist = Ext.widget("dictstable");
        this.dictslist.show();
    }




    /* onClickLayerIconsButton: function () {
         var layerIconsList = Ext.widget("layericonstable");
         Ext.getStore('RefLayersAll').load({
             callback: function () {
                 layerIconsList.show();
             }
         });
         Ext.StoreManager.lookup('RefLayerIconsList').load();
     },*/
});
