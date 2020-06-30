// http://devjs.eu/en/multiple-validation-multi-vtype-for-textfield-in-ext-js-4/

Ext.define('roadInfo.component.bindingfield', {
    extend: 'Ext.form.field.Text',

    alias: 'widget.bindingfield2',

    triggers: {
        clear: {
            weight: 0,
            cls: Ext.baseCSSPrefix + 'fa fa-eraser',
            hidden: true,
            handler: 'onClearClick',
            scope: 'this'
        },
        search: {
            weight: 1,
            cls: Ext.baseCSSPrefix + 'fa fa-map-marker',
            handler: 'onBinding',
            scope: 'this'
        }
    },

    initComponent: function() {
        var me = this,
            object_id = me.object_id;

        me.coord = me.coord || '';

        if (me.value || me.value == 0){
            me.value = me.value
        } else me.value = '';

        me.callParent(arguments);
        me.on('specialkey', function(f, e){
            if (e.getKey() == e.ENTER) {
                me.onBinding();
            }
        });
    },

    onClearClick: function(){
        var me = this;
        me.setValue('');
        me.setCoordinates('');
        me.getTrigger('clear').hide();
        me.updateLayout();
    },

    onBinding: function(){
        // 44.722122,38.988094 в формате: широта (latitude), долгота (longitude)
        //      ^\d{1,2}(\.\d+)\,\d{1,2}(\.\d+)?$
        //привязка
        //      ^\d{1,3}(\.\d+)?$
        var me = this,
            value = me.getValue().replace(/\s+/g, '').replace(/ю|б/g, '.'),
            object_id = me.object_id;

        var decimalRegex = /^\d{1,3}(\.\d+)?$/;
        var decimalTest = decimalRegex.test(value);

        var coordRegex = /^\d{1,2}(\.\d+)\,\d{1,2}(\.\d+)?$/;
        var coordTest = coordRegex.test(value);

        if (!object_id){
            me.setError("Не указан идентификатор объекта содержания");
            Ext.Msg.alert('Ошибка', "Не указан идентификатор объекта содержания");
            return;
        }

        if (!coordTest && !decimalTest){
           // me.setError("Введеное значение не соответствует формату географических координат или линейной привязке");
            Ext.Msg.alert('Ошибка', "Введеное значение не соответствует формату географических координат или линейной привязке " +
                "</br> Образец координат: <b>44.722122,38.988094</b> (широта, долгота)" +
                "</br> Образец линейной привязки: <b>2.655</b> (километр)");
            return;
        }

        // запрошу линейную привязку
        if (coordTest) {
            me.coord = "[" + value.split(',')[0] + "," + value.split(',')[1] + "]";
            //опредлелить формат введенного значения
            //если координаты, то аякс запрос координат и дороги
            //если число, то без запроса
            _url = '/distances/binding_point?' + "object_id=" + object_id + "&point=[" + value.split(',')[0] + "," + value.split(',')[1] + "]&api_key=8cf97f5a-d9b4-4533-b33c-ef46b21c9d72"
            Ext.Ajax.request({
                url: ProxyUrlBackRoutes + _url,
                method: 'GET',
                scope: this,
                async: false,
                withCredentials: true,
                cors: true,
                useDefaultXhrHeader: false,
                success: function (response, options) {
                    var jsonResp = Ext.util.JSON.decode(response.responseText);
                    me.setValue(jsonResp.binding);
                    jsonResp = null;
                },
                failure: function (response, options) {
                    var mes;
                    try {
                        var jsonResp = Ext.util.JSON.decode(response.responseText);
                        mes = jsonResp.message;
                        jsonResp = null;
                    } catch (e) {
                        mes = response.statusText;
                    }
                    me.setError("При поиске возникла ошибка:" + mes);
                    Ext.Msg.alert("Ошибка", "При поиске возникла ошибка: <br/>" + mes);
                    mes = null;
                }
            });
        }

        //запрошу координаты
        if (decimalTest) {
            //опредлелить формат введенного значения
            //если координаты, то аякс запрос координат и дороги
            //если число, то без запроса
            _url = '/distances/binding_km?' + "object_id=" + object_id + "&km=" + value + "&api_key=8cf97f5a-d9b4-4533-b33c-ef46b21c9d72"
            Ext.Ajax.request({
                url: ProxyUrlBackRoutes + _url,
                method: 'GET',
                scope: this,
                async: false,
                withCredentials: true,
                cors: true,
                useDefaultXhrHeader: false,
                success: function (response, options) {
                    var jsonResp = Ext.util.JSON.decode(response.responseText);
                    me.setCoordinates("[" + jsonResp.binding[0] + "," + jsonResp.binding[1] + "]");
                    jsonResp = null;
                },
                failure: function (response, options) {
                    var mes;
                    try {
                        var jsonResp = Ext.util.JSON.decode(response.responseText);
                        mes = jsonResp.message;
                        jsonResp = null;
                    } catch (e) {
                        mes = response.statusText;
                    }
                    me.setError("При поиске возникла ошибка:" + mes);
                    me.setCoordinates('');
                    Ext.Msg.alert("Ошибка", "При поиске возникла ошибка: <br/>" + mes);
                    mes = null;
                }
            });
        }

        me.getTrigger('clear').show();
        me.updateLayout();
    },

    getCoordinates: function () {
        //if (!this.coord){
        this.setError('');
        this.onBinding();
        //}
        return this.coord;
    },

    setCoordinates: function (value) {
        this.coord = value;
    },

    getObjectId: function () {
        return this.object_id;
    },

    setObjectId: function (value) {
        this.object_id = value;
    }
});