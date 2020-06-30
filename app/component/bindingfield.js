//http://www.coding-ideas.de/2018/03/20/integrating-ace-editor-to-extjs/

Ext.define('roadInfo.component.bindingfield', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.bindingfield',
    //override: 'Ext.form.field.Text',

    coord: '',
    object_id: '',
    allowBlankPoint: true, //если установить в false, то будут из километров запрашивиаться координаты, которые будут доступны через getPoint

    initComponent: function () {
        var me = this;
        me.callParent();
    },

    setAllowBlankPoint: function(value){
        this.allowBlankPoint = value;
    },
    getAllowBlankPoint: function(value){
        this.allowBlankPoint = value;
    },


    setPoint: function (value) {
        this.coord = value;
    },
    getPoint: function () {
        if (this.coord) {
            var coord_arr = this.coord.split(',');
            if (coord_arr.length == 2)
                return "[" + coord_arr[0] + "," + coord_arr[1] + "]";
        }
        return '';
    },
    onPointOrBinding: function (object_id) {
        var me = this,
            val = me.getValue(),
            val = val.replace(/\s+/g, '').replace(/ю|б/g, '.');

        me.object_id = object_id || me.object_id;
        if (!me.object_id) {
            me.markInvalid("Не указан объект содержания");
            return;
        }

        if (val) {
            me.setValue(val); //заменю отформатированным значением

            var pointRegex = /^\d{1,2}(\.\d+)\,\d{1,2}(\.\d+)?$/;
            var pointTest = pointRegex.test(val);
            var decimalRegex = /^\d{1,3}(\.\d+)?$/;
            var decimalTest = decimalRegex.test(val);

            if (!pointTest && !decimalTest) {
                me.markInvalid("Введеное значение не соответствует формату географических координат или линейной привязке");
                return;
            }

            if (!me.coord) {
                if (pointTest) {// введены координаты
                    me.onBindingPointToKM(val); //получу километр
                }
                if (decimalTest && !me.allowBlankPoint) { //введены километры и обязательно наличие координат
                    me.onBindingKMToPoint(val); //получу координаты
                }
            }

            return;
        }
    },
    onBindingPointToKM: function (point) {
        if (point) {
            var coord_arr = point.split(',');
            if (coord_arr.length == 2) {
                _point = "[" + coord_arr[0] + "," + coord_arr[1] + "]";
                _url = '/distances/binding_point?' + "object_id=" + this.getObjectId() + "&point=" + _point + "&api_key=8cf97f5a-d9b4-4533-b33c-ef46b21c9d72";
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
                        this.setValue(jsonResp.binding);
                        this.setPoint(_point.replace('[', '').replace(']', ''));
                        this.clearInvalid();
                    },
                    failure: function (response, options) {
                        var mes;
                        try {
                            var jsonResp = Ext.util.JSON.decode(response.responseText);
                            mes = jsonResp.message;
                        } catch (e) {
                            mes = response.statusText;
                        }
                        this.markInvalid("При поиске возникла ошибка: <br/>" + mes);
                    }
                });
            }
        }
    },
    onBindingKMToPoint: function (km) {
        if (km !== null && km !== undefined){
            _url = '/distances/binding_km?' + "object_id=" + this.getObjectId() + "&km=" + km + "&api_key=8cf97f5a-d9b4-4533-b33c-ef46b21c9d72"
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
                    this.setPoint(jsonResp.binding[0] + "," + jsonResp.binding[1]); //сохраню координаты полученной точки
                    this.clearInvalid();
                },
                failure: function (response, options) {
                    var mes;
                    try {
                        var jsonResp = Ext.util.JSON.decode(response.responseText);
                        mes = jsonResp.message;
                    } catch (e) {
                        mes = response.statusText;
                    }
                    this.markInvalid("При поиске возникла ошибка: <br/>" + mes);
                }
            });
        }
    },

    setObjectId: function (value) {
        this.object_id = value;
    },
    getObjectId: function () {
        return this.object_id;
    },

    onChange: function (newVal, oldVal) {
        this.coord = ''; //очищу координаты
        this.clearInvalid(); //уберу текст ошибки
    }
});

/*Ext.define('roadInfo.component.bindingobjectfield', {
    extend: 'Ext.form.FieldContainer',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    alias: 'widget.datetimefield',
    layout: 'hbox',
    width: 200,
    height: 22,
    combineErrors: true,
    msgTarget: 'side',
    submitFormat: 'c',

    dateCfg: null,
    timeCfg: null,

    initComponent: function () {
        var me = this;
        if (!me.dateCfg) me.dateCfg = {};
        if (!me.timeCfg) me.timeCfg = {};
        me.buildField();
        me.callParent();
        me.dateField = me.down('datefield')
        me.timeField = me.down('timefield')

        me.initField();
    },

    //@private
    buildField: function () {
        var me = this;
        me.items = [
            Ext.apply({
                xtype: 'datefield',
                submitValue: false,
                format: 'd.m.Y',
                width: 100,
                flex: 2
            }, me.dateCfg),
            Ext.apply({
                xtype: 'timefield',
                submitValue: false,
                format: 'H:i',
                width: 80,
                flex: 1
            }, me.timeCfg)]
    },

    getValue: function () {
        var me = this,
            value,
            date = me.dateField.getSubmitValue(),
            dateFormat = me.dateField.format,
            time = me.timeField.getSubmitValue(),
            timeFormat = me.timeField.format;
        if (date) {
            if (time) {
                value = Ext.Date.parse(date + ' ' + time, me.getFormat());
            } else {
                value = me.dateField.getValue();
            }
        }
        return value;
    },

    setValue: function (value) {
        var me = this;
        me.dateField.setValue(value);
        me.timeField.setValue(value);
    },

    getSubmitData: function () {
        var me = this,
            data = null;
        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            data = {},
                value = me.getValue(),
                data[me.getName()] = '' + value ? Ext.Date.format(value, me.submitFormat) : null;
        }
        return data;
    },

    getFormat: function () {
        var me = this;
        return (me.dateField.submitFormat || me.dateField.format) + " " + (me.timeField.submitFormat || me.timeField.format)
    }
});*/