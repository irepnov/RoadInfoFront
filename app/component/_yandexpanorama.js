Ext.define("roadInfo.component.yandexpanorama", {
    extend: Ext.window.Window,
    alias: "widget.yandexpanorama",
    title: "Панорама",
    id: "panoramawindow",
    layout: "fit",
    width: 1000,
    height: 500,
    maximizable: true,
    collapsible: false,
    border: 0,
    iconAlign: "left",
    defaults: {
        border: 1
    },
    config: {
        optionPanorama: {
            point: [45.1505384, 39.0593922]
        }
    },
    initComponent: function() {
        this.on(
            {
              //  beforerender: this.checkPanorama,
                afterrender: this.initPanorama
            });
       /* this.buttons = [{
            text: "Сохранить изменения",
            tooltip: "Сохранить изменения",
            disabled: true,
            action: "save",
            iconCls: "tick"
        }];*/
        this.callParent();
    },

    initPanorama: function () {
       // console.log('init panorama');
        var ymap = window.ymaps;
        if (ymap === null) {
            this.update('Библиотека yandex.map не загружена');
        } else if (!ymaps.panorama.isSupported()) {
            this.update('Панорама не поддерживается');
        } else {
            Ext.get(this.getId() + '-body').addCls('player');
            this.getPanorama();
        }
    },

    getPanorama: function () {
        var me = this;
        ymaps.panorama.locate(this.optionPanorama.point).done(
            function (panoramas) {
                if (panoramas.length > 0) {
                    var player = new ymaps.panorama.Player(
                        me.getId() + '-body',
                        panoramas[0],
                        //{ direction: [256, 16] }
                        { direction: 'auto', controls: ['zoomControl']  }
                    );
                }else{
                    me.update('Панорама не найдена')
                }
            },
            function (error) {
                alert(error.message);
            }
        );
    }

});