Ext.define('roadInfo.component.MyGridField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.mygridfield',

    layout: 'fit',

    initComponent: function()
    {
        this.callParent(arguments);

        this.valueGrid = Ext.widget({
            xtype: 'grid',
            store: Ext.create('Ext.data.JsonStore', {
                fields: ['name', 'value'],
                data: this.value
            }),
            columns: [
                {
                    text: 'Name',
                    dataIndex: 'name',
                    flex: 3
                },
                {
                    text: 'Value',
                    dataIndex: 'value',
                    flex: 1
                }
            ]
        });

        this.add(this.valueGrid);
    },

    setValue: function(value)
    {
        this.valueGrid.getStore().loadData(value);
    },

    getValue: function()
    {
        // left as an exercise for the reader :P
    }
});