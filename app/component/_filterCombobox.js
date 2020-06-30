
//filter: {type: 'combobox', store: 'RefMunobrs', idField: 'id', labelField: 'name', itemDefaults: {emptyText: 'содержит значение...'}}


Ext.define('roadInfo.component.filterCombobox', {
    extend: 'Ext.grid.filters.filter.SingleFilter',
    alias: 'grid.filter.combobox',

    type: 'combobox',

    operator: '==',

    //<locale>
    /**
     * @cfg {String} emptyText
     * The empty text to show for each field.
     */
    emptyText: 'Select item...',
    //</locale>

    itemDefaults: {
        xtype: 'combobox',
        //enableKeyEvents: true,
        hideEmptyLabel: false,
        iconCls: Ext.baseCSSPrefix + 'grid-filters-find',
        labelSeparator: '',
        labelWidth: 29,
        margin: 0,
        forceSelection: true
    },

    /**
     * @cfg {String} [idField="id"]
     * The field name for the `id` of records in this list's `{@link #cfg-store}`. These values are
     * used to populate the filter for the grid's store.
     */
    idField: 'id',

    /**
     * @cfg {String} [labelField="text"]
     * The field name for the menu item text in the records in this list's `{@link #cfg-store}`.
     */
    labelField: 'text',

    /**
     * @cfg {String} store
     * The name of the store to use
     */
    store: null,

    constructor: function (config) {
        var me = this;

        me.callParent([config]);

        me.store = Ext.StoreManager.lookup(me.store);
    },

    activateMenu: function () {
        this.inputItem.setValue(this.filter.getValue());
    },

    /**
     * @private
     * Creates the Menu for this filter.
     * @return {Ext.menu.Menu}
     */
    createMenu: function() {
        var me = this,
            config;

        me.callParent();

        config = Ext.apply({}, me.getItemDefaults());
        if (config.iconCls && !('labelClsExtra' in config)) {
            config.labelClsExtra = Ext.baseCSSPrefix + 'grid-filters-icon ' + config.iconCls;
        }
        delete config.iconCls;
        config.emptyText = config.emptyText || me.emptyText;
        Ext.apply(config, {
            displayField: me.labelField,
            valueField: me.idField,
            store: Ext.StoreMgr.lookup(me.store)
        });
        me.inputItem = me.menu.add(config);

        me.inputItem.on({
            scope: me,
            select: function(combo) {
                me.setValue(combo.getValue());
            }
        });
    },

    /**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter.
     */
    setValue: function (value) {
        var me = this;

        if (me.inputItem) {
            me.inputItem.setValue(value);
        }

        me.filter.setValue(value);

        if (value && me.active) {
            me.value = value;
            me.updateStoreFilter();
        } else {
            me.setActive(!!value);
        }
    },

    createFilter: function(config, key) {
        var me = this;

        if (me.filterFn) {
            return new Ext.util.Filter({
                filterFn: function(rec) {
                    return Ext.callback(me.filterFn, me.scope, [rec, me.inputItem.getValue()]);
                }
            });
        } else {
            return me.callParent([config, key]);
        }
    }
});