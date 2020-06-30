Ext.define("roadInfo.controller.default", {
    extend: Ext.app.Controller,

    onStartApp: function () {
        this.getUserInfo();
        this.getDictionaryStore('amstrad_routes.objects');

        Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
            expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 31)) //1 Month from now
        }));
    },
    onShowLayerOnMap: function (layer, objects_id, rows_id) {
        var me = this,
            callback = function () {
                var layy = me.getLayerMetaInfo(layer, 1);
                loadedStores = true;
                Ext.each(layy.storeFields, function (store) {
                    if (store.isLoading()) {
                        loadedStores = false;
                    }
                });
                if (loadedStores) {
                    Ext.Ajax.request({
                        url: ProxyUrlBackend + "/roadinfo/layer/geometry/?layer=" + layer,
                        method: 'POST',
                        jsonData: Ext.util.JSON.encode({
                            "rows_id": rows_id,
                            "objects_id": objects_id
                        }),
                        async: true,
                        success: function (h) {
                            res = Ext.JSON.decode(h.responseText, true);
                            y = Ext.getCmp('yandexmap');
                            if (y) {
                                y.addLayer(res);
                            }
                        },
                        failure: function () {
                            y = Ext.getCmp('yandexmap');
                            if (y) {
                                y.removeLayer({objectDBName: layer});
                            }
                        }
                    });
                }
            },
            lay = this.getLayerMetaInfo(layer, 1, callback);
    },

    getUserInfo: function () {
        var res,
            goodFunc = function (h) {
                res = Ext.JSON.decode(h.responseText, true)
            },
            badFunc = function () {
                res = null;
            };

        if (!this.userInfo) {
            Ext.Ajax.request({
                url: ProxyUrlBackend + "/roadinfo/access/activeuser/",
                method: "GET",
                async: false,
                success: goodFunc,
                failure: badFunc
            });
            if (res && res.data) this.userInfo = res.data;
        }
        // this.userInfo = {
        //      worker_id: 10,
        //      id: 1,
        //      auth_user_id: 617,
        //      keyuser: 617,
        //      login: "Igor",
        //      name: "Репнов Игорь Борисович",
        //      namefull: "Репнов Игорь Борисович",
        //      email: "irepnov@gmail.com",
        //      munobrs: [200, 201, 203],
        //      layers: [176, 325, 40009],
        //      role_id: 1
        // }
        if (this.userInfo && this.userInfo.role_id == 1) {
            Ext.getStore('RefAccessAuthUsers').load();
            Ext.getStore('RefAccessMunobrs').load();
            Ext.getStore('RefAccessRoles').load();
            //Ext.getStore('RefAccessWorkers').load();
            Ext.getStore('RefAccessUsers').load();
            Ext.getStore('RefAccessLayersTreeAll').load();
        }

        return this.userInfo;
    },

    getSelectedMode: function () {
        var y = Ext.getCmp('yandexmap');
        if (!y) new Error('Yandex карта не доступна');

        var objectSel = y.getUserSelectObject(),
            objectsIds = y.getObjectsID(),
            munobrsIds = y.getMunobrsID();

        objects_id = [];
        if (objectSel) {
            objects_id.push(objectSel.properties.get("id"))
        } else if (objectsIds.length > 0) {
            objects_id = objectsIds;
        } else if (munobrsIds.length > 0) {
            var store = Ext.getStore('RefMunobrs');
            Ext.each(munobrsIds, function (item) {
                record = store.getById(item);
                if (record && record.data.objects_id && record.data.objects_id.length > 0) {
                    objects_id = objects_id.concat(record.data.objects_id);
                }
            });
        }

        return {
            objectSelected: objectSel,
            objectsSelectedID: objectsIds,
            munobrsSelectedID: munobrsIds,
            objects_id: objects_id.length > 0 ? objects_id : null
        }
    },
    onShowAttachListFiles: function (objectID) {
        if (this.attachlist) {
            this.attachlist.close();
            this.attachlist = null;
        }
        if (!this.attachlist) {
            this.attachlist = Ext.widget("attachlist");
        }
        var store = Ext.getStore('RefAttachList'); //глобальное хранилище, содержащее данные ведомости
        if (!store) return;

        store.proxy.setExtraParam('object_id', objectID);
        store.load(); //загружу данные
        //this.yandexpanorama.setIconCls("table-16");
        this.attachlist.setTitle("Документы объекта содержания");
        this.attachlist.show();
    },
    onShowSearchKm: function () {
        var me = this;
        if (this.searchkm) {
            this.searchkm.close();
            this.searchkm = null;
        }
        /* if (!this.searchkm) {
             this.searchkm = Ext.widget("searchkm");
         }*/
        // var store = Ext.getStore('RefObjects'); //глобальное хранилище, содержащее данные ведомости
        // if (!store) return;
        // if (store.isLoaded()) {
            me.searchkm = Ext.widget("searchkm");
            me.searchkm.show();
        // } else {
        //     store.load({
        //         callback: function () {
        //             me.searchkm = Ext.widget("searchkm");
        //             me.searchkm.show();
        //         }
        //     });
        // }
    },
    getBooleanStore: function () {
        if (this.boolStore == null) {
            var a = [{
                code: true,
                name: "Да"
            }, {
                code: false,
                name: "Нет"
            }];
            this.boolStore = Ext.create("Ext.data.Store", {
                fields: ["code", "name"],
                data: a,
                proxy: {
                    type: "memory"
                }
            });

            //callbackDictLoading;
        }
        return this.boolStore
    },
    getFieldColumn: function (field, layer_id, callbackDictLoading) {
        var grid_filter_type, type_value, grigcolumn, format_value, form_field, column_cls = null;
        var me = this;
        switch (parseInt(field.type_name)) {
            case 8:
            case 11:
                grid_filter_type = "numeric";
                type_value = "float";
                grigcolumn = "numbercolumn";
                // format_value = "0.000";
                form_field = "numberfield";
                break;
            case 30:
                grid_filter_type = "numeric";
                type_value = "float";
                grigcolumn = "numbercolumn";
                // format_value = "0.000";
                form_field = "bindingfield";
                break;
            case 10:
                grid_filter_type = "numeric";
                type_value = "int";
                grigcolumn = "numbercolumn";
                format_value = "0";
                form_field = "numberfield";
                break;
            case 9:
                grid_filter_type = "string";
                type_value = "string";
                grigcolumn = "gridcolumn";
                form_field = "textfield";
                break;
            case 14:
            case 15:
            case 16:
                grid_filter_type = "date";
                type_value = "date";
                grigcolumn = "datecolumn";
                ///   format_value = B.config.DATE_DISPLAY_FORMAT;
                format_value = 'd.m.Y';
                form_field = "datefield";
                break;
            case 12:
                grid_filter_type = "boolean";
                type_value = "boolean";
                grigcolumn = "booleancolumn";
                form_field = "combobox";
                break;
            case 7:
            case 13:
            case 5:
            case 18:
            case 19:
                grid_filter_type = "list";
                type_value = "auto";
                grigcolumn = "gridcolumn";
                form_field = "combobox";
                break;
            case 17:
                grid_filter_type = "string";
                type_value = "auto";
                grigcolumn = "gridcolumn";
                form_field = "combobox";
                break;
            case 21: //для загрузки иконок в справочнике иконок
                grid_filter_type = "boolean";
                type_value = "string";
                grigcolumn = "gridcolumn";
                form_field = "filefield";
                break;
            case 50:
                grid_filter_type = "list";
                type_value = "string";
                grigcolumn = "gridcolumn";
                form_field = "iconfield";
                break;
            case 60://колонка для отображения имени прикрепленного файла // не редактируеммая
                grid_filter_type = "string";
                type_value = "string";
                grigcolumn = "gridcolumn";
                form_field = "textfield";
                break;
            case 61: //дополнительная колонка для диалога выбора файла
                grid_filter_type = null; //без фильтра
                type_value = "string";
                grigcolumn = "gridcolumn";
                form_field = "filefield";
                break;
            default:
                grid_filter_type = "string";
                type_value = "auto";
                grigcolumn = "gridcolumn";
                form_field = "textfield"
        }

        var dictCodeField = "code";
        var renderFunc;
        var stor, refname;
        var forceSel;
        var editorfield;
        var filter_column;
        var changeFileFunc;

        switch (form_field) {
            case "combobox":
                if (field.type_name == 7) {
                    refname = field.table_ref_name;
                    stor = this.getDictionaryStore(refname, callbackDictLoading);
                    forceSel = true;
                    dictCodeField = "code";
                    renderFunc = function (G, E) {
                        if (G == null) {
                            return ""
                        }
                        var s = me.getDictionaryStore(refname),
                            F = s.findExact("code", G.toString().trim()),
                            c = s.getAt(F);
                        if (c) {
                            return c.get("name")
                        }
                    }
                    column_cls = "x-column-header-dict";
                } else {
                    forceSel = false;
                    dictCodeField = "code";
                    if (grid_filter_type == "boolean") {
                        stor = this.getBooleanStore();
                        renderFunc = function (G, E) {
                            if (G == null) {
                                return ""
                            }
                            var F = me.getBooleanStore().findExact("code", G),
                                c = me.getBooleanStore().getAt(F);
                            if (c) {
                                return c.get("name")
                            }
                        }
                    } else {
                        refname = field.table_ref_name;
                        stor = this.getDictionaryStore(refname, callbackDictLoading);
                        if (field.type_name == 13) {
                            forceSel = true;
                            dictCodeField = "code";
                            renderFunc = function (G, E) {
                                if (G == null) {
                                    return ""
                                }
                                var F = me.getDictionaryStore(refname).findExact("code", G.toString().trim()),
                                    c = me.getDictionaryStore(refname).getAt(F);
                                if (c) {
                                    return c.get("name")
                                }
                            }
                        }
                        column_cls = "x-column-header-dict"
                    }
                }
                editorfield = {
                    xtype: form_field,
                    store: stor,
                    displayField: "name",
                    valueField: dictCodeField,
                    queryMode: "local",
                    forceSelection: forceSel,
                    typeAhead: true,
                    typeAheadDelay: 30,
                    enableRegEx: true,
                    caseSensitive: false,
                    // matchFieldWidth: true,
                    matchFieldWidth: false,
                    listConfig: {
                        listeners: {
                            beforeshow: function (picker) {
                                picker.minWidth = picker.up('combobox').getSize().width;
                            }
                        }
                    },
                    allowBlank: true
                };
                break;
            case "filefield":
                var l;

                /*if (field.extensions) {
                    var a = field.extensions.split(",");
                    for (var x = 0; x < a.length; x += 1) {
                        a[x] = "\\." + a[x]
                    }
                    l = new RegExp("(.+)(" + a.join("|") + ")", "i")
                }*/

                if (field.extensions) {
                    l = new RegExp("(.+)(" + field.extensions.toUpperCase() + "|" + field.extensions.toLowerCase() + ")", "i")
                }

                if (parseInt(field.type_name) == 21) {  //для загрузки иконок в справочнике иконок
                    editorfield = {
                        xtype: form_field,
                        emptyText: "Выберите файл",
                        buttonText: "",
                        clearOnSubmit: false,
                        buttonConfig: {
                            iconCls: "fa fa-paperclip"
                        },
                        regex: l,
                        readOnly: false,
                        regexText: "Не верный тип файла",
                        allowBlank: true
                    }
                }
                if (parseInt(field.type_name) == 61) {  //для загрузки файлов в ведомости
                    renderFunc = function (G, E) {
                        return '<i class="fa fa-paperclip"></i>';
                    }
                    changeFileFunc = function (filefield, value, eOpts) { //<== the function to show the image in the image field, using the Javascript' API "File"
                        var grid = filefield.up('grid'),
                            selrow = grid.getSelectionModel().getSelection()[0]; //пробюлема, т.к. несколько записей отмеченных
                        if (!selrow) return;
                        var file = filefield.fileInputEl.dom.files[0],
                            reader;
                        if (file === undefined || !(file instanceof File)) {
                            return;
                        }
                        if ((file.size / 1048576) > 2) { //размер файлов не более 3 Мб
                            Ext.Msg.alert('Ошибка', "Размер прикрепляемого файла не должен превышать 3 Мб");
                            return;
                        }
                        reader = new FileReader();
                        reader.onload = function (event) {
                            var uniq_name =
                                'f' +
                                (function getRandomInt(min, max) {
                                    return Math.floor(Math.random() * (max - min)) + min;
                                })(100, 999) +
                                (Math.random() * 0xFFFFFF << 0).toString(16) +
                                file.name.match(/\.[0-9a-z]+$/i)[0]; //расширение
                            selrow.set('file_content_value', event.target.result); //если есть поял прикрепляеммого файла, то в хранилище будет вымышленное поле
                            selrow.set(field.field_file_origin_name, uniq_name); //заменю в хранилище также имя прикрепленного файла новым сгененированным имененм
                        };
                        reader.readAsDataURL(file);
                    }
                    // column_cls = "fa fa-paperclip",
                    editorfield = {
                        xtype: form_field,
                        clearOnSubmit: false,
                        buttonText: "",
                        buttonConfig: {
                            iconCls: "fa fa-paperclip"
                        },
                        buttonOnly: true,
                        hideLabel: true,
                        regex: l,
                        readOnly: true,
                        regexText: "Не верный тип файла",
                        allowBlank: true,
                        listeners: {
                            change: changeFileFunc
                        }
                    }
                }
                break;
            case "textfield":
                if (field.maxLength < 100) {
                    editorfield = {
                        xtype: form_field,
                        format: format_value,
                        decimalPrecision: 3,
                        maxLength: field.maxLength,
                        allowBlank: true
                    }
                } else {
                    editorfield = {
                        //xtype: 'textareafield',
                        xtype: form_field,
                        format: format_value,
                        decimalPrecision: 3,
                        maxLength: field.maxLength,
                        allowBlank: true
                    }
                }
                if (parseInt(field.type_name) == 60) {// поле содержащее имя файла
                    renderFunc = function (G, E) {
                        if (G == "" || G == null) {
                            return ""
                        }

                        return '<a href="' + roadInfo.config.config.path.layer_attachments + layer_id + '/' + G + '" target="_blank">' + G + '</a>';
                    }
                }
                break;
            case "iconfield":
                renderFunc = function (G, E) {
                    if (G == null) {
                        return ""
                    }
                    return '<img style="width: 16px; height: 16px" src="' + roadInfo.config.config.path.icons_layers + G + '" alt="' + roadInfo.config.config.path.icons_layers + G + '"/>';
                }
                break;
            default:
                editorfield = {
                    xtype: form_field,
                    format: format_value,
                    decimalPrecision: 3,
                    allowBlank: true
                }
        }

        if (grid_filter_type) {
            if (grid_filter_type == "list") {
                filter_column = {
                    type: grid_filter_type,
                    labelField: "name",
                    idField: dictCodeField,
                    store: stor,
                    loadingText: "Загрузка..."
                }
            } else {
                if (grid_filter_type == "date") {
                    filter_column = {
                        type: grid_filter_type,
                        format: format_value,
                        dateFormat: "d/m/Y",
                        beforeText: "По дату",
                        afterText: "С даты",
                        onText: "На дату",
                        menuItems: ["after", "before", "on"]
                    }
                } else {
                    if (grid_filter_type == "boolean") {
                        filter_column = {
                            type: grid_filter_type,
                            noText: "Нет",
                            yesText: "Да",
                            defaultValue: null
                        }
                    } else {
                        filter_column = {
                            type: grid_filter_type
                        }
                    }
                }
            }
        }

        var gridcol = {
            xtype: grigcolumn,
            text: field.display_name,
            dataIndex: field.field_name,
            filter: filter_column,
            format: format_value,
            typeAttributeValue: parseInt(field.type_name),
            menuDisabled: false,
            // cellWrap: true,
            editor: null,
            cls: column_cls /*|| 'custom-gridCls'*/, //перенос слов в заголовке столбца
            lockable: false,
            minWidth: 50,
            autoSizeColumn: true,
            hidden: (field.isHidden == 1),
            /*listeners: {
                afterrender: function (c) {
                    var E = c.getEl().down("span").getWidth();
                    c.setWidth(E + 50);
                }
            },*/
            flex: (field.field_name == "name" || field.field_name == "object_id" ? 1 : null)
        };

        if (form_field == "filefield" && parseInt(field.type_name) == 61) {
            var model_field = {
                type: type_value,
                name: "file_content_value", //вымышленное поле
                useNull: true
            };
        } else {
            var model_field = {
                type: type_value,
                name: field.field_name,
                useNull: true
            };
        }

        //если есть права на редактирование
        //то можем
        //
        if (form_field == "bindingfield") {
            editorfield.vtype = 'vbinding';
        }
        if (field.isRequired && !field.isDisabled) {
            editorfield.allowBlank = false;
            model_field.allowBlank = false;
        }
        if (!field.isDisabled && parseInt(field.type_name) != 60 && editorfield) { //не запрещено к редактированию, не колонка имени файла и есть редактор
            gridcol.editor = editorfield;
        }
        if (grid_filter_type == "list") {
            gridcol.renderer = renderFunc;
           // gridcol.hasCustomRenderer = true;
        }
        if (parseInt(field.type_name) == 60) {  //колонка имя прикрепленного файла
            gridcol.renderer = renderFunc;
        }
        if (grigcolumn == "booleancolumn") {
            gridcol.trueText = "Да";
            gridcol.falseText = "Нет";
        }
        if (form_field == "filefield") {
            gridcol.renderer = renderFunc;
            gridcol.menuDisabled = true;
            if (parseInt(field.type_name) == 61) gridcol.text = '<div style="vertical-align:middle;margin-bottom:4px;" class="fa fa-paperclip fa-lg"></div>';
        }
        if (form_field == "iconfield") {
            // gridcol.text = '<img class="header-icon" style="vertical-align:middle;margin-bottom:4px;" src="resources/image16.png"/>';
            gridcol.text = '<div style="vertical-align:middle;margin-bottom:4px;" class="fa fa-picture-o"></div>'
        }

        return [model_field, gridcol, (grid_filter_type !== "boolean" && stor !== null && stor !== undefined) ? stor : null];
    },

//данные конфигурации ведомости
    getLayerMetaModel: function () {
        if (!this.layerMetaModel) {
            this.layerMetaModel = Ext.define("roadInfo.model.LayerMetaMyModel", {
                extend: "Ext.data.Model",
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'field_name', type: 'string'},
                    {name: 'display_name', type: 'string'},
                    {name: 'type_name', type: 'string'},
                    {name: 'table_ref_name', type: 'string'},
                    {name: 'orderId', type: 'float'},
                    {name: 'isHidden', type: 'int'},
                    {name: 'isDisabled', type: 'int'},
                    {name: 'maxLength', type: 'int'},
                    {name: 'extensions', type: 'string'},
                    {name: 'isRequired', type: 'int'}
                ],
                idProperty: 'id'
            });
        }
        return this.layerMetaModel;
    },
    getLayerMetaProxy: function (layer) {
        return {
            type: "ajax",
            api: {
                read: ProxyUrlBackend + "/roadinfo/layer/meta/?type_layer=1&layer=" + layer,
                update: ProxyUrlBackend + "/roadinfo/layer/meta/update/?layer=" + layer
            },
            actionMethods: {
                read: 'GET',
                update: 'POST'
            },
            reader: {
                type: "json",
                rootProperty: "metaData.fields",
                messageProperty: "message",
                successProperty: "success",
                idProperty: 'id'
            },
            writer: {
                type: 'json',
                writeAllFields: false,
                successProperty: 'success',
                idProperty: 'id'
            },
            listeners: {
                exception: function (proxy, response, operation) {
                    if (response && response.responseText)
                        if (!Ext.decode(response.responseText).success) {
                            Ext.Msg.alert('Ошибка', 'При изменении ведомости возникла ошибка:<br/>' + Ext.decode(response.responseText).message);
                            //Ext.StoreManager.lookup('RefCoefficients').load();
                        }
                }
            }
        }
    },
    getLayerMetaStore: function (layer) {
        this.layerMetaStores = Ext.create("Ext.data.Store", {
            model: this.getLayerMetaModel().$className,
            autoLoad: true,
            type: "buffered",
            pageSize: 1000,
            autoSync: true,
            proxy: this.getLayerMetaProxy(layer)
        });
        return this.layerMetaStores;
    },

//данные справоыника
    getDictMetaInfo: function (dict) {
        if (!this.dictMeta) {
            this.dictMeta = [];
        }
        var e = this.dictMeta[dict];

        if (e == null) {
            var grid_fields = [];
            var model_fields = [];
            var me = this;
            var dictFields = this.getDictMeta(dict);
            dictFields.metaData.fields.forEach(function (field) {
                r = me.getFieldColumn(field)
                model_fields.push(r[0]);
                grid_fields.push(r[1]);
            });
            this.dictMeta[dict] = {
                title: dictFields.metaData.title,
                objectDBName: dictFields.metaData.objectDBName,
                gridFields: grid_fields,
                modelFields: model_fields
            }
        }

        return this.dictMeta[dict];
    },
    getDictMeta: function (dict, c, g) {
        var res, goodFunc, badFunc, type = (c == undefined) ? false : true;
        if (type) {
            goodFunc = function (h) {
                c(Ext.JSON.decode(h.responseText, true))
            };
            badFunc = function () {
                g()
            }
        } else {
            goodFunc = function (h) {
                res = Ext.JSON.decode(h.responseText, true)
            };
            badFunc = function () {
            }
        }
        Ext.Ajax.request({
            url: ProxyUrlBackend + "/roadinfo/dict/meta/",
            method: "GET",
            params: {
                dict: dict
            },
            async: type,
            success: goodFunc,
            failure: badFunc
        });
        return res
    },
    getDictModel: function (dict) {
        if (!this.dictModel) {
            this.dictModel = [];
        }
        var e = this.dictModel[dict];
        if (e == null) {
            var m = this.getDictMetaInfo(dict);
            var e = Ext.define("roadInfo.model.MyModel" + m.objectDBName, {
                extend: "Ext.data.Model",
                fields: m.modelFields,
                idProperty: 'id'
            });
            this.dictModel[dict] = e;
        }

        return this.dictModel[dict];
    },
    getDictProxy: function (dict) {
        return {
            type: "ajax",
            api: {
                read: ProxyUrlBackend + "/roadinfo/dict/read/?dict=" + dict,
                create: ProxyUrlBackend + "/roadinfo/dict/create/?dict=" + dict,
                update: ProxyUrlBackend + "/roadinfo/dict/update/?dict=" + dict,
                destroy: ProxyUrlBackend + "/roadinfo/dict/destroy/?dict=" + dict
            },
            actionMethods: {
                read: 'GET',
                create: 'POST',
                update: 'POST',
                destroy: 'POST'
            },
            reader: {
                type: "json",
                rootProperty: "data",
                messageProperty: "message",
                successProperty: "success",
                idProperty: 'id'
            },
            writer: {
                type: 'json',
                writeAllFields: true,
                successProperty: 'success',
                idProperty: 'id'
            },
            listeners: {
                exception: function (proxy, response, operation) {
                    if (response && response.responseText)
                        if (!Ext.decode(response.responseText).success) {
                            Ext.Msg.alert('Ошибка', 'При изменении ведомости возникла ошибка:<br/>' + Ext.decode(response.responseText).message);
                            //Ext.StoreManager.lookup('RefCoefficients').load();
                        }
                }
            }
        }
    },
    getDictionaryStore: function (dict, callbackDictLoading) {
        if (!this.dictStores) {
            this.dictStores = [];
        }
        var e = this.dictStores[dict],
            me = this;

        if (e == null) {
            var meta = this.getDictMetaInfo(dict); //синхронно загружу данные мета

            var e = Ext.create("Ext.data.Store", {
                fields: meta.modelFields,
                name: dict,
                model: this.getDictModel(dict).$className,
                autoLoad: false,
                type: "buffered",
                pageSize: 10000,
                autoSync: false,
                proxy: this.getDictProxy(dict)
            });

            e.load({
                callback: callbackDictLoading
            });
            this.dictStores[dict] = e;
        }

        return this.dictStores[dict];
    },

//данные ведомости
    getLayerMeta: function (layer, layer_type, c, g) {
        var res, goodFunc, badFunc, type = (c == undefined) ? false : true;
        if (type) {
            goodFunc = function (h) {
                c(Ext.JSON.decode(h.responseText, true))
            };
            badFunc = function () {
                g()
            }
        } else {
            goodFunc = function (h) {
                res = Ext.JSON.decode(h.responseText, true)
            };
            badFunc = function () {
            }
        }
        Ext.Ajax.request({
            url: ProxyUrlBackend + "/roadinfo/layer/meta/",
            method: "GET",
            params: {
                layer: layer,
                type_layer: layer_type
            },
            async: type,
            success: goodFunc,
            failure: badFunc
        });
        return res
    },
    getLayerProxy: function (layer, layer_type, objects_id) {
        var pref = (objects_id && objects_id.length > 0) ? "&objects_id=" + Ext.JSON.encode(objects_id) : "";
        return {
            type: "ajax",
            api: {
                read: ProxyUrlBackend + "/roadinfo/layer/read/?layer=" + layer + "&type_layer=" + layer_type + pref,
                create: ProxyUrlBackend + "/roadinfo/layer/create/?layer=" + layer,
                update: ProxyUrlBackend + "/roadinfo/layer/update/?layer=" + layer,
                destroy: ProxyUrlBackend + "/roadinfo/layer/destroy/?layer=" + layer
            },
            actionMethods: {
                read: 'GET',
                create: 'POST',
                update: 'POST',
                destroy: 'POST'
            },
            reader: {
                type: "json",
                rootProperty: "data",
                messageProperty: "message",
                successProperty: "success",
                idProperty: 'id'
            },
            writer: {
                type: 'json',
                writeAllFields: true,
                successProperty: 'success',
                idProperty: 'id'
            },
            listeners: {
                exception: function (proxy, response, operation) {
                    if (response && response.responseText)
                        if (!Ext.decode(response.responseText).success) {
                            Ext.Msg.alert('Ошибка', 'При изменении ведомости возникла ошибка:<br/>' + Ext.decode(response.responseText).message);
                            //Ext.StoreManager.lookup('RefCoefficients').load();
                        }
                }
            }
        }
    },
    getLayerModel: function (layer, layer_type) {
        if (!this.layerModel) {
            this.layerModel = [];
        }
        var e = this.layerModel[layer + '_' + layer_type];
        if (e == null) {
            var m = this.getLayerMetaInfo(layer, layer_type);
            var e = Ext.define("roadInfo.model.MyModel" + m.objectDBName, {
                extend: "Ext.data.Model",
                fields: m.modelFields,
                idProperty: 'id'
            });
            this.layerModel[layer + '_' + layer_type] = e;
        }

        return this.layerModel[layer + '_' + layer_type];
    },
    getLayerTableStore: function (layer, layer_type, objects_id, model_fields, params) {
        var stor = Ext.create("Ext.data.Store", {
            fields: model_fields,
            model: this.getLayerModel(layer, layer_type).$className,
            //filterOnLoad: true,
            autoLoad: false,
            type: "buffered",
            pageSize: 10000,
            autoSync: false,
            proxy: this.getLayerProxy(layer, layer_type, objects_id)
            /* onUpdateRecords: function(l, c, m) {
                 f.onUpdateRecords(this, l, c, m)
             },
             onCreateRecords: function(l, c, m) {
                 f.onCreateRecords(this, l, c, m)
             },
             onDestroyRecords: function(l, c, m) {
                 f.onDestroyRecords(this, l, c, m)
             }*/
        });
        /* stor.lastParams = params;
         stor.on("beforeload", function (l, c) {
             Ext.apply(l.lastParams, c._params);
             c._params = l.lastParams;
             l.proxy.setExtraParams(l.lastParams);
         });*/
        return stor;
    },
    getLayerMetaInfo: function (layer, layer_type, callbackDictLoading) {
        if (!this.layerMeta) {
            this.layerMeta = [];
        }
        var e = this.layerMeta[layer + ' ' + layer_type];
        if (e == null) {
            var grid_fields = [];
            var model_fields = [];
            var store_fields = [];
            var me = this;
            var layerMeta = this.getLayerMeta(layer, layer_type);

            layerMeta.metaData.icons = (layerMeta.metaData.icons) ? roadInfo.config.config.path.icons_layers + layerMeta.metaData.icons : null;
            layerMeta.metaData.fields.forEach(function (field) {
                r = me.getFieldColumn(field, layer, callbackDictLoading);
                model_fields.push(r[0]);
                grid_fields.push(r[1]);
                if (r[2]) store_fields.push(r[2]);

                if (parseInt(field.type_name) == 60) {
                    f_add = {
                        id: (field.id) ? field.id + 10000 : null,
                        field_file_origin_name: field.field_name, //имя поля, которое хранит имя файла
                        field_name: 'file_content_dialog',
                        display_name: null,
                        type_name: 61,
                        table_ref_name: null,
                        isHidden: 0,
                        isDisabled: 0,
                        orderId: (field.orderId) ? field.orderId + 1 : null,
                        maxLength: (field.maxLength) ? field.maxLength : null,
                        extensions: (field.extensions) ? field.extensions : null,
                        isOffsetPosition: null,
                        isOffsetValue: null,
                        isRequired: (field.isRequired) ? field.isRequired : null
                    }
                    ad = me.getFieldColumn(f_add, layer, callbackDictLoading);
                    model_fields.push(ad[0]);
                    grid_fields.push(ad[1]);
                    //if (ad[2]) store_fields.push(ad[2]);
                }
            });

            this.layerMeta[layer + ' ' + layer_type] = {
                title: layerMeta.metaData.title,
                objectDBName: layerMeta.metaData.objectDBName,
                meta: layerMeta.metaData,
                gridFields: grid_fields,
                modelFields: model_fields,
                //metaFields: layerFields.metaData.fields,
                storeFields: store_fields
            }

            if (((store_fields.length == 1 && store_fields[0].name == 'amstrad_routes.objects')
                || (store_fields.length == 0))
                && callbackDictLoading) { //если ведомость без справочников или только справочник Дорог и есть Коллбак обратной функии, то вызову ее
                callbackDictLoading();
            }
        } else { //если уже загружалась мета инфа, и есть функция обратного вызова, то выполню ее
            if (callbackDictLoading) {
                callbackDictLoading();
            }
        }
        return this.layerMeta[layer + ' ' + layer_type];
    }
});

