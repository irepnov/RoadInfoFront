$(function () {
    $(document).on("click", "tr.object_element_layer", function () {
        var object = jQuery(this).data(),
            objectId = object.objectid,
            layerId = object.layerid;
        if (objectId && layerId) {
            var layerpanel = Ext.getCmp('layerpanel'),
                layergridname = 'layergrid_' + layerId;
            if (!layerpanel) return;
            var grid = layerpanel.setActiveTab(layergridname);
            if (grid && grid.typeDetail == 1 && grid.layerID == layerId) {
                var store = grid.getStore(),
                    rec = store.getById(objectId);
                if (rec) {
                    grid.getSelectionModel().select(rec);
                    grid.getView().focusRow(rec);
                }
            }
        }
    })
});

Ext.define('roadInfo.component.yandexmap', {
    extend: Ext.Component,
    alias: 'widget.yandexmap',

    config: {
        selectedObject: null,
        selectedMunobr: null,
        selectedPoint: [],
        //  selectedPolyline: null,
        //selectedLayer: null,
        map: null,
        objects: [],
        munobs: [],
        layers: [],
        //minZoom: 1,
        //maxZoom: 18,
        optionMap: {
            center: [45.1505384, 39.0593922],
            zoom: 9,
            controls: ['typeSelector', 'zoomControl']
        }

        // userClickPoint: [],
    },

    /*addPhotoLayer: function(file){
        // Создание и добавление YMapsML-документа на карту
        var me = this;
        ymaps.geoXml.load('photo.xml').then(function (res) {
            // Добавляем коллекцию геообъектов на карту.
            me.map.geoObjects.add(res.geoObjects);
        }, function (error) {
            alert('При загрузке YMapsML-файла произошла ошибка: ' + error);
        });
    },*/


    offsetPolyline: function (line) {
        if (line.options.offsets && line.options.offsets != 0) {
            origin_line = new ymaps.GeoObject(line);
            origin_line.options.setParent(this.map.options);
            origin_line.geometry.setMap(this.map);

            //принудительно увеличу масштаб карты, т.к. чем ближе объект на карте, тем ближе будет смещение от объекта, т.к. все измеряется в пикселях
            var me = this,
                pixelpoints = origin_line.geometry.getPixelGeometry().getCoordinates(),
                pixelpoints_xy = pixelpoints.map(function (point) {
                    return {x: point[0], y: point[1]};
                }),
                pixeloffset_xy = PolylineOffset.offsetPoints(pixelpoints_xy, line.options.offsets),
                pixeloffset = pixeloffset_xy.map(function (xy) {
                    return [xy.x, xy.y];
                }),
                coordoffset = pixeloffset.map(function (point) {
                    return me.map.options.get('projection').fromGlobalPixels(point, me.map.getZoom());
                });

            if (coordoffset && coordoffset.length >= 2) {
                line.geometry.coordinates = coordoffset;
            }
        }
        return line;
    },
    removeLayerAll: function () {
        for (var key in this.layers) {
            var value = this.layers[key];
            if (value) {
                value['layer_id'] = key;
                this.removeLayer(value);
            }
        }
    },
    removeLayer: function (layer) {
        var lay = this.layers[layer.layer_id];
        if (lay) {
            this.map.geoObjects.remove(lay); //удалю раннее показанные районы
            lay.removeAll();
        }
        return true;
    },
    addLayer: function (layer) {
        var lay = this.layers[layer.layer_id];
        if (lay) this.removeLayer(layer);
        if (layer.features.length == 0) return;

        var cdef = roadInfo.app.getController('default'),
            laymeta = cdef.getLayerMetaInfo(layer.layer_id, 1),
            propertyName_list = Object.getOwnPropertyNames(layer.features[0].properties),
            me = this;

        var renderHeader = (function () {
                var head = [];
                head.push('<tr>');
                Ext.each(propertyName_list, function (itemProp) {
                    if (itemProp !== "object_id" && itemProp !== "id") {
                        var grid_col = laymeta.gridFields.filter(function (item) {
                            return item.dataIndex == this;
                        }, itemProp)[0];
                        if (grid_col) {
                            var h = grid_col.text || itemProp;
                            head.push('<th>' + grid_col.text + '</th>');
                        }
                    }
                });
                head.push('</tr>');
                return head;
            })(),
            renderData = function (object) {
                var data = [];
                data.push('<tr class="object_element_layer" data-layerid="' + layer.layer_id + '" data-objectid="' + object.properties['id'] + '">');
                Ext.each(propertyName_list, function (itemProp) {
                    if (itemProp !== "object_id" && itemProp !== "id") {
                        var grid_col = laymeta.gridFields.filter(function (item) {
                            return item.dataIndex == this;
                        }, itemProp)[0];
                        if (grid_col) {
                            var val = object.properties[itemProp],
                                row_value;
                            if (val !== null && val !== undefined) {
                                if (grid_col.renderer && grid_col.renderer !== undefined && grid_col.renderer !== null && grid_col.renderer !== false && grid_col.xtype != "datecolumn" && grid_col.xtype != "booleancolumn") {
                                    row_value = grid_col.renderer(val);
                                } else {
                                    if (grid_col.xtype == "datecolumn" && val) {
                                        row_value = Ext.Date.format(new Date(val), grid_col.format)
                                    } else {
                                        if (grid_col.xtype == "booleancolumn" && (val === false || val === 0)) {
                                            row_value = "Нет"
                                        } else {
                                            if (grid_col.xtype == "booleancolumn" && (val === true || val === 1)) {
                                                row_value = "Да"
                                            } else {
                                                row_value = val
                                            }
                                        }
                                    }
                                }
                            } else {
                                row_value = '';
                            }
                            data.push('<td>' + row_value + '</td>');
                        }
                    }
                });
                data.push('</tr>');
                return data;
            };

        var title = laymeta.title;
        // if (laymeta.meta.icons){
        //     title = "<img src='" + laymeta.meta.icons + "' width='16' height='16' alt='lorem'>" + laymeta.title;
        // }

        if (layer.objects_id.length > 1) {
            if (layer.layer_geometry_type == "LineString") {
                this.setObjectZoom(layer.objects_id[0]); //позиционируюсь на нужной дороге
                this.map.setZoom(15); //делаю хороший масштаб
            }
        }

        Ext.each(layer.features, function (item) {
            if (item.options && item.options.iconImageHref) {
                item.options.iconImageHref = roadInfo.config.config.path.icons_layers + item.options.iconImageHref;
            }
            if (layer.objects_id.length == 1) {
                if (layer.layer_geometry_type == "LineString") {
                    item = me.offsetPolyline(item);
                }
            }
            item.table_header = renderHeader;
            item.table_data = renderData(item);
            item.options.balloonMaxWidth = layer.ballonMaxSize.width;
            item.options.balloonMaxHeight = layer.ballonMaxSize.height;
            item.properties.balloonContentBody = ['<div class="amstrad-balloon">', '<table>', '<caption>' + title + '</caption>', item.table_header.join(''), item.table_data.join(''), '</table>', '</div>'].join('');
        });
        var customBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            [
                '<div class="amstrad-balloon">',
                '<table>',
                '<caption>' + title + '</caption>',
                '{{properties.geoObjects[0].table_header}}',
                '{% for geoObject in properties.geoObjects %}',
                '{{geoObject.table_data}}',
                '{% endfor %}',
                '</table>',
                '</div>'
            ].join(''), {
                build: function () {
                    this.constructor.superclass.build.call(this);
                    this._$element = $('.amstrad-balloon', this.getParentElement());
                    this._$element.html(this._$element.html().substring(this._$element.html().indexOf('<table>'))); //уберу непонятные знаки
                }
            }
        );

        var objectManager = new ymaps.ObjectManager({
            clusterize: (layer.clusterIcons && layer.clusterIcons.href),
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            // Устанавливаем режим открытия балуна.
            // В данном примере балун никогда не будет открываться в режиме панели.
            clusterBalloonPanelMaxMapArea: 0,
            // По умолчанию опции балуна balloonMaxWidth и balloonMaxHeight не установлены для кластеризатора,
            // так как все стандартные макеты имеют определенные размеры.
            clusterBalloonMaxHeight: layer.ballonMaxSize.height,
            clusterBalloonMaxWidth: layer.ballonMaxSize.width,
            // Устанавливаем собственный макет контента балуна.
            clusterBalloonContentLayout: customBalloonContentLayout,
            clusterIconContentLayout: ymaps.templateLayoutFactory.createClass(
                '<div style="background-color: rgba(255, 255, 255, 0.6); height: 24px; width: 24px; border-radius: 50%; margin: 10px 0px 0px 10px; font-weight: bold;">$[properties.geoObjects.length]</div>'
            )
        });

        objectManager.add(layer.features);
        if (layer.clusterIcons && layer.clusterIcons.href) {
            layer.clusterIcons.href = roadInfo.config.config.path.icons_layers + layer.clusterIcons.href;
            objectManager.clusters.options.set({
                clusterIcons: [layer.clusterIcons]
            });
        }
        this.map.geoObjects.add(objectManager);
        if (objectManager.getBounds()) this.map.setBounds(objectManager.getBounds());//могут быть ситуации когда в objectManager нет добавленных объектов, например по дороге нет световоров
        this.layers[layer.layer_id] = objectManager;
        return this.layers[layer.layer_id];
    },

    onShowBallonLayer: function (layer_id, items_id) {
        var lay = this.layers[layer_id],
            me = this;
        if (!lay) return;

        var item = items_id;
        var objectState = lay.getObjectState(item),
            object = lay.objects.getById(item);
        if (objectState.found) {
            // Проверяем, находится ли объект в видимой области карты.
            if (!objectState.isShown) {
                object = new ymaps.GeoObject(object);
                object.geometry.setMap(me.map);
                me.map.setBounds(object.geometry.getBounds())
            }
            // Если объект попадает в кластер, открываем балун кластера с нужным выбранным объектом.
            if (objectState.isClustered) {
                lay.clusters.state.set('activeObject', object);
                lay.clusters.balloon.open(objectState.cluster.id);
            } else {
                // Если объект не попал в кластер, открываем его собственный балун.
                lay.objects.balloon.open(item);
            }
        }
    },

    setObjectZoom: function (objectId) {
        if (!this.map || !this.objectManagerObjects) return;
        var object = this.objectManagerObjects.objects.getById(objectId);
        if (!object) return;
        object = new ymaps.GeoObject(object);
        object.geometry.setMap(this.map);
        this.map.setBounds(object.geometry.getBounds());
    },

    clearSearch: function () {
        if (this.collectionSearch) {
            this.map.geoObjects.remove(this.collectionSearch);
            this.collectionSearch.removeAll();
            this.collectionSearch = null;
        }
    },

    clearObject: function () {
        if (this.objects) this.objects = [];
        this.map.geoObjects.remove(this.objectManagerObjects); //удалю раннее показанные районы
        this.objectManagerObjects.removeAll();
        this.selectedObject = null;
        this.selectedPolyline = null;
    },

    addObject: function (a) {
        if (!a) return;

        if (this.map) {
            if (this.objects) {
                this.objects.push(a);
                //добавить в
            }
        }
        return this.objects;
    },

    clearMunobr: function () {
        if (this.munobs) this.munobs = [];
        this.map.geoObjects.remove(this.objectManagerMunobrs); //удалю раннее показанные районы
        this.objectManagerMunobrs.removeAll();
        this.selectedMunobr = null;

        //очистить объект манажекр
        //очистить карту
    },

    addMunobr: function (a) {
        if (!a) return;

        if (this.map) {
            if (this.munobs) {
                this.munobs.push(a);
                //добавить в
            }
        }
        return this.munobs;
    },

    initComponent: function (a) {
        Ext.apply(this, a);

        //добавлю слушатели
        //или так
        this.on(
            {
                beforerender: function () {
                    //console.log('befor');
                },

                afterrender: this.initYandex
            });

        //или так
        /* this.on('beforerender', function () {
             console.log('befor');
         }, this);
         this.on('afterrender', this.initYandex, this);*/

        this.callParent();
    },

    onResize: function () {
        this.getYandexMap().container.fitToViewport();
    },

    getYandexMap: function () {
        var opt = roadInfo.config.config.yandex.optionMap || this.optionMap;

        if (!this.map) {
            this.map = new ymaps.Map(this.getId(), opt);
            // this.mapLeaflet = new L.Map('mapLeaflet', {center: opt.center, zoom: opt.zoom});
            this.objectManagerMunobrs = new ymaps.ObjectManager();
            this.objectManagerObjects = new ymaps.ObjectManager();

            /*this.myIconContentLayout = ymaps.templateLayoutFactory.createClass(
                '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
            )*/

            /* this.myPolygonTextLayouts = {
                 label: '<div>{{properties.hintContent}}</div>',
                 hint: ymaps.templateLayoutFactory.createClass('<div>{{properties.hintContent}}</div>')
             };*/

            if (!this.tooltip) {
                this.tooltip = Ext.create('Ext.tip.ToolTip', {
                    //target: this.getId(),
                    trackMouse: true,
                    renderTo: document.body,
                    autoHide: true,
                    autoShow: false,
                    // mouseOffset: [10, 0],
                    mouseOffset: [10, -30],
                    html: 'текст подсказки'
                    // title: 'Заголовок'
                });
                this.tooltip.setHidden(true);
            }

            // this.objectManagerObjects.options.set('geoObjectOpenBalloonOnClick', false);
            //var panoramasItemMode = new ymaps.control.TypeSelector({options: {panoramasItemMode: "off"}});
            //this.map.controls.add(panoramasItemMode);
            this.setYandexEvents();
            this.setObjectManagerMunobrsEvents();
            this.setObjectManagerObjectsEvents();
        }

        return this.map;
    },

    initYandex: function () {
        var me = this;
        var ymap = window.ymaps;
        if (ymap === null) {
            this.update('Библиотека yandex.map не загружена');
        } else {
            ymaps.ready(['polylabel.create']).then(this.getYandexMap());
        }
    },

    setYandexEvents: function () {
        if (this.map) {
            var me = this;
            this.map.events.add('click', function (e) {
                me.selectedPoint = e.get('coords');
                // console.log(me.selectedPoint);
            });
        }
    },

    showToolTipOnObject: function (coor, object, show) {
        if (this.selectedPolyline) {
            var closest = this.selectedPolyline.geometry.getClosest(coor);
            var coordCloset = this.selectedPolyline.geometry.getCoordinates()[closest.closestPointIndex];
            var dist = 0;
            if (closest.nextPointIndex && closest.prevPointIndex) {
                if (closest.nextPointIndex == closest.closestPointIndex) {
                    dist = coordCloset[2] - parseFloat(((closest.distance) / 1000).toFixed(3));
                }
                if (closest.prevPointIndex == closest.closestPointIndex) {
                    dist = coordCloset[2] + parseFloat(((closest.distance) / 1000).toFixed(3));
                }
            } else {
                dist = coordCloset[2]
            }

            if (this.tooltip && show) {
                var t = parseInt(dist) + ' км ' + parseInt((dist - parseInt(dist)) * 1000) + ' м ';
                var htm = '<h2>' + object.properties.hintContent + '</h2>';
                htm = htm + '<p><strong>' + t + '</strong></p>';

                this.tooltip.setHtml(htm);
                this.tooltip.setTarget(this.getId());
                this.tooltip.show();
            } else {
                return dist;
            }
        }
    },

    setObjectManagerMunobrsEvents: function () {
        if (this.map) {
            var me = this;

            this.objectManagerMunobrs.objects.events
                .add('click', function (e) {
                    var objectId = e.get('objectId'),
                        object = me.objectManagerMunobrs.objects.getById(objectId);
                    if (!object.options.object_mouse_click) {
                        me.objectManagerMunobrs.objects.each(function (object) {
                            me.objectManagerMunobrs.objects.setObjectOptions(object.id, {
                                object_mouse_click: false,
                                opacity: 0.5
                            });
                        });
                        me.selectedMunobr = object;  //отмечу выбранную дорогу на карте
                    } else {
                        me.selectedMunobr = null;
                    }
                    me.objectManagerMunobrs.objects.setObjectOptions(objectId, {
                        object_mouse_click: !object.options.object_mouse_click,
                        opacity: 0.8
                    });
                })
                .add('mouseenter', function (e) {
                    var objectId = e.get('objectId'),
                        object = me.objectManagerMunobrs.objects.getById(objectId);
                    me.objectManagerMunobrs.objects.setObjectOptions(objectId, {
                        opacity: 0.8
                    });
                })
                .add('mouseleave', function (e) {
                    me.objectManagerMunobrs.objects.each(function (object) {
                        if (!object.options.object_mouse_click) {
                            me.objectManagerMunobrs.objects.setObjectOptions(object.id, {
                                object_mouse_click: false,
                                opacity: 0.5
                            });
                        }
                    });
                })
                .add('contextmenu', function (e) {
                    var objectId = e.get('objectId'),
                        object = me.objectManagerMunobrs.objects.getById(objectId);
                    if (!object) return;
                    var menu_grid = new Ext.menu.Menu({
                        items:
                            [
                                {
                                    text: 'Контекстное меню района',
                                    handler: function () {
                                        alert(object.properties.name);
                                    }
                                }
                            ]
                    });
                    var position = e.get('domEvent').get('position');
                    menu_grid.showAt(position);
                });
        }
    },

    setObjectManagerObjectsEvents: function () {
        if (this.map) {
            var me = this;

            this.objectManagerObjects.objects.events
                .add('click', function (e) {
                    var objectId = e.get('objectId'),
                        object = me.objectManagerObjects.objects.getById(objectId);
                    //console.log('ID объекта: ' + objectId);
                    //console.log('Тип объекта: ' + object.geometry.type);
                    //console.log('Координаты объекта: ' + object.geometry.coordinates);
                    // для коллекций
                    //e.get('target').properties.set('object_mouse_click', !e.get('target').properties.get('object_mouse_click'));
                    //e.get('target').options.set('strokeWidth', 8);
                    if (!object.options.object_mouse_click) {
                        me.objectManagerObjects.objects.each(function (object) {
                            me.objectManagerObjects.objects.setObjectOptions(object.id, {
                                object_mouse_click: false,
                                strokeWidth: object.options.object_strokeWidth,
                                strokeOpacity: 0.5
                                //strokeColor: '#' + (function lol(m, s, c) {return s[m.floor(m.random() * s.length)] + (c && lol(m, s, c - 1));})(Math, '0123456789ABCDEF', 4)
                            });
                        });

                        //если дорога выбрана, то построю полилинию
                        me.selectedPolyline = new ymaps.Polyline(object.geometry.coordinates, {id: object.id}, {});
                        me.selectedPolyline.options.setParent(me.map.options);
                        me.selectedPolyline.geometry.setMap(me.map);
                        //будет использоваться для определения километровой привязки

                        object = new ymaps.GeoObject(object);
                        object.geometry.setMap(me.map);
                        me.map.setBounds(object.geometry.getBounds());
                        me.selectedObject = object;

                    } else {
                        me.selectedPolyline = null;
                        me.selectedObject = null;
                    }
                    me.objectManagerObjects.objects.setObjectOptions(objectId, {
                        object_mouse_click: !object.options.object_mouse_click,
                        strokeWidth: 10,
                        strokeOpacity: 0
                        //strokeColor: '#1c1c1c'
                    });
                })
                .add('mousemove', function (e) {
                    var objectId = e.get('objectId'),
                        object = me.objectManagerObjects.objects.getById(objectId);
                    if (object.options.object_mouse_click) //если дорога активирована щелчком мыши, то выведу Подсказку с дистанцией
                        me.showToolTipOnObject(e.get('coords'), object, true);
                })
                .add('mouseenter', function (e) {
                    var objectId = e.get('objectId'),
                        object = me.objectManagerObjects.objects.getById(objectId);
                    me.objectManagerObjects.objects.setObjectOptions(objectId, {
                        strokeWidth: 10,
                        strokeOpacity: 0
                    });
                })
                .add('mouseleave', function (e) {
                    me.objectManagerObjects.objects.each(function (object) {
                        if (!object.options.object_mouse_click) {
                            me.objectManagerObjects.objects.setObjectOptions(object.id, {
                                object_mouse_click: false,
                                strokeWidth: object.options.object_strokeWidth,
                                strokeOpacity: 0.6
                            });
                        }
                        //уберу подсказку с экрана
                        me.tooltip.setTarget(null);
                        me.tooltip.setHtml('');
                        me.tooltip.hide();
                    });
                })
                .add('contextmenu', function (e) {
                    var objectId = e.get('objectId'),
                        object = me.objectManagerObjects.objects.getById(objectId),
                        //grid = Ext.getCmp('layergrid');
                        layerpanel = Ext.getCmp('layerpanel'),
                        grid = layerpanel.getActiveTab();

                    grid = (grid.layerID && grid.alias == "widget.layergrid") ? grid : null;

                    if (!object) return;
                    var km_beg = me.showToolTipOnObject(e.get('coords'), object, false),
                        dist = parseInt(km_beg) + 'км ' + parseInt((km_beg - parseInt(km_beg)) * 1000) + 'м',
                        contextItems = [];
                    contextItems.push({
                        text: 'Документы объекта содержания',
                        iconCls: 'fa fa-paperclip',
                        handler: function () {
                            var cdef = roadInfo.app.getController('default');
                            if (cdef) {
                                cdef.onShowAttachListFiles(objectId);
                            }
                        }
                    });
                    if (km_beg) {
                        contextItems.push({
                            text: 'Использовать привязку [' + dist + ']',
                            iconCls: 'fa fa-arrows',
                            disabled: !grid, //если грид ведомости есть, то кнопка доступна
                            handler: function () {
                                if (grid) {
                                    var store = grid.getStore();
                                    if (store && store.isLoaded()) {
                                        var selr = grid.getSelectionModel().getSelection()[0];
                                        if (!selr) return;
                                        var pl = grid.getPlugin('RowEditingPlugin');
                                        if (!pl) return;
                                        if (!pl.editing) pl.startEdit(selr); //если запись не в режиме редактирвоания, то включю редактирование
                                        if ("km_beg" in selr.data) {
                                            selr.set("km_beg", km_beg);
                                            var ed_km_beg = pl.editor.down('bindingfield[name=km_beg]');
                                            if (ed_km_beg) ed_km_beg.setValue(km_beg);
                                        }
                                        if ("object_id" in selr.data) {
                                            selr.set("object_id", objectId);
                                            var ed_object_id = pl.editor.down('textfield[name=object_id]');
                                            if (ed_object_id) ed_object_id.setValue(objectId);
                                        }
                                    }
                                }

                            }
                        })
                    }
                    var menu_grid = new Ext.menu.Menu({items: contextItems});
                    var position = e.get('domEvent').get('position');
                    menu_grid.showAt(position);
                });
        }
    },

    //вернет список ИД муниципалитетов, отмеченных в комбобоксе и на карте
    getMunobrsID: function () {
        var ids = [];
        if (this.munobs.length > 0) {
            Ext.each(this.munobs, function (item) {
                ids.push(item.id);
            });
        }
        return ids;
    },

    getObjectsIDFromMunobrs: function(){
        var ids = [];
        if (this.munobs.length > 0) {
            Ext.each(this.munobs, function (item) {
                //ids.push(item.id);
                ids = ids.concat(item.objects_ids);
            });
        }
        return ids;
    },

    //вернет список ИД дорог, отмеченных в комбобоксе и на карте
    getObjectsID: function () {
        var ids = [];
        if (this.objects.length > 0) {
            Ext.each(this.objects, function (item) {
                ids.push(item.id);
            });
        }
        return ids;
    },

    //вернет дорогу, выбранную пользователем на карте
    getUserSelectObject: function () {
        return this.selectedObject;
    },

    //вернет точку, выбранную пользователем на карте
    getUserSelectPoint: function () {
        return this.selectedPoint;
    },

    //вернет район, выбранный пользователем на карте
    getUserSelectMunobr: function () {
        return this.selectedMunobr;
    },

    //создаю объект дороги для Yandex !!
    createObjectRoad: function (item, countObjects) {
        if (item) {
            var yand = null;
            if (item.yandex_properties) {
                yand = Ext.decode(item.yandex_properties);

                var color = yand.color;
                var strokeWidth = yand.strokeWidth;
                // if (this.selectedObjectID.length == 1){
                //color =  //для одной дороги Черный
                //  }

                if (countObjects > 1) { //для разных дорог Случайным образом
                    // color = "#"+((1<<24)*Math.random()|0).toString(16);
                    // color = '#080138';
                    // color = '#'+Math.floor(Math.random()*16777215).toString(16);
                    // color = getRandomColor('#463e7f', '#080138');
                    color = '#' + (function lol(m, s, c) {
                        return s[m.floor(m.random() * s.length)] + (c && lol(m, s, c - 1));
                    })(Math, '0123456789ABCDEF', 4);
                }

            }
            var obj = {
                type: 'Feature',
                id: item.id,
                geometry: {
                    type: 'LineString',
                    coordinates: yand.points_route_all
                },
                properties: {
                    id: item.id,
                    hintContent: yand.name + ', км ' + yand.km_beg + ' - ' + yand.km_end,
                    // balloonContent: yand.name,
                    // object_id: item.id,
                    // object_points: yand.points_route_all,
                    object_km_beg: yand.km_beg,
                    object_km_end: yand.km_end
                },
                options: {
                    // balloonCloseButton: true,
                    strokeColor: color,
                    strokeWidth: strokeWidth,
                    object_strokeWidth: strokeWidth,
                    strokeOpacity: 0.6,
                    object_mouse_click: false
                }
            };
            return obj;
        } else return null;
    },

    //geoJson муниципального образования преобразую в объект и модифицирую, меняю ИД, цвет, название
    updateJsonMunobr: function (item) {
        if (item.geo_object) {
            var obj = Ext.decode(item.geo_object);
            obj.id = item.id;
            /*  var coord = obj.geometry.coordinates[0];
              var new_coord = [];
              Ext.each(coord, function (item) { //Переверну координаты
                  new_coord.push([item[1], item[0]]);
              });
              if (new_coord.length !== coord.length) alert('ошибка преобразования координат');
              obj.geometry.coordinates[0] = new_coord;*/
            obj.geometry.coordinates[0] = obj.geometry.coordinates[0].map(function (it) {
                return [it[1], it[0]];
            });
            obj.properties.name = item.name;
            obj.properties.description = item.name;
            // obj.properties.hintContent = item.data.name;

            //  obj.properties.balloonContent = item.data.name;
            //if (obj.properties.iconCaption) {
            obj.options = {
                //preset: "islands#greenDotIconWithCaption",
                fillColor: item.color,
                strokeColor: item.color,
                interactivityModel: 'default#transparent',
                strokeWidth: 3,
                opacity: 0.5,
                object_mouse_click: false,
                labelDefaults: 'light',
                labelLayout: '{{properties.name}}'
            }
            return obj;
        } else return null;
    },

    showMunobr: function () {
        //   this.map.geoObjects.remove(this.objectManagerMunobrs); //удалю раннее показанные районы
        //    this.objectManagerMunobrs.removeAll();

        if (this.munobs.length > 0) {
            var munobrs_col = {
                    type: 'FeatureCollection',
                    metadata: {
                        name: 'Муниципальные образования',
                        description: 'Выбранные пользователем муниципальные образования Краснодарского края'
                    },
                    features: []
                },
                me = this;
            Ext.each(this.munobs, function (item) {
                if (item.geo_object) {
                    item.geo_object = me.updateJsonMunobr(item);
                    munobrs_col.features.push(item.geo_object)
                }
            });

            this.objectManagerMunobrs.add(munobrs_col);
            this.map.geoObjects.add(this.objectManagerMunobrs); //покажу новые районы на карте
            const polylabel = new ymaps.polylabel.create(this.map, this.objectManagerMunobrs);
            this.map.setBounds(this.objectManagerMunobrs.getBounds());
            this.showMainButton();
        }
    },

    showMainButton: function () {
        Ext.getCmp('showOnMap').setDisabled(false);
        Ext.getCmp('searchkm').setDisabled(false);
    },

    showObjects: function () {
        //   this.map.geoObjects.remove(this.objectManagerObjects); //удалю раннее показанные районы
        //   this.objectManagerObjects.removeAll();

        var storeObjectsYandex = Ext.StoreManager.lookup('RefObjectsYandex'),
            me = this;
        storeObjectsYandex.clearData();
        storeObjectsYandex.removeAll();
        storeObjectsYandex.load(
            {
                params: {
                    objects_id: Ext.encode(me.getObjectsID())
                },
                callback: function (records, operation, success) {
                    me.clearObject();
                    Ext.Array.each(records, function (rec) {
                        var r = me.createObjectRoad(rec.data, records.length);
                        if (r) me.addObject(r);
                    });

                    if (me.objects.length > 0) {
                        var objects_col = {
                            type: 'FeatureCollection',
                            metadata: {
                                name: 'Объекты содержания',
                                description: 'Выбранные пользователем объекты содержания Краснодарского края'
                            },
                            features: []
                        }
                        Ext.each(me.objects, function (item) {
                            objects_col.features.push(item)
                        });
                        me.objectManagerObjects.add(objects_col);
                        me.map.geoObjects.add(me.objectManagerObjects); //покажу новые районы на карте
                        me.map.setBounds(me.objectManagerObjects.getBounds());
                        me.showMainButton();
                    }
                }
            }
        );
    },

    clearYandexMap: function () {
        this.map.geoObjects.remove(this.objectManagerMunobrs);
        this.objectManagerMunobrs.removeAll();

        this.map.geoObjects.remove(this.objectManagerObjects);
        this.objectManagerObjects.removeAll();

        this.clearSearch();
    },

    showMunobrs_OR_Objects: function () {
        this.clearYandexMap(); //очищу с карты дороги и районы
        if (this.objects.length > 0) { //если выбраны дороги, то покажу дороги
            this.showObjects();
            return;
        }
        if (this.munobs.length > 0) { //если выбраны районы, то покажу районы
            this.showMunobr();
            return;
        }
    },

    checkShowOnMap: function (layerModeOneObject) {
        var cdef = roadInfo.app.getController('default'),
            modeSelected = cdef.getSelectedMode();

        if (layerModeOneObject == 1) { //если для ведомости ограничение в один объект
            if (modeSelected.objects_id.length != 1) {  //если выбрано больше одной дороги
                return false;
            } else if (!this.objectManagerObjects.objects.getById(modeSelected.objects_id[0])) { //если среди показанных дорог на карте, нет выюбранной дороги
                return false
            } else return true;
        } else {
            if (modeSelected.objectsSelectedID.length == 0) {  //если не выбраны дороги
                return false;
            } else {
                for (var i = 0; i < modeSelected.objectsSelectedID.length; i++) { //переберу все выбранные дороги
                    if (!this.objectManagerObjects.objects.getById(modeSelected.objectsSelectedID[i]))  // если ее нет среди показанных дорог, то ошибка
                        return false;
                }
                return true;
            }
        }
    },

    showSearchKm: function ($objectId, $points, $geometrytype, $content) {
        if (this.collectionSearch) {
            this.collectionSearch.removeAll();
            this.collectionSearch = null;
        }
        if (!$points || $points.length == 0) {
            return;
        }

        if ($geometrytype === "Point") {
            searchKm = new ymaps.GeoObject(
                {
                    geometry: {type: "Point", coordinates: $points},
                    properties: {
                        iconCaption: '',
                        hintContent: $content,
                        balloonContent: $content
                    }
                },
                {
                    iconLayout: 'default#image',
                    // iconLayout: 'default#imageWithContent',
                    iconImageHref: 'resources/map_point32.png',
                    iconImageSize: [32, 32],
                    iconImageOffset: [0, 0],
                    draggable: false
                    //iconContentLayout: this.myIconContentLayout
                }
            );

        } else {
            searchKm = new ymaps.GeoObject({
                // Описываем геометрию типа "Ломаная линия".
                geometry: {type: "LineString", coordinates: $points},
                properties: {
                    hintContent: $content,
                    balloonContent: $content
                }
            }, {
                geodesic: true,
                strokeStyle: 'shortdash',
                strokeWidth: 13,
                strokeColor: '#bc0f46'
            });
            searchKm.options.setParent(this.map.options);
            searchKm.geometry.setMap(this.map);

            /* this.map.setZoom(15); //принудительно увеличу масштаб карты, т.к. чем ближе объект на карте, тем ближе будет смещение от объекта, т.к. все измеряется в пикселях
             var me = this;
             var pixelpoints = searchKm.geometry.getPixelGeometry().getCoordinates();
             var pixeloffset = PolylineOffset.offsetPoints(pixelpoints.map(function (point) {
                 return {x: point[0], y: point[1]};
             }),-10).map(function (xy) {
                 return [xy.x, xy.y];
             }); //-10 слева //+10 справа
             var coordoffset = pixeloffset.map(function (point) {
                 return me.map.options.get('projection').fromGlobalPixels(point, me.map.getZoom());
             })
             searchKm2 = new ymaps.Polyline(newCoords, {}, {});
             searchKm2.options.setParent(this.map.options);
             searchKm2.geometry.setMap(this.map);*/

        }

        this.collectionSearch = new ymaps.GeoObjectCollection();
        this.collectionSearch.add(searchKm);
        this.map.geoObjects.add(this.collectionSearch);

        // searchKm.balloon.open();
        // this.map.setBounds(this.collectionSearch.getBounds());

        this.setObjectZoom($objectId);
        if (this.collectionSearch.getLength() > 0) this.collectionSearch.get(0).balloon.open();
    }
});



