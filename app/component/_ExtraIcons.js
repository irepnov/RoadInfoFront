//https://ahlearns.wordpress.com/2012/05/22/ext-js-4-plugin-to-add-icons-to-a-panel-header/

Ext.define('roadInfo.component.ExtraIcons', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.headericons',
    alternateClassName: 'Ext.ux.PanelHeaderExtraIcons',
    iconCls: '',
    index: undefined,
    headerButtons: [],
    init: function(panel) {
        this.panel = panel;
        this.callParent();
        panel.on('render', this.onAddIcons, this, {single: true});
    },

    onAddIcons :function () {
        if (this.panel.getHeader) {
            this.header = this.panel.getHeader();
        } else if (this.panel.getOwnerHeaderCt) {
            this.header = this.panel.getOwnerHeaderCt();
        }
        this.header.insert(this.index || this.header.items.length, this.headerButtons);
    }
});