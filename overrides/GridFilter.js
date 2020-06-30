Ext.define("Ext.locale.de.grid.filters.Filters", {
    override: "Ext.grid.filters.Filters",
    menuFilterText: "Фильтр"
});

Ext.define("Ext.locale.de.grid.filters.filter.String",{
    override: "Ext.grid.filters.filter.String",
    emptyText: "Нет данных"
});

Ext.define("Ext.locale.de.grid.filters.filter.Date", {
    override: "Ext.grid.filters.filter.Date",
    config: {
        fields: {
            lt: {
                text: 'До'
            },
            gt: {
                text: 'После'
            },
            eq: {
                text: 'Равна'
            }
        },
        // Defaults to Ext.Date.defaultFormat
        dateFormat: null
    }
});

Ext.define("Ext.locale.de.grid.filters.filter.Number", {
    override: "Ext.grid.filters.filter.Number",
    emptyText: "Введите число..."
});

Ext.define("Ext.locale.de.grid.filters.filter.List", {
    override: "Ext.grid.filters.filter.List",
    loadingText: "Загрузка..."
});

Ext.define("Ext.locale.de.grid.filters.filter.Boolean", {
    override: "Ext.grid.filters.filter.Boolean",
    yesText: "Да",
    noText: "Нет"
});

/*
Ext.define("Ext.locale.de.LoadMask", {
    override: "Ext.LoadMask",
    msg: "Lade Daten�"
});

Ext.define("Ext.locale.de.grid.RowEditor", {
    override: "Ext.grid.RowEditor",
    saveBtnText: 'Ok',
    cancelBtnText: 'Abbrechen',
    errorsText: 'Fehler',
    dirtyText: 'Sie m�ssen Ihre �nderungen �bernehmen oder abbrechen'
});

Ext.define("Ext.locale.de.grid.locking.Lockable", {
    override: "Ext.grid.locking.Lockable",
    lockText: "Spalte sperren",
    unlockText: "Spalte freigeben (entsperren)"
});

Ext.define("Ext.locale.de.LoadMask", {
    override: "Ext.LoadMask",
    msg: "Lade Daten..."
});
*/