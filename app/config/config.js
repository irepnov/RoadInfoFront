Ext.define("roadInfo.config.config", {
    singleton: true,
  //  defaultIcon: "layers/layer.png",

    yandex: {
        optionPanorama: {
            point: [45.1505384, 39.0593922]
        },
        optionMap: {
            center: [45.1505384, 39.0593922],
            zoom: 9,
            controls: ['typeSelector', 'zoomControl']
        }
    },

    path: {
        icons_layers: "resources/layers/icons/",
        layer_attachments: "uploads/layer_attachments/"
    }

    // selectMain: {
    //     munobrs: [],
    //     objects: []
    // }

  /*  MapToolbar: [{
        xtype: "textfield",
        name: "searchfield",
        id: "searchfield",
        emptyText: "Поиск",
        width: "30%",
        margin: "0 8",
        triggers: {
            clearbutton: {
                cls: "clearbutton",
                handler: function() {
                    this.reset()
                }
            },
            search: {
                cls: "mapshow",
                handler: function() {
                    //LT.app.getController("Search").startSearch()
                }
            }
        }
    }, {
        textTip: "Поиск по Км",
        action: "find-segment",
        iconCls: "kmsearch",
        enableToggle: true,
        weight: 0,
        listeners: {
            click: 'onClickk'
        }
    }, "-", {
        textTip: "Настройки",
        action: "settings",
        iconCls: "settings",
        enableToggle: true,
        weight: 50
    }]*/

   /* allow: {
        timeline: true,
        linearGraph: false,
        passportXLSXExport: false
    },
    main: {
        initLat: 45.61404,
        initLng: 39.29535
    },
    settings: {
        main: {
            yearsdeep: 0
        },
        face: {
            hide_unset_attr: true,
            show_debug_info: false,
            use_buffer: false
        }
    },
    */
});