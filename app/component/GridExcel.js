Ext.define("roadInfo.component.GridExcel", {
    alias: "plugin.excel",
    extend: Ext.AbstractPlugin,
    mixins: {
        observable: Ext.util.Observable
    },
    constructor: function (a) {
        var b = this;
        b.callParent(arguments);
        b.mixins.observable.constructor.call(b)
    },
    init: function (a) {
        var b = this;
        b.grid = a;
        b.view = a.view;
        var c = (function () {
            var d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            function e(g) {
                g = g.replace(/\r\n/g, "\n");
                var f = "";
                for (var k = 0; k < g.length; k++) {
                    var h = g.charCodeAt(k);
                    if (h < 128) {
                        f += String.fromCharCode(h)
                    } else {
                        if ((h > 127) && (h < 2048)) {
                            f += String.fromCharCode((h >> 6) | 192);
                            f += String.fromCharCode((h & 63) | 128)
                        } else {
                            f += String.fromCharCode((h >> 12) | 224);
                            f += String.fromCharCode(((h >> 6) & 63) | 128);
                            f += String.fromCharCode((h & 63) | 128)
                        }
                    }
                }
                return f
            }

            return {
                encode: (typeof btoa == "function") ? function (f) {
                    return btoa(e(f))
                } : function (h) {
                    var f = "";
                    var q, o, m, p, n, l, k;
                    var g = 0;
                    h = e(h);
                    while (g < h.length) {
                        q = h.charCodeAt(g++);
                        o = h.charCodeAt(g++);
                        m = h.charCodeAt(g++);
                        p = q >> 2;
                        n = ((q & 3) << 4) | (o >> 4);
                        l = ((o & 15) << 2) | (m >> 6);
                        k = m & 63;
                        if (isNaN(o)) {
                            l = k = 64
                        } else {
                            if (isNaN(m)) {
                                k = 64
                            }
                        }
                        f = f + d.charAt(p) + d.charAt(n) + d.charAt(l) + d.charAt(k)
                    }
                    return f
                }
            }
        })();


        Ext.define('overrides.view.Grid', {
            override: 'Ext.grid.GridPanel',
            requires: 'Ext.form.action.StandardSubmit',

            downloadExcelXml: function (includeHidden, title) {
                if (!title) title = this.title;
                var vExportContent = this.getExcelXml(includeHidden, title);
                /*
                  dynamically create and anchor tag to force download with suggested filename
                  note: download attribute is Google Chrome specific
                */
                if (Ext.isChrome) {
                    var gridEl = this.getEl();
                    var location = 'data:application/vnd.ms-excel;base64,' + c.encode(vExportContent);
                    var el = Ext.DomHelper.append(gridEl, {
                        tag: "a",
                        download: title + "-" + Ext.Date.format(new Date(), 'Y-m-d Hi') + '.xls',
                        href: location
                    });
                    el.click();
                    Ext.fly(el).destroy();
                } else {
                    var form = this.down('form#uploadForm');
                    if (form) {
                        form.destroy();
                    }
                    form = this.add({
                        xtype: 'form',
                        itemId: 'uploadForm',
                        hidden: true,
                        standardSubmit: true,
                        url: 'http://webapps.figleaf.com/dataservices/Excel.cfc?method=echo&mimetype=application/vnd.ms-excel&filename=' + escape(title + ".xls"),
                        items: [{
                            xtype: 'hiddenfield',
                            name: 'data',
                            value: vExportContent
                        }]
                    });
                    form.getForm().submit();
                }
            },

            /*
                Welcome to XML Hell
                See: http://msdn.microsoft.com/en-us/library/office/aa140066(v=office.10).aspx
                for more details
            */
            getExcelXml: function (includeHidden, title) {
                var theTitle = title || this.title;
                var worksheet = this.createWorksheet(includeHidden, theTitle);
                if (this.columnManager.columns) {
                    var totalWidth = this.columnManager.columns.length;
                } else {
                    var totalWidth = this.columns.length;
                }
                return ''.concat(
                    '<?xml version="1.0"?>',
                    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">',
                    '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>' + theTitle + '</Title></DocumentProperties>',
                    '<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office"><AllowPNG/></OfficeDocumentSettings>',
                    '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">',
                    '<WindowHeight>' + worksheet.height + '</WindowHeight>',
                    '<WindowWidth>' + worksheet.width + '</WindowWidth>',
                    '<ProtectStructure>False</ProtectStructure>',
                    '<ProtectWindows>False</ProtectWindows>',
                    '</ExcelWorkbook>',

                    '<Styles>',

                    '<Style ss:ID="Default" ss:Name="Normal">',
                    '<Alignment ss:Vertical="Bottom"/>',
                    '<Borders/>',
                    '<Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="12" ss:Color="#000000"/>',
                    '<Interior/>',
                    '<NumberFormat/>',
                    '<Protection/>',
                    '</Style>',

                    '<Style ss:ID="title">',
                    '<Borders />',
                    '<Font ss:Bold="1" ss:Size="18" />',
                    '<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1" />',
                    '<NumberFormat ss:Format="@" />',
                    '</Style>',

                    '<Style ss:ID="headercell">',
                    '<Font ss:Bold="1" ss:Size="10" />',
                    '<Alignment ss:Horizontal="Center" ss:WrapText="1" />',
                    '<Interior ss:Color="#A3C9F1" ss:Pattern="Solid" />',
                    '</Style>',

                    '<Style ss:ID="even">',
                    '<Interior ss:Color="#CCFFFF" ss:Pattern="Solid" />',
                    '</Style>',

                    '<Style ss:ID="evendate" ss:Parent="even">',
                    '<NumberFormat ss:Format="yyyy-mm-dd" />',
                    '</Style>',

                    '<Style ss:ID="evenint" ss:Parent="even">',
                    '<Numberformat ss:Format="0" />',
                    '</Style>',

                    '<Style ss:ID="evenfloat" ss:Parent="even">',
                    '<Numberformat ss:Format="0.00" />',
                    '</Style>',

                    '<Style ss:ID="odd">',
                    '<Interior ss:Color="#CCCCFF" ss:Pattern="Solid" />',
                    '</Style>',

                    '<Style ss:ID="groupSeparator">',
                    '<Interior ss:Color="#D3D3D3" ss:Pattern="Solid" />',
                    '</Style>',

                    '<Style ss:ID="odddate" ss:Parent="odd">',
                    '<NumberFormat ss:Format="yyyy-mm-dd" />',
                    '</Style>',

                    '<Style ss:ID="oddint" ss:Parent="odd">',
                    '<NumberFormat Format="0" />',
                    '</Style>',

                    '<Style ss:ID="oddfloat" ss:Parent="odd">',
                    '<NumberFormat Format="0.00" />',
                    '</Style>',

                    '</Styles>',
                    worksheet.xml,
                    '</Workbook>'
                );
            },

            /*
                Support function to return field info from store based on fieldname
            */
            getModelField: function (fieldName) {
                var fields = this.store.model.getFields();
                for (var i = 0; i < fields.length; i++) {
                    if (fields[i].name === fieldName) {
                        return fields[i];
                    }
                }
            },

            /*
                Convert store into Excel Worksheet
            */
            generateEmptyGroupRow: function (dataIndex, value, cellTypes, includeHidden) {
                var cm = this.columnManager.columns;
                var colCount = cm.length;
                var rowTpl = '<Row ss:AutoFitHeight="0"><Cell ss:StyleID="groupSeparator" ss:MergeAcross="{0}"><Data ss:Type="String"><html:b>{1}</html:b></Data></Cell></Row>';
                var visibleCols = 0;
                // rowXml += '<Cell ss:StyleID="groupSeparator">'
                for (var j = 0; j < colCount; j++) {
                    if (cm[j].xtype != 'actioncolumn' && cm[j].xtype != 'checkcolumn' && (cm[j].dataIndex != '') && (includeHidden || !cm[j].hidden)) {
                        // rowXml += '<Cell ss:StyleID="groupSeparator"/>';
                        visibleCols++;
                    }
                }
                // rowXml += "</Row>";
                return Ext.String.format(rowTpl, visibleCols - 1, Ext.String.htmlEncode(value));
            },

            createWorksheet: function (includeHidden, theTitle) {
                // Calculate cell data types and extra class names which affect formatting
                var cellType = [];
                var cellTypeClass = [];
                if (this.columnManager.columns) {
                    var cm = this.columnManager.columns;
                } else {
                    var cm = this.columns;
                }
                var colCount = cm.length;
                var totalWidthInPixels = 0;
                var colXml = '';
                var headerXml = '';
                var visibleColumnCountReduction = 0;

                for (var i = 0; i < cm.length; i++) {
                    if (cm[i].xtype != 'actioncolumn' && cm[i].xtype != 'checkcolumn' && (cm[i].dataIndex != '') && (includeHidden || !cm[i].hidden)) {
                        var w = cm[i].getEl().getWidth();
                        totalWidthInPixels += w;

                        if (cm[i].text === "") {
                            cellType.push("None");
                            cellTypeClass.push("");
                            ++visibleColumnCountReduction;
                        } else {
                            colXml += '<Column ss:AutoFitWidth="1" ss:Width="' + w + '" />';
                            headerXml += '<Cell ss:StyleID="headercell">' +
                                '<Data ss:Type="String">' + cm[i].text.replace("<br>", " ") + '</Data>' +
                                '<NamedCell ss:Name="Print_Titles"></NamedCell></Cell>';

                            var fld = this.getModelField(cm[i].dataIndex);

                            switch (fld.$className) {
                                case "Ext.data.field.Integer":
                                case "int":
                                    cellType.push("Number");
                                    cellTypeClass.push("int");
                                    break;
                                case "Ext.data.field.Number":
                                case "float":
                                    cellType.push("Number");
                                    cellTypeClass.push("float");
                                    break;
                                case "Ext.data.field.Boolean":
                                case "Ext.data.field.String":
                                case "bool":
                                case "boolean":
                                case "text":
                                case "string":
                                    cellType.push("String");
                                    cellTypeClass.push("");
                                    break;
                                case "Ext.data.field.Date":
                                case "date":
                                    cellType.push("DateTime");
                                    cellTypeClass.push("date");
                                    break;
                                default:
                                    cellType.push("String");
                                    cellTypeClass.push("");
                                    break;
                            }
                        }
                    }
                }
                var visibleColumnCount = cellType.length - visibleColumnCountReduction;

                var result = {
                    height: 9000,
                    width: Math.floor(totalWidthInPixels * 30) + 50
                };

                // Generate worksheet header details.

                // determine number of rows
                var numGridRows = this.store.getCount() + 2;
                if ((this.store.groupField && !Ext.isEmpty(this.store.groupField)) || (this.store.groupers && this.store.groupers.items.length > 0)) {
                    numGridRows = numGridRows + this.store.getGroups().length;
                }

                // create header for worksheet
                var t = ''.concat(
                    '<Worksheet ss:Name="' + theTitle + '">',

                    '<Names>',
                    '<NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'' + theTitle + '\'!R1:R2">',
                    '</NamedRange></Names>',

                    '<Table ss:ExpandedColumnCount="' + (visibleColumnCount + 2),
                    '" ss:ExpandedRowCount="' + numGridRows + '" x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="65" ss:DefaultRowHeight="15">',
                    colXml,
                    '<Row ss:Height="38">',
                    '<Cell ss:MergeAcross="' + (visibleColumnCount - 1) + '" ss:StyleID="title">',
                    '<Data ss:Type="String" xmlns:html="http://www.w3.org/TR/REC-html40">',
                    '<html:b>' + theTitle + '</html:b></Data><NamedCell ss:Name="Print_Titles">',
                    '</NamedCell></Cell>',
                    '</Row>',
                    '<Row ss:AutoFitHeight="1">',
                    headerXml +
                    '</Row>'
                );

                // Generate the data rows from the data in the Store
                var groupVal = "";
                var groupField = "";
                if (this.store.groupers && this.store.groupers.keys.length > 0) {
                    groupField = this.store.groupers.keys[0];
                } else if (this.store.groupField != '') {
                    groupField = this.store.groupField;
                }

                for (var i = 0, it = this.store.data.items, l = it.length; i < l; i++) {

                    if (!Ext.isEmpty(groupField)) {
                        if (groupVal != this.store.getAt(i).get(groupField)) {
                            groupVal = this.store.getAt(i).get(groupField);
                            t += this.generateEmptyGroupRow(groupField, groupVal, cellType, includeHidden);
                        }
                    }
                    t += '<Row>';
                    var cellClass = (i & 1) ? 'odd' : 'even';
                    r = it[i].data;
                    var k = 0;
                    for (var j = 0; j < colCount; j++) {
                        if (cm[j].xtype != 'actioncolumn' && cm[j].xtype != 'checkcolumn' && (cm[j].dataIndex != '') && (includeHidden || !cm[j].hidden)) {
                            var v = r[cm[j].dataIndex];
                            if (cellType[k] !== "None") {
                                t += '<Cell ss:StyleID="' + cellClass + cellTypeClass[k] + '"><Data ss:Type="' + cellType[k] + '">';
                                if (cellType[k] == 'DateTime') {
                                    t += Ext.Date.format(v, 'Y-m-d');
                                } else if (!Ext.isEmpty(v)) {
                                    t += Ext.String.htmlEncode(v);
                                }
                                t += '</Data></Cell>';
                            }
                            k++;
                        }
                    }
                    t += '</Row>';
                }

                result.xml = t.concat(
                    '</Table>',
                    '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">',
                    '<PageLayoutZoom>0</PageLayoutZoom>',
                    '<Selected/>',
                    '<Panes>',
                    '<Pane>',
                    '<Number>3</Number>',
                    '<ActiveRow>2</ActiveRow>',
                    '</Pane>',
                    '</Panes>',
                    '<ProtectObjects>False</ProtectObjects>',
                    '<ProtectScenarios>False</ProtectScenarios>',
                    '</WorksheetOptions>',
                    '</Worksheet>'
                );
                return result;
            }
        });


        // Ext.override(Ext.grid.Panel, {
        //     downloadExcelXml: function(includeHidden, title) {
        //         if (!title) title = this.title;
        //         var vExportContent = this.getExcelXml(includeHidden, title);
        //
        //         /*
        //           dynamically create and anchor tag to force download with suggested filename
        //           note: download attribute is Google Chrome specific
        //         */
        //         if (Ext.isChrome) {
        //             var gridEl = this.getEl();
        //             var location = 'data:application/vnd.ms-excel;base64,' + c.encode(vExportContent);
        //
        //             var el = Ext.DomHelper.append(gridEl, {
        //                 tag: "a",
        //                 download: title + "-" + Ext.Date.format(new Date(), 'Y-m-d Hi') + '.xls',
        //                 href: location
        //             });
        //             el.click();
        //             Ext.fly(el).destroy();
        //         } else {
        //             var form = this.down('form#uploadForm');
        //             if (form) {
        //                 form.destroy();
        //             }
        //             form = this.add({
        //                 xtype: 'form',
        //                 itemId: 'uploadForm',
        //                 hidden: true,
        //                 standardSubmit: true,
        //                 url: 'http://webapps.figleaf.com/dataservices/Excel.cfc?method=echo&mimetype=application/vnd.ms-excel&filename=' + escape(title + ".xls"),
        //                 items: [{
        //                     xtype: 'hiddenfield',
        //                     name: 'data',
        //                     value: vExportContent
        //                 }]
        //             });
        //             form.getForm().submit();
        //         }
        //     },
        //
        //     /*
        //         Welcome to XML Hell
        //         See: http://msdn.microsoft.com/en-us/library/office/aa140066(v=office.10).aspx
        //         for more details
        //     */
        //     getExcelXml: function(includeHidden, title) {
        //         var theTitle = title || this.title;
        //
        //         var worksheet = this.createWorksheet(includeHidden, theTitle);
        //         /*if (this.columnManager.columns) {
        //             var totalWidth = this.columnManager.columns.length;
        //         } else {
        //             var totalWidth = this.columns.length;
        //         }*/
        //
        //         var res = ''.concat(
        //             '<?xml version="1.0"?>',
        //             '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">',
        //             '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>' + theTitle + '</Title></DocumentProperties>',
        //             '<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office"><AllowPNG/></OfficeDocumentSettings>',
        //             '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">',
        //             '<WindowHeight>' + worksheet.height + '</WindowHeight>',
        //             '<WindowWidth>' + worksheet.width + '</WindowWidth>',
        //             '<ProtectStructure>False</ProtectStructure>',
        //             '<ProtectWindows>False</ProtectWindows>',
        //             '</ExcelWorkbook>',
        //
        //             '<Styles>',
        //
        //             '<Style ss:ID="Default" ss:Name="Normal">',
        //             '<Alignment ss:Vertical="Bottom"/>',
        //             '<Borders/>',
        //             '<Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="12" ss:Color="#000000"/>',
        //             '<Interior/>',
        //             '<NumberFormat/>',
        //             '<Protection/>',
        //             '</Style>',
        //
        //             '<Style ss:ID="title">',
        //             '<Borders />',
        //             '<Font ss:Bold="1" ss:Size="18" />',
        //             '<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1" />',
        //             '<NumberFormat ss:Format="@" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="headercell">',
        //             '<Font ss:Bold="1" ss:Size="10" />',
        //             '<Alignment ss:Horizontal="Center" ss:WrapText="1" />',
        //             '<Interior ss:Color="#A3C9F1" ss:Pattern="Solid" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="even">',
        //             '<Interior ss:Color="#CCFFFF" ss:Pattern="Solid" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="evendate" ss:Parent="even">',
        //             '<NumberFormat ss:Format="yyyy-mm-dd" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="evenint" ss:Parent="even">',
        //             '<Numberformat ss:Format="0" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="evenfloat" ss:Parent="even">',
        //             '<Numberformat ss:Format="0.00" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="odd">',
        //             '<Interior ss:Color="#CCCCFF" ss:Pattern="Solid" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="odddate" ss:Parent="odd">',
        //             '<NumberFormat ss:Format="yyyy-mm-dd" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="oddint" ss:Parent="odd">',
        //             '<NumberFormat Format="0" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="oddfloat" ss:Parent="odd">',
        //             '<NumberFormat Format="0.00" />',
        //             '</Style>',
        //
        //             '<Style ss:ID="groupSeparator">',
        //             '<Interior ss:Color="#D3D3D3" ss:Pattern="Solid" />',
        //             '</Style>',
        //
        //             '</Styles>',
        //             worksheet.xml,
        //             '</Workbook>'
        //         );
        //
        //         return res;
        //     },
        //
        //     /*
        //         Support function to return field info from store based on fieldname
        //     */
        //     getModelField: function(fieldName) {
        //         var fields = this.store.model.getFields();
        //         for (var i = 0; i < fields.length; i++) {
        //             if (fields[i].name === fieldName) {
        //                 return fields[i];
        //             }
        //         }
        //     },
        //
        //     /*
        //         Convert store into Excel Worksheet
        //     */
        //     generateEmptyGroupRow: function(dataIndex, value, cellTypes, includeHidden) {
        //         var cm = this.columnManager.columns;
        //         var colCount = cm.length;
        //         var rowTpl = '<Row ss:AutoFitHeight="0"><Cell ss:StyleID="groupSeparator" ss:MergeAcross="{0}"><Data ss:Type="String"><html:b>{1}</html:b></Data></Cell></Row>';
        //         var visibleCols = 0;
        //         // rowXml += '<Cell ss:StyleID="groupSeparator">'
        //         for (var j = 0; j < colCount; j++) {
        //             if (cm[j].xtype != 'actioncolumn' && (cm[j].dataIndex != '') && (includeHidden || !cm[j].hidden)) {
        //                 // rowXml += '<Cell ss:StyleID="groupSeparator"/>';
        //                 visibleCols++;
        //             }
        //         }
        //         // rowXml += "</Row>";
        //         return Ext.String.format(rowTpl, visibleCols - 1, Ext.String.htmlEncode(value));
        //     },
        //
        //     createWorksheet: function(includeHidden, theTitle) {
        //         var f = includeHidden;
        //         var m = theTitle;
        //         var C = [];
        //         var y = [];
        //         var o = this.columns;
        //         var h = 0;
        //         var e = "";
        //         var D = "";
        //         var n = 0;
        //         var x = o.length;
        //         for (var F = 0; F < x; F++) {
        //             if ((o[F].dataIndex != "") && (f || !o[F].hidden) && !(o[F] instanceof Ext.grid.column.Action) && !(o[F] instanceof Ext.grid.column.RowNumberer)) {
        //                 var q = o[F].getEl().getWidth();
        //                 h += q;
        //                 if (o[F].text === "") {
        //                     C.push("None");
        //                     y.push("");
        //                     ++n
        //                 } else {
        //                     e += '<Column ss:AutoFitWidth="1" ss:Width="' + q + '" />';
        //                     D += '<Cell ss:StyleID="headercell"><Data ss:Type="String">' + o[F].text + '</Data><NamedCell ss:Name="Print_Titles"></NamedCell></Cell>';
        //                     var d = this.getModelField(o[F].dataIndex);
        //                     switch (d.type) {
        //                         case "Ext.data.field.Integer":
        //                         case "int":
        //                             C.push("Number");
        //                             y.push("int");
        //                             break;
        //                         case "Ext.data.field.Number":
        //                         case "float":
        //                             C.push("Number");
        //                             y.push("float");
        //                             break;
        //                         case "Ext.data.field.Boolean":
        //                         case "Ext.data.field.String":
        //                         case "bool":
        //                         case "boolean":
        //                         case "text":
        //                         case "string":
        //                             C.push("String");
        //                             y.push("");
        //                             break;
        //                         case "Ext.data.field.Date":
        //                         case "date":
        //                             C.push("DateTime");
        //                             y.push("date");
        //                             break;
        //                         default:
        //                             C.push("String");
        //                             y.push("");
        //                             break
        //                     }
        //                 }
        //             }
        //         }
        //         var G = C.length - n;
        //         var p = {
        //             height: 9000,
        //             width: Math.floor(h * 30) + 50
        //         };
        //         var u = "".concat('<Worksheet ss:Name="' + m + '">', "<Names>", '<NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'' + m + "'!R1:R2\">", "</NamedRange></Names>", '<Table ss:ExpandedColumnCount="' + (G + 2), '" ss:ExpandedRowCount="' + (this.store.getCount() + 2) + '" x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="65" ss:DefaultRowHeight="15">', e, '<Row ss:Height="38">', '<Cell ss:MergeAcross="' + (G - 1) + '" ss:StyleID="title">', '<Data ss:Type="String" xmlns:html="http://www.w3.org/TR/REC-html40">', "<html:b>" + m + '</html:b></Data><NamedCell ss:Name="Print_Titles">', "</NamedCell></Cell>", "</Row>", '<Row ss:AutoFitHeight="1">', D + "</Row>");
        //         for (var F = 0, g = this.store.data.items, A = g.length; F < A; F++) {
        //             u += "<Row>";
        //             //var z = (F & 1) ? "odd" : "even";
        //             var z = "even";
        //             r = g[F].data;
        //             var B = 0;
        //             for (var E = 0; E < x; E++) {
        //                 if ((o[E].dataIndex != "") && (f || !o[E].hidden) && !(o[E] instanceof Ext.grid.column.Action) && !(o[E] instanceof Ext.grid.column.RowNumberer)) {
        //
        //                     //var kk = r[o[E].dataIndex];
        //                     if (o[E].renderer /*&& o[E].hasCustomRenderer*/){
        //                         var s = o[E].renderer( r[o[E].dataIndex] );
        //                     }else{
        //                         var s = r[o[E].dataIndex];
        //                     }
        //
        //                     if (C[B] !== "None") {
        //                         u += '<Cell ss:StyleID="' + z + y[B] + '"><Data ss:Type="' + C[B] + '">';
        //                         if (C[B] == "DateTime") {
        //                             u += Ext.Date.format(s, "Y-m-d")
        //                         } else {
        //                             u += s
        //                         }
        //                         u += "</Data></Cell>"
        //                     }
        //                     B++
        //                 }
        //             }
        //             u += "</Row>"
        //         }
        //         p.xml = u.concat("</Table>", '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">', "<PageLayoutZoom>0</PageLayoutZoom>", "<Selected/>", "<Panes>", "<Pane>", "<Number>3</Number>", "<ActiveRow>2</ActiveRow>", "</Pane>", "</Panes>", "<ProtectObjects>False</ProtectObjects>", "<ProtectScenarios>False</ProtectScenarios>", "</WorksheetOptions>", "</Worksheet>");
        //         return p
        //     }
        // })

    }
});

