// https://extjs.club/2018/07/19/add-tree-in-combobox/
// https://docs.sencha.com/extjs/6.5.2/classic/Ext.grid.feature.Grouping.html


Ext.define("roadInfo.view.layer_objects.LayerObjectsTable", {
    extend: Ext.window.Window,
    alias: "widget.layerobjectstable",
    title: "Сведения в разрезе объектов содержания",
    id: "layerobjectstable",
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    iconCls: "fa fa-table",
    width: 1000,
    height: 800,
    maximizable: true,
    collapsible: false,
    modal: true,
    border: false,
    bodyStyle: 'padding: 5px 5px;',
    iconAlign: "left",
    requires: ["roadInfo.component.GridExcel", 'roadInfo.component.myTreePicker', 'roadInfo.view.layer_objects.LayerObjectsTableController'],
    controller: 'layerobjectstablecontroller',
    defaults: {
        border: 1
    },
    initComponent: function () {
        this.items = [
            {
                xtype: 'mytreepicker',
                store: Ext.create('roadInfo.store.RefLayersTreeForUser'),
                fieldLabel: "Тип сведений:",
                rootVisible: false,
                valueField: 'id',
                displayField: 'text',
                canSelectFolders: false,
                reference: 'layers',
                listeners: {
                    select: 'onLayerSelect'
                }
            },
            {
                xtype: 'grid',
                reference: 'objectsgrid',
                autoScroll: true,
                tbar: [
                    {xtype: "tbfill"},
                    {
                        xtype: 'button',
                        text: 'Экспорт',
                        iconCls: "fa fa-file-excel-o",
                        listeners: {click: 'onExcel'}
                    }
                ],
                bbar: [
                    {xtype: "tbfill"},
                    {
                        xtype: 'button',
                        text: 'Применить фильтр',
                        iconCls: "fa fa-filter",
                        listeners: {click: 'onFilterCheck'}
                    }
                ],
                plugins: [
                    'excel'
                ],
                flex: 1,
                store: 'RefLayersObjects',
                bodyStyle: 'padding: 5px 5px;',
                selModel: {
                    selType: 'checkboxmodel'
                },
                //border: false,
                viewConfig: {
                    preserveScrollOnRefresh: true,
                    deferEmptyText: true,
                    emptyText: '<div class="grid-data-empty"><div data-icon="/" class="empty-grid-icon"></div><div class="empty-grid-headline">Нет данных для просмотра.</div><div class="empty-grid-byline">Для выбранной ведомости отсутствуют сведения по объектам содержания.</div></div>',
                    trackOver: false,
                    stripeRows: false
                },
                features: [{
                    id: 'group',
                    ftype: 'groupingsummary',
                    groupHeaderTpl: 'Район:     {name}',
                    hideGroupedHeader: true,
                    enableGroupingMenu: false,
                    showSummaryRow: false,
                    startCollapsed: true
                }],
                columns: [
                    {dataIndex: "id", text: "ИД", hidden: true, sortable: false, hideable: false},
                    //{dataIndex: "layer_name", text: "Ведомость", width: 250, cellWrap: true},
                    {dataIndex: "munobr_name", text: "Район", flex: 2, cellWrap: true},
                    {dataIndex: "object_name", text: "Объект содержания", flex: 4, cellWrap: true},
                    {dataIndex: "counts", text: "Кол-во позиций", flex: 1, cellWrap: true}
                ]
            }
        ];
        this.callParent(arguments);
    }
});
