Ext.define('roadInfo.component.BindingVType', {
    override: 'Ext.form.field.VTypes',
    vbinding: function(value) {
        var decimalRegex = /^\d{1,3}(\.\d+)?$/;
        var decimalTest = decimalRegex.test(value);

        var coordRegex = /^\d{1,2}(\.\d+)\,\d{1,2}(\.\d+)?$/;
        var coordTest = coordRegex.test(value);

        return (decimalTest || coordTest);
    },
    vbindingText: "Введеное значение не соответствует формату географических координат или линейной привязке " +
        "</br> Образец координат: <b>44.722122,38.988094</b> (широта, долгота)" +
        "</br> Образец линейной привязки: <b>2.655</b> (километр)"
});
