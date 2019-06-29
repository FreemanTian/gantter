function initType() {
    initgant();
    $('.searchBtn').linkbutton({
        iconCls: 'icon-search',
        text: '查询',
    });
    $('#WorkPlan').combobox({
        label: '车间:',
        labelPosition: 'left',
        url: 'combobox_data.json',
        valueField: 'id',
        textField: 'text',
        width: '150',
    });
    $('#ProdLine').combobox({
        label: '产线:',
        labelPosition: 'left',
        url: 'combobox_data.json',
        valueField: 'id',
        textField: 'text',
        width: '150',
    });
    $('#DateTime').datebox({
        label: '日期:',
        labelPosition: 'left',
        width: '150',
    });
    $('#ProNo').textbox({
        label: '产品编号:',
        labelPosition: 'left',
        width: '150',
    });
}



function initgant() {

        var ganttOpts = {};
        var ganttView = null;
        jQuery.fn.ganttView = function () {

            var args = Array.prototype.slice.call(arguments);

            if (args.length === 1 && typeof (args[0]) === "object") {
                ganttView = this;
                build.call(ganttView, args[0]);
            } else if (args.length >= 1 && typeof (args[0] === "string")) {
                handleMethod.call(ganttView, args);
            }

        };

        function build(options) {
            ganttView.children().remove();
            var defaults = {
                showWeekends: true,
                minDays: 0,
                cellWidth: 20,
                cellHeight: 31,
                vtHeaderWidth: 200,
                data: [],
                dataUrl: null,
                behavior: {
                    clickable: true,
                    draggable: true,
                    resizable: true,
                    doubleclickable: true
                }
            };

            var opts = jQuery.extend(true, defaults, options);
            jQuery.extend(ganttOpts, opts);
            if (opts.data) {
                build();
            } else if (opts.dataUrl) {
                jQuery.getJSON(opts.dataUrl, function (data) {
                    opts.data = data;
                    jQuery.extend(ganttOpts, opts);
                    build();
                });
            }

            function build() {
                for (var i = 0; i < opts.data.length; i++) {
                    for (var j = 0; j < opts.data[i].series.length; j++) {
                        var serie = opts.data[i].series[j];
                        if (!!serie.start && !!serie.end) {
                            serie.start = new Date(serie.start);
                            serie.end = new Date(serie.end);
                        }
                    }
                }
                //每日08:00开始
                var minDays = opts.minDays;
                var startEnd = DateUtils.getBoundaryDatesFromData(opts.data, minDays);
                opts.start = DateUtils.getStartTime();
                opts.end = startEnd[1];
                ganttView.each(function () {
                    var container = jQuery(this);
                    var div = jQuery("<div>", { "class": minDays == 1 ? "mindayview" : "ganttview" });
                    new Chart(div, opts).render();
                    container.append(div);
                    new Behavior(container, opts).apply();
                });
            }
        }

        function handleMethod(args) {

            if (args.length > 1) {
                if (args[0] === "getDatas" && typeof (args[1]) === "function") {
                    var datas = [];
                    ganttOpts.data.forEach(function (value) {
                        var data = {};
                        jQuery.extend(data, value);
                        data.series = value.series.filter(function (v) {
                            return !v._empty;
                        });
                        datas.push(data);
                    });
                    args[1](datas);
                }
            }
        }

        var Chart = function (div, opts) {
            function render() {
                addVtHeader(div, opts.data, opts.cellHeight, opts.vtHeaderWidth);
                var slideDiv = jQuery("<div>", {
                    "class": "ganttview-slide-container"
                });

                var dates = getDates(opts.start, opts.end);
                addHzHeader(slideDiv, dates, opts.cellWidth, opts.minDays, opts.showWeekends);
                addGrid(slideDiv, opts.data, dates, opts.cellWidth, opts.minDays, opts.cellHeight, opts.showWeekends);
                addBlockContainers(slideDiv, opts.data, opts.cellHeight);
                addBlocks(slideDiv, opts.data, opts.cellWidth, opts.start, opts.cellHeight);
                div.append(slideDiv);
                applyLastClass(div.parent());
            }

            var monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
            var hourNames = [
                "08 : 00", "08 : 30", "09 : 00", "09 : 30", "10 : 00", "10 : 30", "11 : 00", "11 : 30",
                "12 : 00", "12 : 30", "13 : 00", "13 : 30", "14 : 00", "14 : 30", "15 : 00", "15 : 30",
                "16 : 00", "16 : 30", "17 : 00", "17 : 30", "18 : 00", "18 : 30", "19 : 00", "19 : 30",
                "20 : 00", "20 : 30", "21 : 00", "21 : 30", "22 : 00", "22 : 30", "23 : 00", "23 : 30",
                "00 : 00", "00 : 30", "01 : 00", "01 : 30", "02 : 00", "02 : 30", "03 : 00", "03 : 30",
                "04 : 00", "04 : 30", "05 : 00", "05 : 30", "06 : 00", "06 : 30", "07 : 00", "07 : 30"
            ];

            function getDates(start, end) {
                var dates = [];
                dates[start.getFullYear()] = [];
                dates[start.getFullYear()][start.getMonth()] = [start];
                var last = start;
                while (last.getTime() < end.getTime()) {
                    var next = DateUtils.addDays(new Date(last), 1);
                    if (!dates[next.getFullYear()]) {
                        dates[next.getFullYear()] = [];
                    }
                    if (!dates[next.getFullYear()][next.getMonth()]) {
                        dates[next.getFullYear()][next.getMonth()] = [];
                    }
                    dates[next.getFullYear()][next.getMonth()].push(next);
                    last = next;
                }
                return dates;
            }

            function addVtHeader(div, data, cellHeight, vtHeaderWidth) {
                var headerDiv = jQuery("<div>", {
                    "class": "ganttview-vtheader",
                    "css": { "width": vtHeaderWidth + "px" }
                });
                var headerTitleDiv = jQuery("<div>", {
                    "class": "ganttview-vtheader-title",
                    "css": { "width": vtHeaderWidth + "px", "height": "73px" }
                });

                headerTitleDiv.append(jQuery("<div>", {
                    "class": "ganttview-vtheader-title-name",
                    "css": { "height": "100%", "line-height": cellHeight * 2 + 11 + "px", "width": "100%" }
                }).append("名称"));

                headerDiv.append(headerTitleDiv);
                var listDiv = jQuery("<div>", {
                    "class": "itemList"
                });
                for (var i = 0; i < data.length; i++) {
                    var itemDiv = jQuery("<div>", {
                        "class": "ganttview-vtheader-item",
                        "css": { "height": (cellHeight) + "px" }
                    });
                    itemDiv.append(jQuery("<div>", {
                        "class": "ganttview-vtheader-item-name",
                        "css": {
                            "height": (cellHeight) + "px",
                            "line-height": (cellHeight - 6) + "px",
                            "width": "100%"
                        }
                    }).append(data[i].name));
                    listDiv.append(itemDiv);
                }
                headerDiv.append(listDiv);
                div.append(headerDiv);
            }

            function addHzHeader(div, dates, cellWidth, minDays, showWeekends) {
                var headerDiv = jQuery("<div>", { "class": "ganttview-hzheader" });
                var monthsDiv = jQuery("<div>", { "class": "ganttview-hzheader-months clearfix" });
                var daysDiv = jQuery("<div>", { "class": "ganttview-hzheader-days clearfix" });
                var hourDiv = jQuery("<div>", { "class": "ganttview-hzheader-days clearfix" });
                var totalW = 0;
                for (var y in dates) {
                    for (var m in dates[y]) {
                        if (minDays == 1) {
                            for (var d in dates[y][m]) {
                                if (d == 1) {
                                    break;
                                }
                                var w = 48 * cellWidth;
                                totalW = totalW + w;
                                monthsDiv.append(jQuery("<div>", {
                                    "class": "ganttview-hzheader-month",
                                    "css": { "width": (w - 1) + "px" }
                                }).append(y + "年" + monthNames[m] + dates[y][m][d].getDate() + "日"));
                                for (var h in hourNames) {
                                    var dayDiv = jQuery("<div>", {
                                        "class": "ganttview-hzheader-day",
                                        "css": { "width": (cellWidth - 1) + "px" }
                                    });
                                    dayDiv.append(hourNames[h]);
                                    daysDiv.append(dayDiv);
                                }
                            }
                        } else {
                            for (var d in dates[y][m]) {
                                var w = 48 * cellWidth;
                                totalW = totalW + w;
                                monthsDiv.append(jQuery("<div>", {
                                    "class": "ganttview-hzheader-month",
                                    "css": { "width": (w - 1) + "px" }
                                }).append(y + "年" + monthNames[m] + dates[y][m][d].getDate() + "日"));
                                for (var h in hourNames) {
                                    var dayDiv = jQuery("<div>", {
                                        "class": "ganttview-hzheader-day",
                                        "css": { "width": (cellWidth - 1) + "px" }
                                    });
                                    dayDiv.append(hourNames[h]);
                                    daysDiv.append(dayDiv);
                                }
                            }
                        }

                    }
                }
                monthsDiv.css("width", totalW + "px");
                daysDiv.css("width", totalW + "px");
                headerDiv.append(monthsDiv).append(daysDiv);
                div.append(headerDiv);
            }

            function addGrid(div, data, dates, cellWidth, mindays, cellHeight, showWeekends) {
                var gridDiv = jQuery("<div>", { "class": "ganttview-grid" });
                var rowDiv = jQuery("<div>", { "class": "ganttview-grid-row clearfix" });
                for (var y in dates) {
                    for (var m in dates[y]) {
                        if (mindays == 1) {
                            for (var d in dates[y][m]) {
                                if (d == 1) {
                                    break;
                                }
                                for (var h in hourNames) {
                                    var cellDiv = jQuery("<div>", {
                                        "class": "ganttview-grid-row-cell",
                                        "css": { "width": (cellWidth - 1) + "px", "height": (cellHeight - 1) + "px" }
                                    });
                                    rowDiv.append(cellDiv);
                                }
                            }
                        } else {
                            for (var d in dates[y][m]) {
                                for (var h in hourNames) {
                                    var cellDiv = jQuery("<div>", {
                                        "class": "ganttview-grid-row-cell",
                                        "css": { "width": (cellWidth - 1) + "px", "height": (cellHeight - 1) + "px" }
                                    });
                                    rowDiv.append(cellDiv);
                                }
                            }
                        }



                    }
                }
                var w = jQuery("div.ganttview-grid-row-cell", rowDiv).length * cellWidth;
                rowDiv.css("width", w + "px");
                gridDiv.css("width", w + "px");
                for (var i = 0; i < data.length; i++) {
                    var cloneRowDiv = rowDiv.clone();
                    cloneRowDiv.droppable({
                        accept: '.task',
                        hoverClass: "gantt-drag-hover",
                        drop: function (e, ui) {
                            var task = ui.helper.data("task");
                            var lineCount = gridDiv.children(".ganttview-grid-row").index(jQuery(this)) + 1;
                            var cellCount = Math.floor((ui.offset.left - jQuery(this).offset().left) / cellWidth);
                            var count = 0;
                            var intTime = DateUtils.getStartTime();
                            for (var i = 0; i < ganttOpts.data.length; i++) {
                                count++;
                                if (count === lineCount) {
                                    var nowSeries = ganttOpts.data[count - 1];
                                    var cellLeft = cellCount >= 0 ? cellCount : 0;
                                    //var startTime = DateUtils.addHours(intTime, cellLeft);
                                    var startTime = new Date();
                                    var endTime = DateUtils.addHours(startTime, 8);
                                    var startarr = [];
                                    var endarr = [];
                                    //if(!task.start || !task.flag) {
                                    if (!task.start) {
                                        //!!serie.flag 判断数据来源
                                        //console.log(nowSeries.series._empty);
                                        if (nowSeries.series.length > 0 && !nowSeries.series._empty) {
                                            for (var j = 0; j < nowSeries.series.length; j++) {
                                                var nowSeriesStart = new Date(nowSeries.series[j].start).getTime();
                                                var nowSeriesEnd = new Date(nowSeries.series[j].end).getTime();
                                                startarr.push(nowSeriesStart);
                                                endarr.push(nowSeriesEnd);
                                            }
                                            var getmax = Math.max.apply(null, endarr);
                                            var maxEndTime = new Date(getmax);
                                            var getmin = Math.min.apply(null, startarr);
                                            var minStartTime = new Date(getmin);
                                            if (minStartTime >= endTime) {
                                                task.start = startTime;
                                                task.end = endTime;
                                            } else {
                                                task.start = maxEndTime;
                                                task.end = DateUtils.addHours(maxEndTime, 8);
                                            }
                                        } else {
                                            task.start = startTime;
                                            task.end = endTime;
                                        }
                                    }
                                    //ui.helper.remove();
                                    var series = ganttOpts.data[i].series.filter(function (value) {
                                        console.log(!value._empty)
                                        return !value._empty;
                                    });
                                    series.push(task);
                                    ganttOpts.data[i].series = series;
                                    build(ganttOpts);
                                    break;
                                }
                            }
                        }
                    });
                    gridDiv.append(cloneRowDiv);
                }
                div.append(gridDiv);
            }

            function addBlockContainers(div, data, cellHeight) {
                var blocksDiv = jQuery("<div>", { "class": "ganttview-blocks" });
                for (var i = 0; i < data.length; i++) {
                    blocksDiv.append(jQuery("<div>", {
                        "class": "ganttview-block-container",
                        "css": { "height": cellHeight - 8 + "px" }
                    }));
                }
                div.append(blocksDiv);
            }

            function addBlocks(div, data, cellWidth, start, cellHeight) {
                var rows = jQuery("div.ganttview-blocks div.ganttview-block-container", div);
                var rowIdx = 0;
                var initTime = DateUtils.getStartTime();
                for (var i = 0; i < data.length; i++) {
                    rowIdx = i;
                    for (var j = 0; j < data[i].series.length; j++) {
                        var series = data[i].series[j];
                        var size = 0;
                        if (!series._empty) {
                            size = DateUtils.hoursBetween(series.start, series.end);

                            var offset = DateUtils.hoursBetween(initTime, series.start);
                            var block = jQuery("<div>", {
                                "class": "ganttview-block",
                                "title": series.name + "： " + size / 2 + " 小时 ",
                                "css": {
                                    "width": ((size * cellWidth) - 2) + "px",
                                    "height": cellHeight - 8 + "px",
                                    "left": ((offset * cellWidth)) + "px"
                                }
                            });
                            addBlockData(block, data[i], series);
                            if (!!data[i].series[j].options && data[i].series[j].flag) {
                                if (data[i].series[j].flag == 'on') {
                                    block.append(jQuery("<div>", {
                                        "class": "blockicon icon-on",
                                        "css": {
                                            "width": "24px",
                                            "height": cellHeight - 8 + "px",
                                        }
                                    }));
                                } else if (data[i].series[j].flag == 'lock') {
                                    block.append(jQuery("<div>", {
                                        "class": "blockicon icon-lock",
                                        "css": {
                                            "width": "24px",
                                            "height": cellHeight - 8 + "px",
                                        }
                                    }));
                                }

                            }
                            if (!!data[i].series[j].options && data[i].series[j].options.color) {
                                block.css("background-color", data[i].series[j].options.color);
                            }
                            block.append(jQuery("<div>", {
                                "class": "ganttview-block-text",
                                "css": { "height": cellHeight - 8 + "px", "line-height": cellHeight - 8 + "px" }
                            }).text(size / 2 + "小时"));
                            jQuery(rows[rowIdx]).append(block);
                        }
                    }
                }

            }

            function addBlockData(block, data, series) {
                var options = { draggable: true, resizable: true };
                var blockData = { id: data.id, taskId: null, name: data.name, flag: data.flag };
                if (!!series.options) {
                    jQuery.extend(options, series.options);
                }
                jQuery.extend(blockData, series);
                blockData.options = options;
                block.data("block-data", blockData);
            }

            function applyLastClass(div) {
                jQuery("div.ganttview-grid-row div.ganttview-grid-row-cell:last-child", div).addClass("last");
                jQuery("div.ganttview-hzheader-days div.ganttview-hzheader-day:last-child", div).addClass("last");
                jQuery("div.ganttview-hzheader-months div.ganttview-hzheader-month:last-child", div).addClass("last");

            }

            return {
                render: render
            };
        };

        var Behavior = function (div, opts) {

            function apply() {

                if (opts.behavior.clickable) {
                    bindBlockClick(div, opts.behavior.onClick);
                }

                if (opts.behavior.resizable) {
                    bindBlockResize(div, opts.cellWidth, opts.start, opts.behavior.onResize);
                }

                if (opts.behavior.draggable) {
                    bindBlockDrag(div, opts.cellWidth, opts.start, opts.behavior.onDrag);
                }

                if (opts.behavior.doubleclickable) {
                    bindBlockDoubleclick(div, opts.cellWidth, opts.start, opts.behavior.ondblclick)
                }
            }

            function bindBlockClick(div, callback) {
                jQuery("div.ganttview-block", div).on("click", function () {
                    if (callback) {
                        callback(jQuery(this).data("block-data"));
                    }
                });
            }

            function bindBlockDoubleclick(div, cellWidth, startDate, callback) {
                jQuery("div.ganttview-block", div).on("dblclick", function () {
                    var block = jQuery(this);
                    removeBlockDate(div, block);
                    if (callback) {
                        callback(block, block.data("block-data"));
                    }
                });
            }


            function bindBlockResize(div, cellWidth, startDate, callback) {
                jQuery("div.ganttview-block", div).each(function () {
                    if (jQuery(this).data("block-data").options.resizable) {
                        jQuery(this).resizable({
                            handles: "e",
                            grid: [1, 1],
                            drag: function (data, data1) {
                                data1.helper.outerWidth(data1.position.left + 5);
                            },
                            stop: function (data, data1) {
                                //拉伸任务对象
                                var block = jQuery(this);
                                var dex = block.index();
                                var blockSibling = block.siblings().length;
                                var zj = data1.helper;
                                var mostTouchDom = getMostTouchDom(zj);
                                var nextBlock = block.next();
                                if (mostTouchDom != false) {
                                    var thisLeft = $(mostTouchDom.dom).position().left;
                                    var blockLeft = block.position().left;
                                    var zjWidth = zj.outerWidth();
                                    var thisWidth = $(mostTouchDom.dom).outerWidth();
                                    //var lf = 4+thisWidth+thisLeft;
                                    var lf = thisWidth + thisLeft;

                                    if (mostTouchDom.touchRange >= 0) {
                                        if (!eachItemsLR(1, zj[0], mostTouchDom.dom, 0, ((thisLeft - zjWidth) < 0 ? 0 : (thisLeft - zjWidth)))) {

                                            if (blockSibling > dex && nextBlock != undefined && thisLeft - thisWidth > zjWidth + blockLeft) {
                                                zj.outerWidth(data1.originalSize.width);
                                            } else {
                                                //var lcount = (block.outerWidth() + 8) % cellWidth < cellWidth / 2 ? Math.floor((block.outerWidth() + 8) / cellWidth) : Math.ceil((block.outerWidth() + 8) / cellWidth);
                                                //zj.outerWidth(lcount * cellWidth - 8);
                                                var lcount = (block.outerWidth() + 2) % cellWidth < cellWidth / 2 ? Math.floor((block.outerWidth() + 2) / cellWidth) : Math.ceil((block.outerWidth() + 2) / cellWidth);
                                                zj.outerWidth(lcount * cellWidth - 2);
                                                data1.helper.css("left", lf);
                                            }
                                        } else {
                                            zj.outerWidth(data1.originalSize.width);
                                            data1.helper.css('left', data1.originalPosition.left);
                                        }
                                    } else {
                                        if (!eachItemsLR(1, zj[0], mostTouchDom.dom, 1, (thisLeft + zjWidth + thisWidth), zj.parent())) {
                                            zj.css('left', ($(mostTouchDom.dom).position().left + $(mostTouchDom.dom).outerWidth()));
                                        } else {
                                            zj.outerWidth(data1.originalSize.width);
                                            data1.helper.css('left', data1.originalPosition.left);
                                        }
                                    }
                                } else {
                                    //var count = (block.outerWidth() + 8) % cellWidth < cellWidth / 2 ? Math.floor((block.outerWidth() + 8) / cellWidth) : Math.ceil((block.outerWidth() + 8) / cellWidth);

                                    block.width(zjWidth);
                                }
                                updateDataAndPosition(div, block, cellWidth, startDate);
                                if (callback) {
                                    callback(block.data("block-data"));
                                }
                            }
                        });
                    }
                });
            }

            function bindBlockDrag(div, cellWidth, startDate, callback) {
                jQuery("div.ganttview-block", div).each(function () {
                    if (jQuery(this).data("block-data").options.draggable) {
                        jQuery(this).draggable({
                            axis: "x",
                            stop: function (data, data1) {
                                //拖拽任务对象
                                var zj = data1.helper;
                                var mostTouchDom = getMostTouchDom(zj);
                                if (mostTouchDom != false) {
                                    if (mostTouchDom.touchRange >= 0) {
                                        if (!eachItemsLR(0, zj[0], mostTouchDom.dom, 0, ($(mostTouchDom.dom).position().left - zj.outerWidth()))) {
                                            zj.css('left', ($(mostTouchDom.dom).position().left - zj.outerWidth()));
                                        } else {
                                            zj.css('left', data1.originalPosition.left);
                                        }
                                    } else {
                                        if (!eachItemsLR(0, zj[0], mostTouchDom.dom, 1, ($(mostTouchDom.dom).position().left +
                                            $(mostTouchDom.dom).outerWidth() + zj.outerWidth()), zj.parent())) {
                                            zj.css('left', ($(mostTouchDom.dom).position().left + $(mostTouchDom.dom).outerWidth()));
                                        } else {
                                            zj.css('left', data1.originalPosition.left);
                                        }
                                    }
                                }
                                var block = jQuery(this);
                                var container = jQuery("div.ganttview-block-container", div);
                                var scroll = container.scrollLeft();
                                var offset = block.offset().left - container.offset().left - 1 + scroll;
                                offset = offset >= 0 ? offset : 0;
                                //var left = Math.floor((offset % cellWidth < cellWidth / 2) ? Math.floor(offset / cellWidth) : Math.ceil(offset / cellWidth)) * cellWidth;
                                var left = offset;
                                var daysFromStart = offset / cellWidth;
                                var newStart = DateUtils.addHours(new Date(startDate), daysFromStart).getTime();
                                var now = new Date().getTime();
                                var diff = newStart - now;
                                if (diff < 360000) {
                                    alert("不能安排一个小时之前的任务！");
                                    block.css('left', data1.originalPosition.left);
                                    return;
                                } else {
                                    block.css('left', "");
                                    //block.css('left', left + 4 + 'px');
                                    block.css('left', left + 'px');
                                }
                                updateDataAndPosition(div, block, cellWidth, startDate);
                                if (callback) {
                                    callback(block.data("block-data"));
                                }
                            }
                        });
                    }
                });
            }


            function updateDataAndPosition(div, block, cellWidth, startDate) {
                var container = jQuery("div.ganttview-block-container", div);
                var scroll = container.scrollLeft();
                var offset = block.offset().left - container.offset().left - 1 + scroll;

                // Set new start date
                var daysFromStart = Math.floor(offset / cellWidth);
                var newStart = DateUtils.addHours(new Date(startDate), daysFromStart);
                block.data("block-data").start = newStart;

                // Set new end date
                var width = block.outerWidth();
                var numberOfDays = Math.floor(width / cellWidth) + 1;
                var newEnd = DateUtils.addHours(new Date(newStart), numberOfDays);
                block.data("block-data").end = newEnd;
                jQuery("div.ganttview-block-text", block).text(numberOfDays / 2 + "小时");
                updateGanttOptsDatas(block, newStart, newEnd);
            }
            function removeBlockDate(div, block) {
                var blockIndex = ganttView.find(".ganttview-block").index(block);
                var count = 0;
                for (var i = 0; i < ganttOpts.data.length; i++) {
                    for (var j = 0; j < ganttOpts.data[i].series.length; j++) {
                        if (ganttOpts.data[i].series[j]._empty) {
                            continue;
                        }
                        if (count === blockIndex) {
                            //ganttOpts.data[i].series[j]={};
                            delete ganttOpts.data[i].series[j];

                            var ser = ganttOpts.data[i].series.filter(function (value) {
                                return !value._empty;
                            });
                            ganttOpts.data[i].series = ser;
                            return;
                        }

                        count++;
                    }
                }
            }
            function updateGanttOptsDatas(block, newStart, newEnd) {
                var blockIndex = ganttView.find(".ganttview-block").index(block);
                var count = 0;
                for (var i = 0; i < ganttOpts.data.length; i++) {
                    for (var j = 0; j < ganttOpts.data[i].series.length; j++) {
                        if (ganttOpts.data[i].series[j]._empty) {
                            continue;
                        }
                        // count ++;
                        if (count === blockIndex) {
                            ganttOpts.data[i].series[j].start = newStart;
                            ganttOpts.data[i].series[j].end = newEnd;
                            //return;
                        }
                        count++;
                    }
                }
            }

            return {
                apply: apply
            };
        };
        /*
         * 	//遍历检查：除了自身身和接触对象外，是否有其他元素会在吸附后产生重叠。
         * type:0:为拖拽,1:为拉伸
         * item:自身元素对象.
         * target:当前与自身元素接触目标元素对象.
         * lr:值为0:自身吸附在目标元素的左侧. 值为1:自身吸附在目标元素的右侧.
         * can:假设吸附状态形成结束以后,自身元素的left值.(左吸附)。自身元素的right值.(右吸附)。
         * box:当前的tr容器元素对象.
         */
        function eachItemsLR(type, item, target, lr, can, box) {
            var bool = false;
            var boxRight = (typeof (box) == "undefined") ? false : box.width();
            $(item).parent().find('.ganttview-block').each(function () {
                if (item != this && target != this) {
                    if (lr == 0) {
                        //将要左吸附，对假设已完成左吸附的元素做容器类的重叠检测
                        bool = checkPoint(type ? ($(item).position().left) : ($(target).position().left - $(item).outerWidth()),
                            ($(target).position().left),
                            $(this).position().left,
                            ($(this).position().left + $(this).outerWidth()));

                        if (bool) {
                            return false;
                        }
                    } else {
                        //将要右吸附，对假设已完成右吸附的元素做容器类的重叠检测
                        bool = checkPoint(($(target).position().left + $(target).outerWidth()),
                            ($(target).position().left + $(target).outerWidth() + $(item).outerWidth()),
                            ($(this).position().left),
                            ($(this).position().left + $(this).outerWidth()));
                        if (bool) {
                            return false;
                        }
                    }
                    if (bool) {
                        return false;
                    }
                }
            });
            //如果为true则需要重置
            return bool || (can < 0) || (boxRight === false ? false : (can > box.width()));
        }
        function getMostTouchDom(zj) {
            var choseList = [];
            zj.parent().find('.ganttview-block').each(function () {
                if (zj[0] != this) {
                    var result = situation(zj, $(this));
                    if (result[0] < 4 && result[0] >= 0) {
                        choseList.push({
                            touchAbs: Math.abs(result[1]),
                            dom: this,
                            touchRange: result[1]
                        });
                    }
                }
            });
            if (choseList.length == 0) {
                return false;
            }
            choseList.sort(function (a, b) {
                return a.touchAbs - b.touchAbs;
            });
            return choseList[0];
        }
        function situation(a, b) {
            var aLeft = a.position().left;
            var aRight = aLeft + a.outerWidth();
            var bLeft = b.position().left;
            var bRight = bLeft + b.outerWidth();

            var l_r = ((bRight + bLeft) - (aRight + aLeft));
            if (aLeft >= bLeft && aRight <= bRight) {
                //自己被包含
                return [0, l_r];
            }
            if (bLeft >= aLeft && bRight <= aRight) {
                //自己包含了别人
                return [1, l_r];
            }
            if (((bLeft >= aLeft && bLeft < aRight) && (bRight > aRight)) || ((aRight > bLeft && aRight <= bRight) && (aLeft < bLeft))) {
                //自己的右边和别人有重叠
                return [2, l_r];
            }
            if (((bRight > aLeft && bRight <= aRight) && (bLeft < aLeft)) || ((aLeft >= bLeft && aLeft < bRight) && (aRight > bRight))) {
                //自己的左边和别人有重叠
                return [3, l_r];
            }
            //自己和别人没有任何重叠
            return [4, l_r];
        }
        function checkPoint(aLeft, aRight, bLeft, bRight) {
            return (aLeft >= bLeft && aRight <= bRight) ||
                (bLeft >= aLeft && bRight <= aRight) ||
                (((bLeft >= aLeft && bLeft < aRight) && (bRight > aRight)) || ((aRight > bLeft && aRight <= bRight) && (aLeft < bLeft))) ||
                (((bRight > aLeft && bRight <= aRight) && (bLeft < aLeft)) || ((aLeft >= bLeft && aLeft < bRight) && (aRight > bRight)));
        }
        var DateUtils = {
            addDays: function (date, number) {
                var adjustDate = new Date(date.getTime() + 24 * 60 * 60 * 1000 * number);
                return adjustDate;
            },
            addHours: function (date, number) {
                var adjustDateHours = new Date(date.getTime() + 30 * 60 * 1000 * number);
                return adjustDateHours;
            },
            daysBetween: function (start, end) {
                if (!start || !end) {
                    return 0;
                }
                if (new Date(start).getFullYear() === 1901 || new Date(end).getFullYear() === 8099) {
                    return 0;
                }
                var count = 0, date = new Date(start);
                while (date.getTime() < new Date(end).getTime()) {
                    count = count + 1;
                    date = DateUtils.addDays(date, 1);
                }
                return count;
            },
            hoursBetween: function (start, end) {
                if (!start || !end) {
                    return 0;
                }
                if (new Date(start).getFullYear() === 1901 || new Date(end).getFullYear() === 8099) {
                    return 0;
                }
                var count = 0, startdate = new Date(start), enddate = new Date(end);
                if (Math.abs(startdate.getTime() - enddate.getTime()) < 1000 * 60) {
                    return 0;
                } else {
                    while (startdate.getTime() < enddate.getTime()) {
                        count = count + 1;
                        startdate = DateUtils.addHours(startdate, 1);
                    }
                }

                return count;
            },
            isWeekend: function (date) {
                return date.getDay() % 6 == 0;
            },
            getStartTime: function () {
                var nowhours = new Date().getHours();
                var minStart = new Date();
                if (nowhours >= 8) {
                    minStart.setHours(8);
                    minStart.setMinutes(0);
                    minStart.setSeconds(0);
                    minStart.setMilliseconds(0);
                } else {
                    var nowdate = new Date().getDate() - 1;
                    minStart.setDate(nowdate);
                    minStart.setHours(8);
                    minStart.setMinutes(0);
                    minStart.setSeconds(0);
                    minStart.setMilliseconds(0);
                }
                return minStart;
            },

            getBoundaryDatesFromData: function (data, minDays) {
                //最早开始 需要定位到每天08:00
                var minStart = DateUtils.getStartTime();
                var initStart = DateUtils.getStartTime();
                var maxEnd = new Date();
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data[i].series.length; j++) {
                        if (!data[i].series[j].start || !data[i].series[j].end) {
                            continue;
                        }
                        var start = new Date(data[i].series[j].start);
                        var end = new Date(data[i].series[j].end);
                        if (i == 0 && j == 0) {
                            minStart = new Date(start);
                            maxEnd = new Date(end);
                        }
                        if (minStart.getTime() > start.getTime()) {
                            minStart = new Date(start);
                        }
                        if (maxEnd.getTime() < end.getTime()) {
                            maxEnd = new Date(end);
                        }
                    }
                }
                //if (DateUtils.daysBetween(minStart, maxEnd) < minDays) {
                //    maxEnd = DateUtils.addDays(minStart, minDays);
                //}
                if (DateUtils.hoursBetween(minStart, maxEnd) < 48) {
                    maxEnd = DateUtils.addHours(initStart, 48 * minDays);
                }
                return [minStart, maxEnd];
            }
        };

}