Ext.override(Ext.grid.Panel, {

    // downloadExcelXml: function(includeHidden, title) {
    //
    //     if (!title) title = this.title;
    //
    //     var vExportContent = this.getExcelXml(includeHidden, title);
    //
    //
    //     /*
    //       dynamically create and anchor tag to force download with suggested filename
    //       note: download attribute is Google Chrome specific
    //     */
    //
    //     if (Ext.isChrome) {
    //         var gridEl = this.getEl();
    //         var location = 'data:application/vnd.ms-excel;base64,' + Base64.encode(vExportContent);
    //
    //         var el = Ext.DomHelper.append(gridEl, {
    //             tag: "a",
    //             download: title + "-" + Ext.Date.format(new Date(), 'Y-m-d Hi') + '.xls',
    //             href: location
    //         });
    //
    //         el.click();
    //
    //         Ext.fly(el).destroy();
    //
    //     } else {
    //
    //         var form = this.down('form#uploadForm');
    //         if (form) {
    //             form.destroy();
    //         }
    //         form = this.add({
    //             xtype: 'form',
    //             itemId: 'uploadForm',
    //             hidden: true,
    //             standardSubmit: true,
    //             url: 'http://webapps.figleaf.com/dataservices/Excel.cfc?method=echo&mimetype=application/vnd.ms-excel&filename=' + escape(title + ".xls"),
    //             items: [{
    //                 xtype: 'hiddenfield',
    //                 name: 'data',
    //                 value: vExportContent
    //             }]
    //         });
    //
    //         form.getForm().submit();
    //
    //     }
    // },

    exportExcelXml: function(includeHidden, title) {
        if (!title) title = this.title||"Сведения";

        var lname = this.excelName||"Сведения",
            columns = this.columnManager.columns,
            store = this.getStore(),
            wb = {
                worksheets: [{}],
                creator: "...",
                created: new Date(),
                lastModifiedBy: "...",
                modified: new Date(),
                activeWorksheet: 0
            },
            ws = wb.worksheets[0];
        ws.name = lname;
        ws.data = [];
/*
        console.log('columns ');
        console.log(columns);
        console.log('columnManager ');
        console.log(this.columnManager.columns);
*/
        var a = ws.data.push([]) - 1,
            head;
        for (col in columns) {
            if (!includeHidden && columns[col].hidden) continue; //игнорирую скрытые столбцы
            if (columns[col].$className == 'Ext.grid.column.Check' || columns[col].$className == 'Ext.grid.column.Action') continue; //игнорирую спец столбцы
            if (columns[col].typeAttributeValue == 61) continue; //игнорирую столбец Файл диалога

            var header = columns[col].text||columns[col].header;
            if (header) {
                head = {
                    value: header,
                    borders: {
                        top: "ff000000",
                        bottom: "ff000000",
                        left: "ff000000",
                        right: "ff000000"
                    },
                    bold: true,
                    italic: false,
                    fontName: "Arial",
                    fontSize: "10"/*,
                    colSpan: 2*/
                };
                ws.data[a].push(head);
            }
        }

        var row_index, row_count, row_value;
        for (row_index = 0, row_count = store.data.items.length; row_index < row_count; row_index += 1) {
            var row = store.getAt(row_index).data,
                a = ws.data.push([]) - 1;
            for (col_index = 0; col_index < columns.length; col_index += 1) {
                var grid_col = columns[col_index];

                if (!includeHidden && grid_col.hidden) continue;
                if (grid_col.$className == 'Ext.grid.column.Check' || grid_col.$className == 'Ext.grid.column.Action') continue; //игнорирую спец столбцы
                if (grid_col.typeAttributeValue == 61) continue; //игнорирую столбец Файл диалога

                var row_val = row[grid_col.dataIndex];
                if (row_val !== undefined){
                    row_value = "";

                    if (grid_col.renderer && grid_col.renderer !== undefined && grid_col.renderer !== null && grid_col.renderer !== false && grid_col.xtype != "datecolumn" && grid_col.xtype != "booleancolumn") {
                        var renderFunc = grid_col.renderer;
                        var rendVal = renderFunc(row_val)

                        if (grid_col.typeAttributeValue == 60) {//для имени файла выведу имя файла без ссылки
                            row_value = row_val;
                        } else {
                            if (row_val && grid_col.hasCustomRenderer) {
                                row_value = row_val + ' - ' + (rendVal || '');  // выведется код и значение рендеринга столбца
                            }else {
                                row_value = rendVal; //выведется просто значение рендеринга столбца
                            }
                        }

                    } else {
                        if (grid_col.xtype == "datecolumn" && row_val) {
                            row_value = Ext.Date.format(new Date(row_val), grid_col.format)
                        } else {
                            if (grid_col.xtype == "booleancolumn" && (row_val === false || row_val === 0)) {
                                row_value = "Нет"
                            } else {
                                if (grid_col.xtype == "booleancolumn" && (row_val === true || row_val === 1)) {
                                    row_value = "Да"
                                } else {
                                    row_value = row_val
                                }
                            }
                        }
                    }
                    rr = {
                        value: row_value,
                        borders: {
                            top: "ff000000",
                            bottom: "ff000000",
                            left: "ff000000",
                            right: "ff000000"
                        },
                        bold: false,
                        italic: false,
                        fontName: "Arial",
                        fontSize: "9"
                    };
                    ws.data[a].push(rr);
                }
            }
        }

        /*var l = document.createElement("a");
        l.download = lname + ".xlsx";
        l.href = xlsx(wb).href();
        l.click();*/

        //if (Ext.isChrome) {
            var gridEl = this.getEl();
            var el = Ext.DomHelper.append(gridEl, {
                tag: "a",
                download: lname + "-" + Ext.Date.format(new Date(), 'Y-m-d Hi') + '.xlsx',
                href: xlsx(wb).href()
            });
            el.click();
            Ext.fly(el).destroy();
        // }else{
        //     /*var form = this.down('form#uploadForm');
        //     if (form) {
        //         form.destroy();
        //     }
        //     form = this.add({
        //         xtype: 'form',
        //         itemId: 'uploadForm',
        //         hidden: true,
        //         standardSubmit: true,
        //         url: 'http://webapps.figleaf.com/dataservices/Excel.cfc?method=echo&mimetype=application/vnd.ms-excel&filename=' + escape(lname + "-" + Ext.Date.format(new Date(), 'Y-m-d Hi') + '.xlsx'),
        //         items: [{
        //             xtype: 'hiddenfield',
        //             name: 'data',
        //             value: xlsx.write(wb, {bookType:'xlsx', bookSST:false, type:'array'})
        //         }]
        //     });
        //     form.getForm().submit();*/
        // }
    }
})
