Ext.define("Ext.locale.ux.form.ItemSelector", {
    override: "Ext.ux.form.ItemSelector",
    buttons: [/*'top', 'up', */'add', 'remove'/*, 'down', 'bottom'*/],
    buttonsText: {
       // top: "Переместить в начало",
       // up: "Переместить вверх",
        add: "Добавить",
        remove: "Убрать"
       // down: "Переместить вниз",
       // bottom: "Переместить в конец"
    }
});

Ext.define("Ext.over.grid.feature.Grouping", {
    override: "Ext.grid.feature.Grouping",
    groupByText: 'Группировать по этому полю',
    showGroupsText: 'Показывать в группе',
    expandTip: 'Нажмите, чтобы развернуть. Клавиша CTRL сворачивает все остальные',
    collapseTip: 'Нажмите, чтобы свернуть. CTRL/клик сворачивает все остальные'
});

Ext.define('Ext.over.panel.Panel', {
    override: 'Ext.panel.Panel',
    closeToolText: 'Закрыть панель',
    collapseToolText: 'Свернуть панель',
    expandToolText: 'Развернуть панель'
});

Ext.define("Ext.over.LoadMask", {
    override: "Ext.LoadMask",
    msg: "Загрузка..."
});

Ext.define("Ext.over.grid.locking.Lockable", {
    override: "Ext.grid.locking.Lockable",
    lockText: "Заброкирован",
    unlockText: "Разблокирован"
});