Ext.define('overrides.grid.RowEditor', {
    override: 'Ext.grid.RowEditor',
    saveBtnText: 'Сохранить',
    cancelBtnText: 'Отмена',
    afterRender: function () {
        var me = this,
            plugin = me.editingPlugin,
            grid = plugin.grid;
        //the FIX
        me.scroller = grid.view.getScrollable();
        me.callSuper(arguments);
        // The scrollingViewEl is the TableView which scrolls
        me.scrollingView = grid.lockable ? grid.normalGrid.view : grid.view;
        me.scrollingViewEl = me.scrollingView.el;
        me.scroller.on('scroll', me.onViewScroll, me);
        // Prevent from bubbling click events to the grid view
        me.mon(me.el, {
            click: Ext.emptyFn,
            stopPropagation: true
        });
        // Ensure that the editor width always matches the total header width
        me.mon(grid, 'resize', me.onGridResize, me);
        if (me.lockable) {
            grid.lockedGrid.view.on('resize', 'onGridResize', me);
        }
        me.el.swallowEvent([
            'keypress',
            'keydown'
        ]);
        me.initKeyNav();
        me.mon(plugin.view, {
            beforerefresh: me.onBeforeViewRefresh,
            refresh: me.onViewRefresh,
            itemremove: me.onViewItemRemove,
            scope: me
        });
        me.syncAllFieldWidths();
        if (me.floatingButtons) {
            me.body.dom.setAttribute('aria-owns', me.floatingButtons.id);
        }
    }
});