Ext.define('roadInfo.Application', {
    extend: 'Ext.app.Application',
    
    name: 'roadInfo',

    stores: [
        'RefMunobrs',
        'RefObjects',
        'RefLayersTreeForUser',
        'RefObjectsAll',
        'RefObjectsYandex',

//'RefTest',

        'RefDictsList',
        'RefLayerIconsList',
        'RefLayersAll',

        'RefAccessAuthUsers',
        'RefAccessMunobrs',
        'RefAccessRoles',
        'RefAccessUsers',
        'RefAccessLayersTreeAll',
        //'RefAccessWorkers',
       // 'RefLayerMeta'
        'RefAttachList',
        'RefAttachmentType',
        //'RefLayersDataLocal'

        'RefLayersObjects'



    ],
    
    launch: function () {
        // TODO - Launch the application
        //загружу  Хранилище дорог
        var cdef = roadInfo.app.getController('default');
        if (cdef) {
            cdef.onStartApp();
        }
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
