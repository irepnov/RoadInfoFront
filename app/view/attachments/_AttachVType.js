Ext.define('roadInfo.view.attachments.AttachVType', {
    override: 'Ext.form.field.VTypes',
    mime: function(value) {
        var phoneRegex = /^.*\.(zip|ZIP)$/;
        return (phoneRegex.test(value));
    },
    mimeText: 'Допустимы только ZIP архивы '
});
