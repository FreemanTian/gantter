//初始信息
var ganttData = [
    {
        id: 1, name: "name1",
        series: [

            //{ name: "任务2", start: '2019/3/12 10:00:00', end: '2019/3/12 14:00:00' ,flag:"lock",options: { color: 'rgba(153, 104, 51, .8)'} },

        ]
    },
    {
        id: 2, name: "name2", series: [
        //{ name: "任务2", start: '2019/3/12 13:00:00', end: '2019/3/12 14:00:00' ,flag:"on",options: { color: 'rgba(242, 104, 51, .8)'} },
    ]
    },
    {
        id: 3, name: "name3", series: [
        //{ name: "任务3", start: '2018/11/22 12:00:00', end: '2018/11/22 13:00:00', options: {draggable: false, resizable: false, color: '#eee'}}
    ]
    },
    {
        id: 4, name: "name4", series: [
        //{ name: "任务1", start: '2018/01/01', end: '2018/01/03' }
    ]
    },
    {
        id: 5, name: "name5", series: [
        //{ name: "任务1", start: '2018/01/16', end: '2018/01/24' }
    ]
    },
    {
        id: 6, name: "name6", series: [
        //{ name: "任务1", start: '2018/01/08', end: '2018/01/17' }
    ]
    },
    {
        id: 7, name: "name7", series: [
        //{ name: "任务1", start: '2018/01/25', end: '2018/02/03' }
    ]
    },
    {
        id: 8, name: "name8", series: [
        //{ name: "任务1", start: '2018/01/08', end: '2018/01/12' }
    ]
    }
];
//任务List
var divData = [
    {
        "name": "任务1",
        "start": "",
        "end": "",
        "flag":"on"
    },
    {
        "name": "任务2",
        "start": "",
        "end": "",
        "flag":"lock"
    },
    {
        "name": "任务3",
        "start": "",
        "end": "",
    },
    {
        "name": "任务4",
        "start": "",
        "end": "",
    },
    {
        "name": "任务5",
        "start": "",
        "end": "",
    },
    {
        "name": "任务6",
        "start": "",
        "end": "",
    },
    {
        "name": "任务7",
        "start": "",
        "end": "",
    },
    {
        "name": "任务8",
        //"start": "2018/11/23 12:00:00",
        //"end": "2018/11/25 16:00:00",
    },
    {
        "name": "任务9",
        //"start": "2018/11/23 08:00:00",
        //"end": "2018/11/23 09:00:00",
    },
    {
        "name": "任务10",
        "start": "",
        "end": "",
    },
    {
        "name": "任务11",
        "start": "",
        "end": "",
    },
    {
        "name": "任务12",
        "start": "",
        "end": "",
    },

];
//颜色Arr
var taskColor = [
    "#009900",
    "#009966",
    "#009999",
    "#339966",
    "#339999",
    "#3399CC",
    "#33CC00",
    "#33CC33",
    "#009933",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#33FF00",
    "#33FF33",
    "#33FF66",
    "#339933",
    "#33FF99",
    "#33FFCC",
    "#33FFFF",
    "#660000",
    "#660033",
    "#660066",
    "#660099",
    "#990000",
    "#339900",
    "#990066",
    "#990099",
    "#9900CC",
    "#9900FF",
    "#666600",
    "#666633",
    "#3399FF",
    "#666666",
    "#666699",
    "#6666CC",
    "#6666FF",
    "#FF0000",
    "#FF0033",
    "#990033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
];
