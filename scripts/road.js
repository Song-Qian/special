/**
 * Developer    :   SongQian
 * Time         :   2021-02-08
 * Descript     :   A, T, K, Y 路口图形组件
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.road = {}));
}(this, (function (exports) { 
    'use strict';

    var utils = {
        uuid: function() {
            function S4() {
                return (((1+Math.random()) * 0x10000)|0).toString(16).substring(1);
            }
            return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
        },
        calcRadiusAnyPoint: function(ox, oy, r, angle) {
            //计算圆某角度的点位置
            angle |= 0;
            ox |= 0;
            oy |= 0;
            var x = ox + r * Math.cos(angle * Math.PI / 180);
            var y = oy + r * Math.sin(angle * Math.PI / 180);
            return { x: x, y: y };
        },
        calcTriangleSubtenseLen: function(subtense, angle) {
            //计算等腰三角的底边（弦）的长度
            if(isNaN(subtense) || subtense <= 0) {
                throw new Error('三角边长不能 subtense <= 0值')
            }

            if (isNaN(angle) || angle <= 0) {
                return new Error('三角的角度不能 angle <= 0值')
            }
            var oa = (180 - angle) / 2;
            return 2 * subtense * Math.cos(oa * Math.PI / 180);
        },
        calcTriangleHeight: function(c, angle) {
            //计算任意三角形的边（弦）的高
            return Math.sin(angle) * c; 
        },
        calcPointDist: function(a, b) {
            //计算两点距离
            return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
        },
        calcTriangleAngle: function(p1, p2) {
            //计算两点的角度, 0度值在正上方
            var angle = Math.atan2((p2.x - p1.x), (p2.y - p1.y));
            return 180 - (angle * (180 / Math.PI));
        },
        calcLineIntersection: function(p0, p1, p2, p3) {
            //计算两线段的交点
            var A1 = p1.y - p0.y,
			    B1 = p0.x - p1.x,
			    C1 = A1 * p0.x + B1 * p0.y,
			    A2 = p3.y - p2.y,
			    B2 = p2.x - p3.x,
			    C2 = A2 * p2.x + B2 * p2.y,
			    denominator = A1 * B2 - A2 * B1;
            if (denominator == 0) {
                return { x: 0, y: 0 }
            }
            var intersectX = (B2 * C1 - B1 * C2) / denominator,
			intersectY = (A1 * C2 - A2 * C1) / denominator,
			rx0 = (intersectX - p0.x) / (p1.x - p0.x),
			ry0 = (intersectY - p0.y) / (p1.y - p0.y),
			rx1 = (intersectX - p2.x) / (p3.x - p2.x),
			ry1 = (intersectY - p2.y) / (p3.y - p2.y);
            if(((rx0 >= 0 && rx0 <= 1) || (ry0 >= 0 && ry0 <= 1)) && ((rx1 >= 0 && rx1 <= 1) || (ry1 >= 0 && ry1 <= 1))) {
                return {
                    x: intersectX,
                    y: intersectY
                }
            } else {
                return { x: 0, y: 0 };
            }
        }
    }

    //斑马线绘制
    var PedestrianRender = function() {
        var template = [
            "<g :transform=\"'translate(' + Offset.x + ',' + Offset.y + ')'\"  :style=\"{ display: IsNever ? 'none' : 'block'}\" > ",
                "<rect x='0' y='0' width='80' :height='Height' fill='#333' />",
                "<text :x='30' :y='10' text-anchor='end' rotate='-90' transform='rotate(90, 30 10)' font-size='24' fill='rgb(214, 203, 10)' v-show='(IsShow && !IsNever) && !!UpwardName'>{{ UpwardName }}</text>",
                "<text :x='30' :y='Height + 25' text-anchor='start' rotate='-90' :transform=\"'rotate(90, 30 '+ (Height + 25) +')'\" font-size='24' fill='rgb(214, 203, 10)' v-show='(IsShow && !IsNever) && !!DownName'>{{ DownName }}</text>",
                "<line x1='1.5' x2='1.5' y1='0' :y2='Height' stroke='#fff' stroke-width='3' style='pointer-events:visibleStroke;' @click.capture.stop=\"$emit('on-pedestrian-stop-click', true)\" />",
                "<line x1='78.5' x2='78.5' y1='0' :y2='Height' stroke='#fff' stroke-width='3' style='pointer-events:visibleStroke;' @click.capture.stop=\"$emit('on-pedestrian-stop-click', false)\" />",
                "<line x1='40' x2='40' y1='0' :y2='Height' v-show='IsShow' stroke='#fff' stroke-width='50' stroke-dasharray='8,16' style='pointer-events:visibleStroke;' @click.capture.stop=\"$emit('on-pedestrian-click')\" />",
            "</g>"
        ];
        return template.join("");
    }

    var Pedestrians = Vue.extend({
        template: PedestrianRender.apply(this),
        props: {
            Id: {
                default: '',
                type: String
            },
            X: {
                default: 0,
                type: Number
            },
            Y: {
                default: 0,
                type: Number
            },
            Len: {
                default: 0,
                type: Number
            },
            Width: {
                default: 0,
                type: Number
            },
            UpwardName: {
                default: '',
                type: String
            },
            DownName: {
                default: '',
                type: String
            },
            Area: {
                default: 0,
                type: Number
            },
            IsShow: {
                default: true,
                type: Boolean
            },
            IsNever: {
                default: false,
                type: Boolean
            },
            Height: {
                default: 0,
                type: Number
            },
            Offset: {
                default: { x: 0, y: 0 }
            }
        }
    })

    //分隔线样式
    var IsolationRender = function(){
        var template = [
            "<g>",
                "<line v-if='isSimpleLine' :x1='calcSimpleLinePosition.p1.x' :x2='calcSimpleLinePosition.p2.x' :y1='calcSimpleLinePosition.p1.y' :y2='calcSimpleLinePosition.p2.y' :stroke-dasharray=\"['dotted', 'y-dotted'].indexOf(Type) > -1 ? '20,20' : ''\" :stroke='calcLineColor' stroke-width='3' @click.capture.stop=\"$emit('on-simple-line-click', $event)\" />",
                "<line v-if='isDoubleLine' :x1='calcDoubleLinePosition.top.p1.x' :x2='calcDoubleLinePosition.top.p2.x' :y1='calcDoubleLinePosition.top.p1.y' :y2='calcDoubleLinePosition.top.p2.y' :stroke-dasharray='calcDoublieLineStrokeDasharray[0]' :stroke='calcDoubleLineStrokeColor[0]' :stroke-width='caclDoubleLineStrokeWidth[0]' @click.capture.stop=\"$emit('on-right-line-click', $event)\" />",
                "<line v-if='isDoubleLine' :x1='calcDoubleLinePosition.bottom.p1.x' :x2='calcDoubleLinePosition.bottom.p2.x' :y1='calcDoubleLinePosition.bottom.p1.y' :y2='calcDoubleLinePosition.bottom.p2.y' :stroke-dasharray='calcDoublieLineStrokeDasharray[1]' :stroke='calcDoubleLineStrokeColor[1]' :stroke-width='caclDoubleLineStrokeWidth[1]' @click.capture.stop=\"$emit('on-left-line-click', $event)\" />",

                "<g v-if='isBarrier' @click.capture.stop=\"$emit('on-barrier-click', $event)\">",
                    "<line v-if=\"['barrier-dashed', 'y-barrier-dashed'].indexOf(Type) > -1\" x1='0' :x2='Length' :y1='Reverse ? 14 : 1' :y2='Reverse ? 14 : 1' :stroke='calcBarrierColor[0]' :stroke-dasharray=\"['barrier-dashed', 'y-barrier-dashed'].indexOf(Type) > -1 ? '20,20' : ''\" stroke-width='3' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 5 : 10' :y2='Reverse ? 5 : 10' stroke='#fff' stroke-width='10' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 5 : 10' :y2='Reverse ? 5 : 10' stroke='#333' :stroke-dasharray='calcBarrierDasharray[0]'  stroke-width='8' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 5 : 10' :y2='Reverse ? 5 : 10' stroke='#333' :stroke-dasharray='calcBarrierDasharray[1]'  stroke-width='6' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 3 : 12' :y2='Reverse ? 3 : 12' stroke='#333' :stroke-dasharray='calcBarrierDasharray[2]'  stroke-width='3' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 10 : 5' :y2='Reverse ? 10 : 5' :stroke='calcBarrierColor[1]' stroke-width='3' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 1.5 : 13.5' :y2='Reverse ? 1.5 : 13.5' :stroke='calcBarrierColor[1]' stroke-width='3' />",
                "</g>",
                "<rect v-if='isParterre' x='0' y='0' :width='Length' height='15' :stroke-dasharray=\"['parterre-dashed', 'y-parterre-dashed'].indexOf(Type) > -1 ? '20,20' : ''\" :stroke='calcLineColor' stroke-width='3' fill='url(#parterre)' @click.capture.stop=\"$emit('on-parterre-click', $event)\"></rect>",
            "</g>"
        ];
        return template.join("");
    }

    var Isolation = Vue.extend({
        template: IsolationRender.apply(this),
        props : {
            // solid: 白色实线, 
            // dotted: 白色虚线, 
            // y-solid: 黄色实线,
            // y-dotted: 黄色虚线, 
            // y-double-solid: 双黄实线, 
            // y-double-dashed: 双黄实虚线,

            // y-w-dashed: 黄色实线+白色虚线,
            // y-w-double-solid: 黄白双实线,
            // y-w-double-dashed: 黄白双虚线,
            // w-y-dashed: 白色实线+黄色虚线,
            // w-y-double-solid: 白黄双实线,
            // w-y-double-dashed: 白黄双虚线,

            // barrier: 白线护栏,
            // y-barrier: 黄线护栏
            // barrier-dashed: 白虚线+护栏
            // y-barrier-dashed: 黄虚线+护栏

            // parterre 花坛+白线, 
            // parterre-dashed 花坛+虚线, 
            // y-parterre-solid 花坛+黄线, 
            // y-parterre-dashed 花坛+黄虚线
            Type:  {
                default: 'solid', 
                type : String
            },
            Length: {
                default: 1300,
                type: Number
            },
            Reverse: {
                default: false,
                type: Boolean
            }
        },
        computed : {
            //是否单线
            isSimpleLine: function() {
                var me = this;
                return ["solid", "dotted", "y-solid", "y-dotted"].indexOf(me.Type) > -1;
            },
            //单线绘制定位
            calcSimpleLinePosition: function() {
                var me = this;
                if(me.Reverse) {
                    return { p1 : { x: 0, y: 1.5 }, p2 : { x : me.Length, y: 1.5 } }
                }
                return { p1 : { x: 0, y: 15 - 1.5 }, p2 : { x : me.Length, y: 15 - 1.5 } }
            },
            //实线、虚线颜色
            calcLineColor: function() {
                var me = this;
                var yellow = ["y-solid", "y-dotted", "y-double-solid", "y-double-dashed", "y-parterre-solid", "y-parterre-dashed"];
                if (yellow.indexOf(me.Type) > -1) {
                    return "#D6CB0A";
                }
                return "#fff";
            },
            //是否双线
            isDoubleLine: function() {
                var me = this;
                return ["y-double-solid", "y-double-dashed", "y-w-dashed", "y-w-double-solid", "y-w-dotted", "y-w-double-dashed", "w-y-dashed", "w-y-dotted", "w-y-double-solid", "w-y-double-dashed"].indexOf(me.Type) > -1;
            },
            //双线绘制定位
            calcDoubleLinePosition: function() {
                var me = this;
                if(me.Reverse) {
                    return {
                        top: { p1 : { x: 0, y: 2.5 }, p2 : { x : me.Length, y: 2.5 } },
                        bottom:  { p1 : { x: 0, y: 9.5 }, p2 : { x : me.Length, y: 9.5 } },
                    }
                }

                return {
                    top: { p1 : { x: 0, y: 15 - 9.5 }, p2 : { x : me.Length, y: 15 - 9.5 } },
                    bottom: { p1 : { x: 0, y: 15 - 2.5 }, p2 : { x : me.Length, y: 15 - 2.5 } }
                }
            },
            //计算双线线宽
            caclDoubleLineStrokeWidth: function() {
                var me = this;
                if(me.Type === "y-double-solid" || me.Type === "y-double-dashed") {
                    return [3, 3];
                }
                var line = ["y-w-dashed", "y-w-dotted", "y-w-double-solid", "y-w-double-dashed", "w-y-dashed", "w-y-dotted", "w-y-double-solid", "w-y-double-dashed"];
                if(me.Reverse && line.indexOf(me.Type) > -1) {
                    return [5, 3];
                }

                if (!me.Reverse && line.indexOf(me.Type) > -1) {
                    return [3, 5];
                }

                return [3, 3]
            },
            //计算双线绘制样式
            calcDoublieLineStrokeDasharray: function() {
                var me = this;
                var dasharray = { 
                    'y-double-solid' : ['', ''], 
                    'y-double-dashed': ['20,20', ''], 
                    'y-w-dashed' : ['20,20', ''], 
                    'y-w-dotted' : ['', '20,20'], 
                    'y-w-double-solid' : ['', ''], 
                    'y-w-double-dashed' : ['20,20', '20,20'], 
                    'w-y-dashed': ['20,20', ''], 
                    'w-y-dotted' : ['', '20,20'], 
                    'w-y-double-solid' : ['', ''], 
                    'w-y-double-dashed' : ['20,20', '20,20'] 
                };
                if (me.isDoubleLine && me.Reverse) {
                    return dasharray[me.Type].reverse();
                }

                if (me.isDoubleLine && !me.Reverse) {
                    return dasharray[me.Type];
                }
                return ['', '']
            },
            //计算双线颜色
            calcDoubleLineStrokeColor: function() {
                var me = this;
                var color = { 
                    'y-double-solid' : ['#D6CB0A', '#D6CB0A'], 
                    'y-double-dashed': ['#D6CB0A', '#D6CB0A'], 
                    'y-w-dashed' : ['#fff', '#D6CB0A'], 
                    'y-w-dotted' : ['#fff', '#D6CB0A'], 
                    'y-w-double-solid' : ['#fff', '#D6CB0A'], 
                    'y-w-double-dashed' : ['#fff', '#D6CB0A'], 
                    'w-y-dashed': ['#D6CB0A', '#fff'], 
                    'w-y-dotted': ['#D6CB0A', '#fff'],
                    'w-y-double-solid' : ['#D6CB0A', '#fff'], 
                    'w-y-double-dashed' : ['#D6CB0A', '#fff'] 
                };
                if (me.isDoubleLine && me.Reverse) {
                    return color[me.Type].reverse();
                }

                if(me.isDoubleLine && !me.Reverse) {
                    return color[me.Type];
                }
                return ['#fff', '#fff'];
            },
            //是否护栏
            isBarrier: function() {
                var me = this;
                return ["barrier", "y-barrier", "barrier-dashed", "y-barrier-dashed"].indexOf(me.Type) > -1;
            },
            //计算护栏绘制点
            calcBarrierDasharray: function() {
                var me = this;
                var d = me.Length / 11;
                var dash = ((((d - 8) / 25) * 100) >> 0) / 100;
                var dasharray = new Array(25).fill(dash);
                dasharray.unshift(10, 4);
                dasharray[dasharray.length] = 4;
                return [
                    [10, d >> 0].join(","),
                    dasharray.join(","),
                    [10, 4, d - 8 >> 0, 4].join(",")
                ]
            },
            //计算护栏颜色
            calcBarrierColor: function() {
                var me = this;
                var color = ["#fff", "#fff"];
                if (me.Type === "y-barrier-dashed") {
                    color[0] = "#D6CB0A";
                }

                if (me.Type === "y-barrier") {
                    color[1] = "#D6CB0A";
                }
                return color;
            },
            //是否花坛
            isParterre: function() {
                var me = this;
                return ["parterre", "parterre-dashed", "y-parterre-solid", "y-parterre-dashed"].indexOf(me.Type) > -1;
            }
        }
    })

    var LaneTextRender = function () {
        return [
            "<g :transform='calcMatrix'>",
                "<line v-show='Line' x1='2.5' x2='2.5' y1='0' y2='120' stroke-dasharray='10,5' :stroke='Color' stroke-width='5' :fill='Color' />",
                "<line v-show='Line' x1='47.5' x2='47.5' y1='0' y2='120' stroke-dasharray='10,5' :stroke='Color' stroke-width='5' :fill='Color' />",
                "<text x='0' y='0' :fill='Color' text-anchor='start' rotate='-90' transform='rotate(90 25,60) translate(-10, 75)' :textLength='120' style='font-family: Times New Roman;font-size: 30px;'>{{ Value }}</text>",
            "</g>"
        ].join("")
    }

    var LaneText = Vue.extend({
        template: LaneTextRender.apply(this),
        model: {
            prop: "value",
            event : "input"
        },
        props: {
            Width: {
                default: 50,
                type: Number
            },
            Height: {
                default: 120,
                type: Number
            },
            Line: {
                default: false,
                type: Boolean
            },
            Value: {
                default: '',
                type: String
            },
            Color: {
                default: '',
                type: String
            },
            rotate: {
                default: 0,
                type: Number
            },
            X: {
                default: 0,
                type: Number
            },
            Y: {
                default: 0,
                type: Number
            }
        },
        computed: {
            calcMatrix: function () {
                var me = this;
                var ws = me.Width / 50;
                var hs = me.Height / 120;
                var m1 = (Math.cos(me.rotate * Math.PI / 180) * ws).toFixed(6);
                var m2 = (Math.sin(me.rotate * Math.PI / 180) * ws).toFixed(6);
                var m3 = (-1 * (Math.sin(me.rotate * Math.PI / 180) * hs)).toFixed(6);
                return "matrix(" + m1 + "," + m2 + "," + m3 + "," + m1 + "," + me.X + "," + me.Y + ")";
            }
        }
    })

    //LaneMark
    var LaneMarkRender = function() {
        var template = [
            "<g :transform='getMatrix' >",
                "<use :href=\"'#lanemark-'+ Mark\" @click.capture.stop=\"$emit('on-lanemark-click', $event)\" />",
            "</g>"
        ];
        return template.join("")
    }

    var LaneMark = Vue.extend({
        template: LaneMarkRender.apply(this),
        props : {
            Id : {
                default: utils.uuid(),
                type: String
            },
            Mark : {
                default: '',
                type: String
            },
            Index: {
                default : 0,
                type: Number
            },
            Seq : {
                default : 0,
                type: Number
            },
            Reverse: {
                default: false,
                type: Number
            },
            Area : {
                default: 0,
                type: Number
            },
            X : {
                default: 0,
                type : Number
            },
            Y : {
                default: 0,
                type: Number
            }
        },
        computed: {
            getMatrix: function() {
                var me = this;
                var angle = ["non-motorized", "uturn", "right", "straight", "straight-uturn", "straight-right", "straight-left", "left-right", "left", "left-uturn"].indexOf(me.Mark) > -1 && me.Reverse ? 90 : ["pedestrian", "distance", "slow"].indexOf(me.Mark) > -1 && me.Reverse ? 180 : ["non-motorized", "uturn", "right", "straight", "straight-uturn", "straight-right", "straight-left", "left-right", "left", "left-uturn"].indexOf(me.Mark) > -1 ? -90 : 0;
                var scale = me.Area / 200;
                var x = angle === 180 || angle === 90 ? me.X + 200 * scale : me.X;
                var y = angle === -90 || angle === 180 ? me.Y + 200 * scale : me.Y;
                var m1 = (Math.cos(angle * Math.PI / 180) * scale).toFixed(6);
                var m2 = (Math.sin(angle * Math.PI / 180) * scale).toFixed(6);
                var m3 = (-1 * (Math.sin(angle * Math.PI / 180) * scale)).toFixed(6);
                return "matrix("+ m1 +","+ m2 +","+ m3 +","+ m1 +","+ x +","+ y +")";
            }
        }
    })

    //道路绘制
    var LaneRender = function() {
        var template = [
            "<g class='ivsom-lane' :transform=\"'translate('+ X + ',' + Y +')'\">",
                "<g v-if=\"['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(Type) === -1\">",
                    "<rect x='0' y='0' width='1300' :height='Width' :fill=\"LaneType !== 'non-motorized' && Privileged ? '#9D1B87' : '#333'\" @click.capture.stop=\"$emit('on-lane-select', $event)\" />",
                    "<rect v-for='i in calcMarkTotal' v-show='calcLaneMarkVisible(i)' :x='calcFirstMarkArea(i).x' :y='calcFirstMarkArea(i).y' :width='calcFirstMarkArea(i).width' :height='calcFirstMarkArea(i).height' class='ivsom-lane-mark' :fill=\"LaneType !== 'non-motorized' && Privileged ? '#9D1B87' : '#333'\" stroke='#fff' stroke-width='1' stroke-dasharray='5,5' @click.capture.stop=\"$emit('on-lane-mark-select', $event, i - 1)\" />",
					"<text v-for='i in calcMarkTotal' v-show='calcLaneMarkVisible(i)' :x='calcFirstMarkArea(i).x + calcFirstMarkArea(i).width / 2' :y='calcFirstMarkArea(i).y + calcFirstMarkArea(i).height * 0.6' text-anchor='middle' fill='#fff'>{{ Reverse ? 12 - i + 1 + '#' : i + '#'}}</text>",
                    "<rect v-for='i in calcMarkTotal' v-show='calcLaneMarkVisible(calcMarkTotal + calcMarkTotal - i + 1)' :x='calcLastMarkArea(i).x' :y='calcLastMarkArea(i).y' :width='calcLastMarkArea(i).width' :height='calcLastMarkArea(i).height' class='ivsom-lane-mark' :fill=\"LaneType !== 'non-motorized' && Privileged ? '#9D1B87' : '#333'\" stroke='#fff' stroke-width='1' stroke-dasharray='5,5' @click.capture.stop=\"$emit('on-lane-mark-select', $event, calcMarkTotal + calcMarkTotal - i)\" />",
                    "<text v-for='i in calcMarkTotal' v-show='calcLaneMarkVisible(calcMarkTotal + calcMarkTotal - i + 1)' :x='calcLastMarkArea(i).x + calcLastMarkArea(i).width / 2' :y='calcLastMarkArea(i).y + calcLastMarkArea(i).height * 0.6' text-anchor='middle' fill='#fff'>{{ Reverse ? (12 - (calcMarkTotal + calcMarkTotal - i)) + '#' : calcMarkTotal + calcMarkTotal - i + 1 + '#' }}</text>",
					"<lane-mark v-for='(item, i) in calcLaneMark' :x='calcMarkPosition(item).x' :y='calcMarkPosition(item).y' :id='item.id' :mark='item.mark' :seq='item.seq' :area='Math.min(50, Width - 10)' :reverse='Reverse' @on-lanemark-click=\"$emit('on-lane-mark-click', arguments[0], i)\"></lane-mark>",
                    "<rect v-for='i in calcParkTotal' :x='Reverse ? ((i - 1) * 20) : 1300 - (i * 20)' :y='Reverse ? Width - 10 : 0' width='20' height='10' :fill=\"LaneType !== 'non-motorized' && Privileged ? '#9D1B87' : '#333'\" stroke='#fff' @click.capture.stop=\"$emit('on-lane-park-click', $event)\" />",
                    "<lane-text v-if='!!calcText' :line='!!calcText && Bus' :x='calcText.x' :y='calcText.y' :width='Park ? Math.min(50, Width - 10) : Math.min(50, Width)' :height='120' :color=\"Bus ? '#D6CB0A' : '#fff'\" :value='calcText.text' :rotate='Reverse ? 90 : -90'></lane-text>",
                    "<g v-for='i in calcLaneSlow.total' :key='i'>",
                        "<line :x1='calcSlowDist(i)' :x2='calcSlowDist(i)' y1='0' :y2='Width' stroke='#fff' stroke-width='2' @click.capture.stop=\"$emit('on-lane-slowline-click', $event, i - 1)\" />",
                        "<line :x1='calcSlowDist(i) + 4' :x2='calcSlowDist(i) + 4' y1='0' :y2='Width' stroke='#fff' stroke-width='2' @click.capture.stop=\"$emit('on-lane-slowline-click', $event, i - 1)\" />",
                        "<line :x1='calcSlowDist(i) + 8' :x2='calcSlowDist(i) + 8' y1='0' :y2='Width' stroke='#fff' stroke-width='2' @click.capture.stop=\"$emit('on-lane-slowline-click', $event, i - 1)\" />",
                    "</g>",
                "</g>",
                "<isolation ",
                    "v-if='HasBoundary' ",
                    ":type='Type' ",
                    ":transform=\"calcIsolationPosition\" ",
                    ":length='1300' ",
                    ":reverse='Reverse' ",
                    "@on-simple-line-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'none')\" ",
                    "@on-right-line-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'right')\" ",
                    "@on-left-line-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'left')\" ",
                    "@on-barrier-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'none')\" ",
                    "@on-parterre-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'none')\" ",
                    "></isolation>",
                "<line v-for='(item, i) in calcLaneMark' v-show=\"['uturn', 'straight-uturn', 'left-uturn'].indexOf(item.mark) > -1 && ['solid', 'y-solid', 'y-double-solid', 'y-w-double-solid', 'w-y-double-solid', 'parterre', 'y-parterre-solid'].indexOf(Type) > -1\" :x1='calcMarkPosition(item).x' :x2='calcMarkPosition(item).x + Math.min(50, Width - 10)' :y1='!Reverse ? Width : 0' :y2='!Reverse ? Width : 0' stroke-dasharray='5,5' stroke='#333' :stroke-width='calcUturnGap.width' :transform='calcUturnGap.transform' />",
            "</g>"
        ];
        return template.join("");
    }

    var Lane = Vue.extend({
        template: LaneRender.apply(this),
        inject: ["u_slow", "d_slow", "isUpwardPenalty", "isDownPenalty"],
        props: {
            Id: {
                default: '',
                type: String
            },
            Type: {
                default: 'solid',
                type: String
            },
            LaneType: {
                default: 'primary',
                type: String
            },
            HasBoundary: {
                default: true,
                type: Boolean
            },
            Park: {
                default: false,
                type: Boolean
            },
            ParkTotal: {
                default: 1,
                type: Number
            },
            Bus: {
                default: false,
                type: Boolean
            },
            Privileged: {
                default: false,
                type: Boolean
            },
            Text: {
                default: '',
                type: String
            },
            Lanemark: {
                default: [],
                type: Array
            },
            Slow: {
                default: null,
                type: Object
            },
            X: {
                default: 0,
                type: Number
            },
            Y: {
                default: 0,
                type: Number
            },
            Reverse: {
                default: false,
                type: Boolean
            },
            Width: {
                default: 0,
                type: Number
            }
        },
        computed: {
            calcIsolationPosition: function () {
                var me = this;
                var x = 0, y = ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(me.Type) === -1 ? me.Width - 15 : 0;
                if (me.Reverse) {
                    return "translate(0,0)";
                }
                return "translate(" + x + "," + y + ")";
            },
            calcMarkTotal: function () {
                var me = this;
                if (me.LaneType === 'non-motorized') {
                    return 1;
                }
                return 6;
            },
            calcParkTotal: function () {
                var me = this;
                if (me.Park) {
                    return me.ParkTotal > 15 ? 15 : me.ParkTotal;
                }
                return 0;
            },
            calcText: function () {
                var me = this;
                if (!!me.Text || me.Bus) {
                    var x = me.Reverse ? 120 : 1300 - 120;
                    var offset = Math.min(50, me.Width - 10);
                    var y = me.Reverse ? (me.Width - Math.min(50, me.Width - 10)) / 2 : (me.Width - Math.min(50, me.Width - 10)) / 2 + offset;
                    var text = me.Bus ? "公交车站" : me.Text.substr(0, 8);
                    return { x: x, y: y, text: text.split('').reverse().join('') }
                }
                return null;
            },
            calcUturnGap: function () {
                var me = this;
                if (['y-double-solid', 'w-y-double-solid', 'y-w-double-solid'].indexOf(me.Type) > -1) {
                    return { width: 13, transform: !me.Reverse ? 'translate(0, -5)' : 'translate(0, 5)' }
                }
                return { width: 5, transform: !me.Reverse ? 'translate(0, -1)' : 'translate(0, 1)' }
            },
            calcLaneMark: function () {
                var me = this;
                if (me.LaneType === 'non-motorized') {
                    return me.Lanemark && me.Lanemark.filter(function (it, n) { return it.mark === 'non-motorized' }).slice(0, 2) || [];
                }
                return me.Lanemark;
            },
            calcLaneSlow: function () {
                var me = this;
                if (me.LaneType !== 'non-motorized' && ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(me.Type) === -1 && me.Slow && me.Slow.isShow) {
                    me.Slow.total = me.Slow.total || 0;
                    return me.Slow;
                }
                me.Slow = { id: me.Slow && me.Slow.id || '', isShow: false, total: 0 };
                return me.Slow;
            }
        },
        components: {
            "Isolation": Isolation,
            "LaneMark": LaneMark,
            "LaneText" : LaneText
        },
        methods: {
            calcFirstMarkArea: function (i) {
                var me = this;
                var w = (1300 - 80) / 2;
                var diff = me.calcText && me.calcText.text && me.Reverse ? 120 : 0;
                var penaltyWidth = !me.Reverse && me.isUpwardPenalty ? 80 : 0;
                w -= diff;
                w -= penaltyWidth;
                var dist = w / 6;
                var dw = Math.min(50, me.Width - 10);
                var x = me.Reverse ? diff + (dist - dw) / 2 + ((i - 1) * dist) : (dist - dw) / 2 + ((i - 1) * dist);
                var y = (me.Width - Math.min(50, me.Width - 10)) / 2;
                return { x: x, y: y, width: dw, height: dw };
            },
            calcLastMarkArea: function (i) {
                var me = this;
                var w = (1300 - 80) / 2;
                var diff = me.calcText && me.calcText.text && !me.Reverse ? 120 : 0;
                var penaltyWidth = me.Reverse && me.isDownPenalty ? 80 : 0;
                w -= diff;
                w -= penaltyWidth;
                var dist = w / 6;
                var dw = Math.min(50, me.Width - 10);
                var after = me.calcText && me.calcText.text && !me.Reverse ? 120 + ((dist - dw) / 2 + dw) : ((dist - dw) / 2 + dw);
                var y = (me.Width - Math.min(50, me.Width - 10)) / 2;
                return { x: 1300 - after - ((i - 1) * dist), y: y, width: dw, height: dw };
            },
            calcMarkPosition: function (mark) {
                var me = this;
                var y = (me.Width - Math.min(60, me.Width - 10)) / 2;
                var w = (1300 - 80) / 2;
                var dist = w / 6;
                var dw = Math.min(50, me.Width - 10);
                if (me.LaneType === 'non-motorized' && mark.mark === 'non-motorized') {
                    var dist_1 = (w - 120) / 6;
                    var dist_2 = w / 6;
                    var isBeforeText = me.calcText && me.calcText.text && me.Reverse;
                    var isAfterText = me.calcText && me.calcText.text && !me.Reverse;
                    var before = isBeforeText ? (dist_1 - dw) / 2 + 120 : (dist_2 - dw) / 2;
                    var after = isAfterText ? (dist_1 - dw) / 2 + dw + 120 : (dist_2 - dw) / 2 + dw;
                    return mark.seq == 1 ? { x : before, y : y } : { x : 1300 - after, y : y };
                }

                if ((mark.seq - 1) < 6) {
                    var diff = me.calcText && me.calcText.text && me.Reverse ? 120 : 0;
                    var penaltyWidth = !me.Reverse && me.isUpwardPenalty ? 80 : 0;
                    w -= diff;
                    w -= penaltyWidth;
                    dist = w / 6;
                    return { x : diff + (dist - dw) / 2 + ((mark.seq - 1) * dist), y : y };
                }
                var diff = me.calcText && me.calcText.text && !me.Reverse ? 120 : 0;
                var penaltyWidth = me.Reverse && me.isDownPenalty ? 80 : 0;
                w -= diff;
                w -= penaltyWidth;
                dist = w / 6;
                return { x : 690 + penaltyWidth + ((dist - 50) / 2) + ((mark.seq - 7) * dist), y : y };
            },
            calcLaneMarkVisible: function(seq) {
                var me = this;
                if(me.Lanemark) {
                    return !me.Lanemark.some(function(it, index) { return it.seq == seq });
                }
                return true;
            },
            calcSlowDist: function (i) {
                var me = this;
                var start = me.Reverse ? 0 : 1300 / 2 + 40;
                start += me.calcText && me.calcText.text && me.Reverse ? 120 : 0;
                var w = (1300 - 80) / 2;
                w -= me.calcText && me.calcText.text ? 120 : 0;
                var dw = w / 6;
                return start + dw + ((i - 1) * 2) * dw;
            }
        }
    })

    var RoadSectionRender = function() {
        var template = [
            "<g>",
                "<image v-for='(flag, n) in getUpwardFlag' :x='calcFlagListPosition(flag, n).x' :y='calcFlagListPosition(flag, n).y' width='120' height='80' style='cursor: pointer;' :xlink:href='flag.icon' @click.capture.stop=\"$emit('on-lane-flag', n, true)\" />",
                "<image v-for='(flag, n) in getDownFlag' :x='calcFlagListPosition(flag, n).x' :y='calcFlagListPosition(flag, n).y' width='120' height='80' style='cursor: pointer;' :xlink:href='flag.icon' @click.capture.stop=\"$emit('on-lane-flag', n, false)\" />",
                // "<text :x='X + 1300 / 2' :y='Y - 10' font-size='24' style='dominant-baseline:middle;text-anchor:middle; font-weight: bold;' fill='#fff'>{{ Pedestrian.name }}</text>",
                "<text :x='X + 1300 / 2' :y='Y + RoadWidth + 15' font-size='24' style='dominant-baseline:middle;text-anchor:middle; font-weight: bold;' fill='#fff'>{{ Name }}</text>",
                "<isolation ",
                    ":length='1300' ",
                    ":transform=\"'translate('+ X + ',' + Y +')'\" ",
                    ":type='calcUpwardIsolation' ",
                    ":reverse='true' ",
                    "@on-simple-line-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'none', true)\" ",
                    "@on-right-line-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'right', true)\" ",
                    "@on-left-line-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'left', true)\" ",
                    "@on-barrier-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'none', true)\" ",
                    "@on-parterre-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'none', true)\" ",
                    "></isolation>",
                "<isolation ",
                    "v-if='Upward.frame && Upward.frame.separation && Upward.frame.separation.isShow' ",
                    ":length='1300' ",
                    ":transform=\"'translate('+ X + ',' + (Y + calcUpwardRoadWidth + (Upward.frame && Upward.frame.separation && Upward.frame.separation.isShow ? 15 : 0)) +')'\" ",
                    ":type='Upward.frame.separation.type' ",
                    ":reverse='!isUnidirectional' ",
                    "@on-simple-line-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'none')\" ",
                    "@on-right-line-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'right')\" ",
                    "@on-left-line-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'left')\" ",
                    "@on-barrier-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'none')\" ",
                    "@on-parterre-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'none')\" ",
                    "></isolation>",
                "<isolation ",
                    ":length='1300' ",
                    ":transform=\"'translate('+ X + ',' + (Y + RoadWidth - 15) +')'\" ",
                    ":type='calcDownIsolation' ",
                    ":reverse='false' ",
                    "@on-simple-line-click=\"$emit('on-road-boundary-click', arguments[0], calcDownIsolation, 'none', false)\" ",
                    "@on-right-line-click=\"$emit('on-road-boundary-click', arguments[0], calcDownIsolation, 'right', false)\" ",
                    "@on-left-line-click=\"$emit('on-road-boundary-click', arguments[0], calcDownIsolation, 'left', false)\" ",
                    "@on-barrier-click=\"$emit('on-road-boundary-click', arguments[0], calcDownIsolation, 'none', false)\" ",
                    "@on-parterre-click=\"$emit('on-road-boundary-click', arguments[0], calcDownIsolation, 'none', false)\" ",
                    "></isolation>",
                "<lane ",
                    "v-for='(item, i) in Upward.lane' ",
                    ":x='calcUpwardLanePosition(i).x' ",
                    ":y='calcUpwardLanePosition(i).y' ",
                    ":width='calcUpwardLaneWidth' ",
                    ":reverse='false' :id='item.id' ",
                    ":slow='getUpwardSlow' ",
                    ":type='item.type' ",
                    ":lane-type='item.laneType' ",
                    ":has-boundary='item.hasBoundary' ",
                    ":park='item.park' ",
                    ":park-total='item.parkTotal || 0' ",
                    ":bus='item.bus' ",
                    ":privileged='item.privileged' ",
                    ":text='item.text' ",
                    ":lanemark='item.lanemark' ",
                    "@on-lane-select=\"$emit('on-road-lane-section', arguments[0], i, true)\" ",
                    "@on-lane-mark-select=\"$emit('on-road-lanemark-section', arguments[0], i, arguments[1], true)\" ",
                    "@on-lane-mark-click=\"$emit('on-road-lanemark-click', arguments[0], i, arguments[1], true)\" ",
                    "@on-lane-slowline-click=\"$emit('on-road-slowline-click', arguments[0], arguments[1], true)\" ",
                    "@on-lane-park-click=\"$emit('on-road-lanepark-click', arguments[0], i, true)\" ",
                    "@on-lane-isolation-click=\"$emit('on-road-isolation-click', arguments[0], i, arguments[1], arguments[2], true)\" ",
                    "></lane>",
                "<lane ",
                    "v-for='(item, i) in calcDownLane' ",
                    ":x='calcDownLanePosition(i).x' ",
                    ":y='calcDownLanePosition(i).y' ",
                    ":width='calcDownLaneWidth' ",
                    ":reverse='true' ",
                    ":id='item.id' ",
                    ":slow='getDownSlow' ",
                    ":type='item.type' ",
                    ":lane-type='item.laneType' ",
                    ":has-boundary='item.hasBoundary' ",
                    ":park='item.park' ",
                    ":park-total='item.parkTotal || 0' ",
                    ":bus='item.bus' ",
                    ":privileged='item.privileged' ",
                    ":text='item.text' ",
                    ":lanemark='item.lanemark' ",
                    "@on-lane-select=\"$emit('on-road-lane-section', arguments[0], i, false)\" ",
                    "@on-lane-mark-select=\"$emit('on-road-lanemark-section', arguments[0], i, item.laneType === 'non-motorized' ? 1 - arguments[1] : 11 - arguments[1], false)\" ",
                    "@on-lane-mark-click=\"$emit('on-road-lanemark-click', arguments[0], i, item.laneType === 'non-motorized' ? 1 - arguments[1] : 11 - arguments[1], false)\" ",
                    "@on-lane-slowline-click=\"$emit('on-road-slowline-click', arguments[0], arguments[1], false)\" ",
                    "@on-lane-park-click=\"$emit('on-road-lanepark-click', arguments[0], i, false)\" ",
                    "@on-lane-isolation-click=\"$emit('on-road-isolation-click', arguments[0], i, arguments[1], arguments[2], false)\" ",
                    "></lane>",
                "<use href='#penalty' :x='0' :y='0' :transform='calcUpwardPenaltyMatrix'  v-show='Upward && Upward.frame && Upward.frame.penalty && Upward.frame.penalty.isShow' @click.capture.stop=\"$emit('on-lane-penalty', true)\" />",
                "<use href='#penalty' :x='0' :y='0' :transform='calcDownPenaltyMatrix'  v-show='Down && Down.frame && Down.frame.penalty && Down.frame.penalty.isShow' @click.capture.stop=\"$emit('on-lane-penalty', false)\" />",
                "<pedestrians ",
                    ":id='Pedestrian.id' ",
                    ":x='Pedestrian.x' ",
                    ":y='Pedestrian.y' ",
                    ":len='Pedestrian.len' ",
                    ":width='Pedestrian.width' ",
                    ":area='Pedestrian.area' ",
                    ":is-show='true' ",
                    ":is-never='!Pedestrian.isShow' ",
                    ":height='RoadWidth' ",
                    ":offset='{ x: X + 610, y: Y }' ",
                    "@on-pedestrian-stop-click=\"$emit('on-road-pedestrian-stop-click', $event, arguments[0])\" ",
                    "@on-pedestrian-click=\"$emit('on-road-pedestrian-click', $event)\" ",
                    "></pedestrians>",
                "<rect :x='X - 5' :y='(1080 - RoadWidth) / 2' width='1310' :height='Down ? RoadWidth / 2 : RoadWidth' v-show='editState.isUpward && editState.laneIndex == LaneIndex' stroke='red' stroke-width='6' fill='none' stroke-dasharray='10 10'>",
                    "<animate attributeType='css' attributeName='opacity' from='0' to='1' dur='1s' repeatCount='indefinite' />",
                "</rect>",
                "<rect :x='X - 5' :y='1080 / 2' width='1310' :height='RoadWidth / 2' v-show='!editState.isUpward && editState.laneIndex == LaneIndex' stroke='red' stroke-width='6' fill='none' stroke-dasharray='10 10'>",
                    "<animate attributeType='css' attributeName='opacity' from='0' to='1' dur='1s' repeatCount='indefinite' />",
                "</rect>",
            "</g>"
        ];
        return template.join('');
    }
        
    var RoadSection = Vue.extend({
        template: RoadSectionRender.apply(this),
        inject: ['editState'],
        provide: function() {
            var me = this;
            return {
                'isUpwardPenalty': me.Upward && me.Upward.frame && me.Upward.frame.penalty && me.Upward.frame.penalty.isShow,
                'isDownPenalty' : me.Down && me.Down.frame && me.Down.frame.penalty && me.Down.frame.penalty.isShow
            }
        },
        props: {
            Name: {
                default: '',
                type: String
            },
            Upward : {
                default: null,
                type: Object
            },
            Down : {
                default: null,
                type: Object
            },
            FlagList: { 
                default: [],
                type: Array
            },
            Pedestrian: {
                default: null,
                type: Object
            },
            RoadWidth: {
                default: 0,
                type: Number
            },
            X: {
                default: 0,
                type: Number
            },
            Y: {
                default: 0,
                type: Number
            },
            LaneIndex: {
                default: 0,
                type: Number
            }
        },
        computed : {
            //是否单向道
            isUnidirectional: function() {
                var me = this;
                return !me.Down;
            },
            //上行车道路面总宽
            calcUpwardRoadWidth: function() {
                var me = this;
                var w = 0;
                if (me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.isShow) {
                    w = 15;
                }
                
                if (me.Upward.frame && me.Upward.frame.line && me.Upward.frame.line.isShow) {
                    w = 15;
                }

                if (me.Upward.frame && me.Upward.frame.separation && me.Upward.frame.separation.isShow && !me.isUnidirectional) {
                    w += 15 * 0.5;
                }

                if(me.isUnidirectional) {
                    w += 15;
                    return me.RoadWidth - w;
                }

                return me.RoadWidth / 2 - w;
            },
            //上行车道宽度
            calcUpwardLaneWidth: function() {
                var me = this;
                var lane = me.Upward.lane && me.Upward.lane.length;
                if(!lane) {
                    return me.calcUpwardRoadWidth;
                }
                var pLen = me.Upward.lane.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) !== -1 }).length;
                return (me.calcUpwardRoadWidth - pLen * 15) / (lane - pLen);
            },
            //上行车道边界线
            calcUpwardIsolation: function() {
                var me = this;
                var type = me.Upward && me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.type;
                var isShow = me.Upward && me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.isShow;
                var isLine = me.Upward && me.Upward.frame && me.Upward.frame.line && me.Upward.frame.line.isShow;
                if (type === 'prohibit' && isLine && isShow) {
                    return 'y-w-double-solid'
                }

                if (type === 'stay' && isLine && isShow) {
                    return  'y-w-dotted'
                }

                if (type === 'prohibit' && isShow) {
                    return 'y-solid'
                }

                if (type === 'stay' && isShow) {
                    return  'y-dotted'
                }

                if (isLine) {
                    return 'solid'
                }

                return '';
            },
            //下行车道边界线
            calcDownIsolation: function() {
                var me = this;
                var type = (me.Down && me.Down.frame && me.Down.frame.boundary && me.Down.frame.boundary.type) || (!me.Down && me.Upward && me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.type);
                var isShow = (me.Down && me.Down.frame && me.Down.frame.boundary && me.Down.frame.boundary.isShow) || (!me.Down && me.Upward && me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.isShow);
                var isLine = (me.Down && me.Down.frame && me.Down.frame.line && me.Down.frame.line.isShow) || (!me.Down && me.Upward && me.Upward.frame && me.Upward.frame.line && me.Upward.frame.line.isShow);
                if (type === 'prohibit' && isLine && isShow) {
                    return 'y-w-double-solid'
                }

                if (type === 'stay' && isLine && isShow) {
                    return 'y-w-dotted'
                }

                if (type === 'prohibit' && isShow) {
                    return 'y-solid'
                }

                if (type === 'stay' && isShow) {
                    return 'y-dotted'
                }

                if (isLine) {
                    return 'solid'
                }
                
                return '';
            },
            //下行车道路面总宽
            calcDownRoadWidth: function() {
                var me = this;
                var w = 0;
                if (me.Down.frame && me.Down.frame.boundary && me.Down.frame.boundary.isShow) {
                    w = 15;
                }
                
                if (me.Down.frame && me.Down.frame.line && me.Down.frame.line.isShow) {
                    w = 15;
                }

                if (me.Upward.frame && me.Upward.frame.separation && me.Upward.frame.separation.isShow && !me.isUnidirectional) {
                    w += 15 * 0.5;
                }

                if(me.isUnidirectional) {
                    return 0;
                }

                return me.RoadWidth / 2 - w;
            },
            //下行车道宽度
            calcDownLaneWidth: function() {
                var me = this;
                var lane = me.calcDownLane.length;
                if(!lane) {
                    return me.calcDownRoadWidth;
                }
                var pLen = me.Down.lane.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) !== -1 }).length;
                return (me.calcDownRoadWidth - pLen * 15) / (lane - pLen);
            },
            //下行车道数量
            calcDownLane: function() {
                var me = this;
                return !!me.Down ? me.Down.lane : [];
            },
            //计算上行禁区大小
            calcUpwardPenaltyMatrix: function() {
                var me = this;
                var sum = me.Upward.frame && me.Upward.frame.penalty && me.Upward.frame.penalty.occupy || 0;
                var lane = me.Upward.lane && me.Upward.lane.concat([]) || [];
                var i = 0;
                var w = 0;
                if (me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.isShow) {
                    w = 15;
                }
                
                if (me.Upward.frame && me.Upward.frame.line && me.Upward.frame.line.isShow) {
                    w = 15;
                }
                
                if (sum && me.Upward.frame.penalty.occupy > lane.length) {
                    sum = lane.length;
                }

                for (var index in me.Upward.lane) {
                    if (
                        me.Upward.lane[index] && me.Upward.lane[index].laneType !== "non-motorized" && 
                        ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(me.Upward.lane[index].type) === -1
                    ) {
                        i = index;
                        break;
                    }
                }

                var offset = lane.splice(0, i);
                var a = offset.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) !== -1 }).length
                var b = offset.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) === -1 }).length
                w += a * 15 + b * me.calcUpwardLaneWidth;
                var height = lane.splice(0, sum);
                var c = height.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) !== -1 }).length
                var d = height.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) === -1 }).length
                var h = c * 15 + d * me.calcUpwardLaneWidth;

                var m1 = (Math.cos(0 * Math.PI / 180) * 0.2).toFixed(6);
                var m2 = (Math.sin(0 * Math.PI / 180) * 1).toFixed(6);
                var m3 = (-1 * (Math.sin(0 * Math.PI / 180) * 1)).toFixed(6);
                var m4 = (Math.cos(0 * Math.PI / 180) * (h / 400)).toFixed(6);
                return "matrix("+ m1 +","+ m2 +","+ m3 +","+ m4 +","+ (me.X + 530) +","+ (me.Y + w) +")";
            },
            //计算下行禁区大小
            calcDownPenaltyMatrix: function() {
                var me = this;
                if (me.Down) {
                    var sum = me.Down.frame && me.Down.frame.penalty && me.Down.frame.penalty.occupy || 0;
                    var i = 0;
                    var w = 0;
                    if (me.Down.frame && me.Down.frame.boundary && me.Down.frame.boundary.isShow) {
                        w = 15;
                    }
                    
                    if (me.Down.frame && me.Down.frame.line && me.Down.frame.line.isShow) {
                        w = 15;
                    }
                    
                    var lane = me.Down.lane && me.Down.lane.length && me.Down.lane.concat() || [];

                    if (sum && me.Down.frame.penalty.occupy > lane.length) {
                        sum = lane.length;
                    }

                    lane = lane.reverse();
                    for (var index in lane) {
                        if (
                            lane[index] && lane[index].laneType !== "non-motorized"&& 
                            ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(lane[index].type) === -1
                        ) {
                            i = index;
                            break;
                        }
                    }
                    lane = lane.concat([]);
                    var offset = lane.splice(0, i);
                    var a = offset.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) !== -1 }).length
                    var b = offset.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) === -1 }).length
                    w += a * 15 + b * me.calcDownLaneWidth;
                    var height = lane.splice(0, sum);
                    var c = height.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) !== -1 }).length
                    var d = height.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) === -1 }).length
                    var h = c * 15 + d * me.calcDownLaneWidth;

                    var m1 = (Math.cos(180 * Math.PI / 180) * 0.2).toFixed(6);
                    var m2 = (Math.sin(180 * Math.PI / 180) * 1).toFixed(6);
                    var m3 = (-1 * (Math.sin(180 * Math.PI / 180) * 1)).toFixed(6);
                    var m4 = (Math.cos(180 * Math.PI / 180) * (h / 400)).toFixed(6);
                    return "matrix("+ m1 +","+ m2 +","+ m3 +","+ m4 +","+ (me.X + 770) +","+ (me.Y + me.RoadWidth - w) +")";
                }
                return "";
            },
            //获取上行车道减速带
            getUpwardSlow : function() {
                var me = this;
                if (me.Upward && me.Upward.frame && me.Upward.frame.slow && me.Upward.frame.slow.total > 3) {
                    var slow = me.Upward.frame.slow;
                    slow.total = 3;
                    return slow;
                }
                return me.Upward.frame && me.Upward.frame.slow || null;
            },
            //获取下行车道减速带
            getDownSlow : function() {
                var me = this;
                if (me.Down && me.Down.frame && me.Down.frame.slow && me.Down.frame.slow.total > 3) {
                    var slow = me.Down.frame.slow;
                    slow.total = 3;
                    return slow;
                }
                return me.Down && me.Down.frame && me.Down.frame.slow || null;
            },
            //获取上行车道路牌
            getUpwardFlag: function() {
                var me = this;
                return me.FlagList.filter(function(it) { return !!it.isUpward });
            },
            //获取下行车道路牌
            getDownFlag : function() {
                var me = this;
                return me.FlagList.filter(function(it) { return !it.isUpward });
            }
        },
        components: {
            "Isolation" : Isolation,
            "Lane" : Lane,
            "Pedestrians" : Pedestrians
        },
        methods: {
            calcUpwardLanePosition: function(i) {
                var me = this;
                var w = 0;
                if (me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.isShow) {
                    w = 15;
                }
                
                if (me.Upward.frame && me.Upward.frame.line && me.Upward.frame.line.isShow) {
                    w = 15;
                }
                var lane = me.Upward.lane.concat([]);
                var newLane = lane.splice(0, i);
                var a = newLane.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) !== -1 }).length
                var b = newLane.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) === -1 }).length
                w += a * 15 + b * me.calcUpwardLaneWidth;
                return { x : me.X, y : me.Y + w }
            },
            calcDownLanePosition: function(i) {
                var me = this;
                var w = 0;
                if (me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.isShow) {
                    w = 15;
                }
                
                if (me.Upward.frame && me.Upward.frame.line && me.Upward.frame.line.isShow) {
                    w = 15;
                }

                if (me.Upward.frame && me.Upward.frame.separation && me.Upward.frame.separation.isShow && !me.isUnidirectional) {
                    w += 15;
                }
                var lane = me.Down.lane.concat([]);
                var newLane = lane.splice(0, i);
                var a = newLane.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) !== -1 }).length
                var b = newLane.filter(function(it) { return ['parterre', 'parterre-dashed', 'y-parterre-solid', 'y-parterre-dashed'].indexOf(it.type) === -1 }).length
                w += a * 15 + b * me.calcDownLaneWidth;
                return { x : me.X, y : me.Y + w + me.calcUpwardRoadWidth }
            },
            calcFlagListPosition: function(it, i) {
                var me = this;
                var top = !!it.isUpward ? ((1080 - me.RoadWidth) / 2 - 60) - 90 * Math.floor(i / 10) - 60 : (1080 / 2 + me.RoadWidth / 2) + 90 * Math.floor(i / 10) + 30;
                var left = !!it.isUpward ? me.X + Math.floor(i % 10) * 130 : me.X + Math.floor(9 - i % 10) * 130;
                return { x : left, y :  top  };
            }
        }
    })

    //路面基础绘制
    var PavementRender = function() {
        var template = [
            "<g>",
                "<defs>",
                    "<pattern id='parterre' width='120' height='15' patternUnits='userSpaceOnUse'>",
                        "<image x='0' y='0' width='120' height='15' xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIEAAAAQCAYAAAAxmhy2AAAJrUlEQVRogYVZ7XIjuQ3sBjkjedeXurxI/uYZ87KpVDY+2xIJ5Ac+SMm7d6ryemVphmyg0Whi+I9//dP0roAB7ES7NpgBAMBGAMB8n7CpaJeG9q2DXUAhYAab/gMAcgrYBXpTzD/uMIP//32gXRtAv397aYAB4LpHvtgFgGG8DV/f8PC5DYWZ761dfK821dfvUvuWS/PvT4Pepu+ZuQgw3gZsOO4df14HABRCDgECKwwwNehNAQJQQIfC7r5++9Yhp3hM1PesN4Wcgv6t48uL+IKPnaAQ420szL/AL6dAzuZ7jP16vgbm+wQboMMw3+6QS6t4rsUcVze1ukkFIADYMF90KPrrATkEcgjY6DHRR7LYNIDmZJAD82NCb4p2bR7Qs3mQRrLMALCuB1DBg/n6YAQrXnJNAi0caOtLpuZJy89bJJJY6wKwu0Lvuj7f8GfQbRruH3fYULALbASWHvdTBQnwlJUgISCRkFhObwo9DXR+P5LgGf80mAaOxPmMv3JIJ7gAcjaYGub7gA0Du18kHcBLB0joffo9DTAzLxoC3YaBJwsYdNtkVHL/21GBMvPFvcx3RP4nTE8cm6C9cN1T6EEo8E4icmXUzP+xYZgfA6RXJmVbF+s+ZkEiEmYePFjeKIge6yVhK6Ak9K4Qk1/jj8R6HGZVGhthGipoKIUxNejQRTq1+mz+MdC/94eE/hQ/nKDz/U/w53pxgX6qE2foVmD5Q4AstfT3AfWuoBBdrl6dMAABTIez1oahvx7eIjQ+vyvmtFSSYrft6qFcnzcBxNYGthfFPLCM6ssgmAEKmFMWGQWbCkxgDntMSMgqxZNDizZSHA0W5DVcCiGXBjlbkfoB//QMyxHKNxTzfVbwzFBtUYcH2T6mK0djYbJpgABgr+u+4t9YIASbQD+n5+ZX+BmYYcBtBjmDfMKKEbb4FANAkAYegi5dHHwQZQYIBAv7b0cxH+oBsmmLZRnsPehTYVvF7vKdiXNW2xaQrfclkO7BqHZjgH5O6NACacpSDzn9uymFD+u1lHqtv8nZXBJVv+KP+/fvB9gZ3kegt0UCT+hqHalCOrCSwJBebkr6U/wGmyhlkcNJ4HvPVgfMT/dn5CJBeoNs00nmLCgKwWgjNrZEHQLpgm4p68KSdzaBTUX/3peZeJZ+NbAlzYK99Z1VpYBLkan3pzSVWe0lDk0AaFSiwtTQjmVmSmlSAu9uVClw5TmI+TnRrt3Vx8x/l8o4RjnEZbgrOLl6r+ARf3il5/Vzw7l+e4kYccXPwkSmMs0PbyWe0F/g74E/5FwugqOfhSX3SKIUTS4N7bqMoc21Z88Py/ja3WPKSxLagjSGnkkjCdt6NiMBz+BJcwCbtDP6vQ7fSG00DAjIIkD2ygdCheKzC2xucqpbQEN5KISFofOLcw/YAp2St5krrGoC3UjpTeseX/BHAh/WF4KBUbqg/3aEXPu+9K6AGshNiiNZZOBHmr7HGAAADwF11n7kIuAhm88h9DqdKIk1W2AofSa/1IZAuwgsDHl6LfalYr1UgLHwIV40Ia35OcWTYLq+Y1OrZ5JRTMmXbEchi8X+xF79H6u/cXf10aZGMDruIWcr4HpXYBDtImFEBf21VwLMljFLc5UVU/06K2bDnxaCoSKUtT67oL30UCEnqpyBv9Nbwe7oSUhb5nX+MTb/Y0UghKyz2rP/sOLvaiMQmFjE34KQfGgbicU2opFOMrBj/Li70Q0SdR0h62rlAwCUzJlaFNLyBevGvrB+TJjBpel87Mf5vXyZ+rETQEkXo1ItZgZyaRtZIlBp9auJhiSeXi0kIXF828GbbiSDQaeb2yLEUACy8G9HMJuBN5OotjzFwSJ5Cg7IX+On9+MylgyFaKF20zDfFO17zGHSa1g11yezG/fO5G9HUr8uAS78MKuczY8J6R67zvACmgOfa3tgFZNVcTLIHroMDjA+3NHIIcsMbvlC/K2c7IrOdp42N3033XqcxkljqUiaIwBejSGXPAXS+UDSh4DlG/WoSiMozUmQ+Ak0aYDEYIkG41pfPzyBGVxknDaFs63PP+N3w73BFzx4DlOPQX89AMsCtEcTaW7OAVcedqmTTZHmef3tjakb6P56FPE77OniYP4uy7m5Ahg+KIkiZ06s8OVVk0Vbn+/9Mnu23r1KYDFtY0hkSpxatkV39CHNANBe8pj31AIyGEP92Ne4Ao/lIXRYVZzN8D2I9eNkMN7GmkymgiUB/uRVrWnoUoD+hD9/29YGyv2nj1hJosTvv1j/l/i7oF2bT2Vh6Hr3sebeVyjLVOTYtTbRZM0VIivtW1/fj+PJAssV4DRg+SbIgekkYyeg3ACw2kceQ+UU4Az5BtG+tTUSJt2UbGbW5hqzVjCR67skW5zN2KWOl3m/nQA2De3afHp6abUHd+1ROFvLlO7VYkPdhBqWbOexnFZkBGMiWyReLTLVkk3AfbK7G/T0cH+Bn7QikA5Db9fm8hKV1rqs8emIIcjmjuWUAJznWgMmYCET5dCTpKoPZF0K4sGZ24zcmeOAdWgZH73N6mUI4yaX9vA8wIkWQ6xocTa3vW+eJj1EErC/SrWiOi7Cj1Z6C8cvhEQFSV4Pe8Cf5g2yfI7eJsaPgdpI4t+fixAxVY3x7xa3Os6lAvf0WN6q9uOfnJG7n+JHDfxyPnD+/YLxvzv68fslZAhrSEIfk2YPKlCpEHvSbG2yVEAYKredBrIAxZNvd10Ei2Q64BiBBgAzlEdICWwvrdoUSv5ZUloqtbv0uFkqHXKIEqZJTvE93Vy25+dAjaWjouuU0Nd+dvw6DKRH3QjYmBg/7lsRWJ0+/HpUfHiITyYDUykvlvdKGE5SfxYw30fhmB8T+qn+gO7Zn4b6VC5D+Y7fLzEnyN7XGcnxisnpWZmvTvBb/+JEnzixZD6Pn3CC5dBG97FvegZ49aci2Vhn9HT9chEfBtVx0+/vo9J17VIhe1Azm4b20tBqxrDklHSVkc3r1HSytfqur49Ftgww17okYHfF7T83pGF+aN26yOlja1ljZl2xy3s9eK1s0Z/Th1Ap67cYtEUhtZf1nGL3YHsN5wI9b1pjxgCnt4n7f29uwmKoIpeGYcOPj/3x2GRZ0TH+zd6r76MktR59ipWi7EfGHN7YVB8dm6F/P/wRbV9DoBo2CaNd6OrpOX42HwGPH7eaUuZjXh2Gli0vKjlPLRmHdm1xVLUib3vpMXFcFerPStQNZU5Dh+L2709/mNQlnh2wnsJa9Pd8dpFj3oyDx86KKcVVxhPJz1nzDT92DujQyItgfkzM9+nDrNwv6WrT5enehv8D4HHKbi/xjaYAAAAASUVORK5CYII=' />",
                    "</pattern>",
                "</defs>",
                "<defs>",
                    "<path id='lanemark-pedestrian' d='m100.09997,198.19997c-4.48544,0 -8.7924,-1.78529 -11.98356,-4.95412l-81.16232,-81.16235c-6.60545,-6.62781 -6.60545,-17.33934 0,-23.96708l81.16232,-81.16235c6.62779,-6.60543 17.33932,-6.60543 23.96712,0l81.16232,81.16235c3.16881,3.16884 4.9541,7.47577 4.9541,11.98354c0,4.48546 -1.78524,8.79239 -4.9541,11.98354l-81.16232,81.16235c-3.19116,3.16884 -7.49807,4.95412 -11.98356,4.95412zm-57.21755,-98.10001l57.21755,57.21758l57.21755,-57.21758l-57.21755,-57.21758l-57.21755,57.21758z' fill='#fff' />",
                    "<path id='lanemark-non-motorized' d='m128.35631,2l15.36897,63.89335l4.55146,0a49.54967,65.4431 0 0 1 49.51096,65.39204c0,36.10194 -22.17689,66.92467 -49.51096,66.92467a49.54967,65.4431 0 0 1 -49.51096,-65.39204c0,-25.13483 10.36637,-47.51136 27.15367,-58.6483l2.4497,-1.4987l-3.42974,-13.53823l-59.7613,47.35812c6.83361,9.02556 10.81768,21.04805 10.81768,33.83709c0,27.05926 -16.50371,48.87362 -37.00434,48.87362c-20.48765,-0.01697 -36.99137,-21.83133 -36.99137,-48.89075a36.91416,48.75462 0 0 1 34.8124,-48.78856l2.19193,-0.08499l-13.11268,-27.79164l-9.10292,0a7.77477,10.26859 0 0 1 -7.96818,-10.52403a7.7361,10.21753 0 0 1 6.75624,-10.42184l1.21194,-0.10219l31.8857,0c4.55129,0 7.96818,4.51267 7.96818,10.52403a7.7361,10.21753 0 0 1 -6.75624,10.40471l-1.21194,0.11931l-4.55146,0l12.50663,25.54375l63.77123,-51.0875l-3.41672,-15.03692l-16.50371,0a7.77477,10.26859 0 0 1 -7.96818,-10.54099a7.7361,10.21753 0 0 1 6.75624,-10.42184l1.1991,-0.10219l27.88861,0l0.00004,0zm5.17019,86.26988a36.32095,47.97119 0 0 0 -21.86732,44.51421a36.65622,48.41404 0 0 0 36.61756,48.3629c19.90742,0 36.61739,-22.78506 36.61739,-49.86144a36.66907,48.43101 0 0 0 -34.38691,-48.27791l-2.23047,-0.10219l-5.53132,0l-9.21896,5.347l0,0.01736l0.00004,0.00008zm-85.07128,20.21348l-9.46371,0c-13.37045,0 -24.09791,14.18539 -24.09791,31.84472a24.03326,31.74214 0 0 0 24.11093,31.84448c13.35761,0 24.09791,-14.18539 24.09791,-31.84448c0,-7.15227 -1.98572,-14.0832 -5.60866,-19.73693l-1.43117,-2.04351l-7.60722,-10.06421l-0.00017,0l0,-0.00008z' fill='#fff' />",
                    "<path id='lanemark-distance' d='m110.36199,198.64774c-2.21878,0 -4.44738,-0.82044 -6.31273,-2.46128l-97.5182,-87.40251a10.06303,11.21248 0 0 1 0,-17.45864l97.09604,-86.94307a10.0532,11.20154 0 0 1 12.59598,17.45864l-87.34718,78.21376l87.77917,78.68413a10.0532,11.20154 0 0 1 -6.3029,19.91987l0.00983,-0.01094l0,0.00005zm75.91948,0.01094c-2.20895,0 -4.44738,-0.82044 -6.31273,-2.46128l-97.48877,-87.41345a10.06303,11.21248 0 0 1 0,-17.45864l97.09604,-86.94307a10.0532,11.20154 0 0 1 12.58615,17.45864l-87.35701,78.21376l87.78899,78.68413a10.0532,11.20154 0 0 1 -6.3029,19.91987l-0.00983,0l0.00005,0.00005z' fill='#fff' />",
                    "<path id='lanemark-uturn' d='m116.47617,2a54.52383,75.64102 0 0 1 54.46931,72.3582l0.05452,3.28282l0,121.02563l-21.80953,0l0,-121.02563a32.7143,45.38461 0 0 0 -65.37407,-2.66256l-0.05452,2.66256l0,63.06948l32.7143,-45.26359l0,42.79769l-43.67359,60.42205l-43.59726,-60.42205l0,-42.79769l32.74701,45.38461l0,-63.19051a54.52383,75.64102 0 0 1 54.52383,-75.64102z' fill='#fff' />",
                    "<path id='lanemark-slow' d='m197.87981,2l0,195.59332l-195.87981,-97.79711l195.87981,-97.79621l0,0zm-20.92794,40.73358l0.4375,-0.49907l-126.15901,58.38982l126.01838,57.828l-0.29687,-115.71875zm6.625,133.4375' fill='#fff' />",
                    "<path id='lanemark-right' d='m120.05611,29.84215l0,-27.60582l49.78302,47.34541l-49.78302,47.31823l0,-27.60582l-49.84091,17.52616l0,108.67793l-39.79169,0l0,-134.09751l89.6326,-31.55857z' fill='#fff' />",
                    "<path id='lanemark-straight' d='m72.31543,87.85076l-46.12342,0l73.88047,-84.85075l71.94352,84.85075l-48.23329,0l0,109.14925l-51.46731,0l0,-109.14925l0.00004,0z' fill='#fff' />",
                    "<path id='lanemark-straight-uturn' d='m128.09554,2l41.93645,85.7255l-28.1169,0l0,110.2745l-29.9929,0l0,-110.2745l-26.45644,0l42.62975,-85.7255l0.00004,0zm-16.22575,105.64093l0,16.85907c0,-3.35343 -5.88441,-7.9931 -17.66481,-7.9931c-11.76878,0 -17.90369,4.60907 -17.90369,7.9931l0,29.9696l23.91624,0l-35.0733,43.53035l-34.84023,-43.53035l24.16093,0l0,-29.9696c0,-7.9931 10.79581,-14.44275 22.08101,-17.53585c11.2852,-3.0931 26.98079,-1.5496 35.32381,0.67375l0,0.00307l0.00004,-0.00004z' fill='#fff' />",
                    "<path id='lanemark-straight-right' d='m61.32661,197.00001l0,-108.79169l-30.61459,0l45.98857,-84.20832l47.6298,84.20832l-30.49862,0l0,57.2456l48.96943,-25.65089l0,-31.67613l27.19879,51.338l-27.19879,48.75663l0,-28.93189l-48.96943,24.15514l0,13.55522l-32.50516,0z' fill='#fff' />",
                    "<path id='lanemark-straight-left' d='m137.83506,195.49999l0,-107.66432l29.95296,0l-44.99468,-83.33567l-46.60041,83.33567l29.83947,0l0,56.65238l-47.91109,-25.38509l0,-31.34789l-26.60529,50.806l26.61097,48.25139l0,-28.63209l47.91109,23.90484l0,13.41478l31.79698,0z' fill='#fff' />",
                    "<path id='lanemark-left-right' d='m120.51633,195.99999c-10.44496,0 -31.2837,0 -41.72865,0c0,-33.27547 0,-66.55095 0,-99.82637l-32.8076,-17.42852l0,24.80393l-23.56442,-48.4804l23.56442,-50.7353l0,36.07842l53.01991,28.53806l53.01991,-28.53806l0,-36.07842l23.56442,50.7353l-23.56442,48.4804l0,-24.80393l-31.5036,17.42852l0,99.82637l0.00003,0z' fill='#fff' />",
                    "<path id='lanemark-left' d='m82.375,31.13958l0,-27.39958l-43.051,46.98612l43.051,46.96511l0,-27.39657l43.10133,17.39326l0,107.85203l34.41568,0l0,-133.07633l-77.51697,-31.32408l-0.00004,0.00004z' fill='#fff' />",
                    "<path id='lanemark-left-uturn' d='m169.05603,197.00002l-46.44799,0l0,-72.74999c0,-3.3192 -5.86677,-7.91154 -17.60027,-7.91154c-11.7335,0 -17.84906,4.56202 -17.84906,7.91154l0,29.66381l23.83727,0l-34.95171,43.08617l-34.7203,-43.08617l24.0803,0l0,-29.66381c0,-7.91154 10.75569,-14.29536 22.00323,-17.35695c11.24174,-3.06155 26.88639,-1.53382 35.20049,0.66686l0,-19.68495l-34.83598,-18.1875l0,24.25l-58.06,-54.51399l58.06,-36.42349l0,24.3955l80.84429,42.29199l0.43973,127.31248l0,0.00005z' fill='#fff' />",
                "</defs>",
                "<defs>",
                    "<g id='penalty'>",
                        "<rect fill='none' stroke-width='3' stroke='#D6CB0A' rx='5' ry='5' x='1.5' y='1.5' width='397' height='397' id='svg_2'/>",
                        "<rect fill='#333' rx='5' ry='5' x='1.5' y='1.5' width='397' height='397' id='svg_2'/>",
                        "<line id='svg_3' y2='50.75' x2='397.25' y1='3.5' x1='350.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_4' y2='99.5' x2='397.25' y1='2.0' x1='300.50' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_5' y2='150.5' x2='398' y1='3.5' x1='251.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_6' y2='198.5' x2='397.25' y1='2.0' x1='200.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_7' y2='250.25' x2='397.25' y1='2.75' x1='151.25' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_8' y2='299.75' x2='397.25' y1='2.75' x1='100.25' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_9' y2='350.75' x2='397.25' y1='2.75' x1='52.25' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_10' y2='395.75' x2='395.75' y1='3.5' x1='2.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_11' y2='396.50' x2='350.75' y1='51.5' x1='2.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_12' y2='396.50' x2='299.75' y1='100.25' x1='2.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_13' y2='397.25' x2='252.5' y1='150.5' x1='2.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_14' y2='398' x2='199.25' y1='200.75' x1='2.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_15' y2='396.50' x2='149.75' y1='250.25' x1='2.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_16' y2='397.25' x2='100.25' y1='300.50' x1='2.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_17' y2='398.75' x2='52.25' y1='353' x1='2.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_18' y2='52.25' x2='2.75' y1='3.5' x1='53.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_19' y2='99.5' x2='2.0' y1='2.75' x1='100.25' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_20' y2='151.25' x2='2.0' y1='2.75' x1='152.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_21' y2='200.0' x2='2.75' y1='2.0' x1='200.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_22' y2='250.25' x2='3.5' y1='3.5' x1='251.0' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_23' y2='302' x2='2.75' y1='2.75' x1='300.50' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_24' y2='351.50' x2='2.75' y1='2.0' x1='351.50' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_25' y2='398.75' x2='50.75' y1='50.75' x1='398.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_26' y2='398' x2='101.0' y1='101.0' x1='398' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_27' y2='396.50' x2='153.5' y1='149.0' x1='397.25' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_28' y2='200.75' x2='397.25' y1='398' x1='200.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_29' y2='396.50' x2='254.75' y1='248.75' x1='397.25' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_30' y2='299.75' x2='398.75' y1='395.75' x1='299.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_31' y2='396.50' x2='350.75' y1='353' x1='398.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                        "<line id='svg_32' y2='3.5' x2='395.75' y1='396.50' x1='2.75' stroke-width='3' stroke='#D6CB0A' fill='none'/>",
                    "</g>",
                "</defs>",
                "<rect :x='getPavementPosition.x' :y='getPavementPosition.y' :width='getPavementLength' :height='RoadWidth' fill='#333' />",
                // "<pedestrians ",
                //     "v-for='(item, n) in getPedestrians' ",
                //     ":id='item.id' ",
                //     ":x='item.x' ",
                //     ":y='item.y' ",
                //     ":len='item.len' ",
                //     ":width='item.width' ",
                //     ":area='item.area' ",
                //     ":upward-name='item.name' ",
                //     ":down-name='item.name' ",
                //     ":is-show='item.isShow' ",
                //     ":height='RoadWidth' ",
                //     ":offset='{ x: getPavementPosition.x + (1310 * (n + 1) - 10), y: getPavementPosition.y }' ",
                //     "@on-pedestrian-stop-click=\"$parent.$emit('on-pedestrian-stop-click', $event, n, arguments[0], 'pedestrian')\" ",
                //     "@on-pedestrian-click=\"$parent.$emit('on-pedestrian-click', $event, n, 'pedestrian')\" ",
                //     "></pedestrians>",
                "<text v-for='(item, n) in getSegmentation' v-show='item.isShow' :x='getPavementPosition.x + (1310 * (n + 1))' :y='getPavementPosition.y + RoadWidth + 15' font-size='24' fill='#D6CB0A' style='dominant-baseline:middle;text-anchor:middle; font-weight:bold;' >{{ item.name }}</text>",
                "<g>",
                    "<road-section ",
                        "v-for='(item, n) in Roads' ",
                        ":upward='item.upward' ",
                        ":down='item.down' ",
                        ":name='item.name' ",
                        ":pedestrian='item.pedestrian' ",
                        ":flag-list='item.flagList' ",
                        ":road-width='RoadWidth'",
                        ":x='getRoadSectionPosition(n).x' ",
                        ":y='getRoadSectionPosition(n).y' ",
                        ":lane-index='n' ",
                        ":key='n' ",
                        "@on-road-lane-section=\"$parent.$emit('on-pavement-lane-section', arguments[0], n, arguments[1], arguments[2])\" ",
                        "@on-road-lanemark-section=\"$parent.$emit('on-pavement-lanemark-section', arguments[0], n, arguments[1], arguments[2], arguments[3])\" ",
                        "@on-lane-flag=\"$parent.$emit('on-pavement-lane-flag', $event, n, arguments[0], arguments[1])\" ",
                        "@on-lane-penalty=\"$parent.$emit('on-pavement-lane-penalty', $event, n, arguments[0])\" ",
                        "@on-road-lanemark-click=\"$parent.$emit('on-pavement-lanemark-click', arguments[0], n, arguments[1], arguments[2], arguments[3])\" ",
                        "@on-road-slowline-click=\"$parent.$emit('on-pavement-slowline-click', arguments[0], n, arguments[1], arguments[2])\" ",
                        "@on-road-lanepark-click=\"$parent.$emit('on-pavement-lanepark-click', arguments[0], n, arguments[1], arguments[2])\" ",
                        "@on-road-isolation-click=\"$parent.$emit('on-pavement-isolation-click', arguments[0], n, arguments[1], arguments[2], arguments[3], arguments[4])\" ",
                        "@on-road-boundary-click=\"$parent.$emit('on-pavement-boundary-click', arguments[0], n, arguments[1], arguments[2], arguments[3])\" ",
                        "@on-road-separation-click=\"$parent.$emit('on-pavement-separation-click', arguments[0], n, arguments[1], arguments[2])\" ",
                        "@on-road-pedestrian-stop-click=\"$parent.$emit('on-pedestrian-stop-click', arguments[0], n, arguments[1], 'road')\" ",
                        "@on-road-pedestrian-click=\"$parent.$emit('on-pedestrian-click', arguments[0], n, 'road')\" ",
                        "></road-section>",
                    "<text fill='#D6CB0A' :x='(1920 / 2 - getPavementLength / 2) - 10' :y='1080 / 2 + RoadWidth / 2 + 20' font-size='18' style='dominant-baseline:middle;text-anchor:middle; font-weight:bold; text-align: center;'>{{ startCrossName }}</text>",
                    "<text fill='#D6CB0A' :x='(1920 / 2 + getPavementLength / 2) + 10' :y='1080 / 2 + RoadWidth / 2 + 20' font-size='18' style='dominant-baseline:middle;text-anchor:middle; font-weight:bold; text-align: center;'>{{ endCrossName }}</text>",
                    "<text fill='#fff' font-size='24' style='dominant-baseline:middle;text-anchor:end; font-weight:bold; text-align: center;'>",
                        "<tspan :x='(1920 / 2 - getPavementLength / 2) - 10' :y='1080 / 2 - RoadWidth / 4 - 15'>{{ name }}</tspan>",
                        "<tspan :x='(1920 / 2 - getPavementLength / 2) - 10' :dx='-Math.abs(name.length - 2) * 24 / 2' :y='1080 / 2 - RoadWidth / 4 + 15'>下行</tspan>",
                    "</text>",
                    "<text font-size='24' style='dominant-baseline:middle;text-anchor:end; font-weight:bold;' fill='#fff'>",
                        "<tspan :x='(1920 / 2 - getPavementLength / 2) - 10' :y='1080 / 2 + RoadWidth / 4 - 15'>{{ name }}</tspan>",
                        "<tspan :x='(1920 / 2 - getPavementLength / 2) - 10' :dx='-Math.abs(name.length - 2) * 24 / 2' :y='1080 / 2 + RoadWidth / 4 + 15'>上行</tspan>",
                    "</text>",
                    "<text font-size='24' style='dominant-baseline:middle;text-anchor:start; font-weight:bold;' fill='#fff'>",
                        "<tspan :x='(1920 / 2 + getPavementLength / 2) + 10' :y='1080 / 2 - RoadWidth / 4 - 15'>{{ name }}</tspan>",
                        "<tspan :x='(1920 / 2 + getPavementLength / 2) + 10' :dx='Math.abs(name.length - 2) * 24 / 2' :y='1080 / 2 - RoadWidth / 4 + 15'>下行</tspan>",
                    "</text>",
                    "<text font-size='24' style='dominant-baseline:middle;text-anchor:start; font-weight:bold;' fill='#fff'>",
                        "<tspan :x='(1920 / 2 + getPavementLength / 2) + 10' :y='1080 / 2 + RoadWidth / 4 - 15'>{{ name }}</tspan>",
                        "<tspan :x='(1920 / 2 + getPavementLength / 2) + 10' :dx='Math.abs(name.length - 2) * 24 / 2' :y='1080 / 2 + RoadWidth / 4 + 15'>上行</tspan>",
                    "</text>",
                "</g>",
            "</g>"
        ];
        return template.join('');
    }

    var Pavement = Vue.extend({
        template: PavementRender.apply(this),
        inject: ["name", "segmentation", "startCrossName", "endCrossName"],
        props: {
            // Pedestrian : {
            //     default : function() {
            //         return [];
            //     },
            //     type: Array
            // },
            Roads : {
                default : function() {
                    return [];
                },
                type: Array
            },
            RoadWidth : {
                default: 600
            }
        },
        computed : {
            getPavementLength: function() {
                var me = this;
                var size = me.Roads && me.Roads.length || 1;
                return 1310 * size - 10;
            },
            getPavementPosition: function() {
                var me = this;
                return { x : 1920 / 2 - me.getPavementLength / 2, y : 1080/2 - me.RoadWidth / 2 };
            },
            // getPedestrians: function () {
            //     var me = this;
            //     return me.Pedestrian && me.Pedestrian.splice(0, me.Roads.length - 1) || [];
            // },
            getSegmentation: function () {
                var me = this;
                return me.segmentation && me.segmentation.splice(0, me.Roads.length - 1) || [];
            }
        },
        components: {
            "Pedestrians" : Pedestrians,
            "RoadSection": RoadSection
        },
        methods: {
            getRoadSectionPosition: function (i) {
                var me = this;
                return { x: me.getPavementPosition.x + i * 1310, y: me.getPavementPosition.y };
            }
        }
    })

    var render = function() {
        var template = [
            "<svg ref='image' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' class='ivsom-road' version='1.1' viewBox='0 0 1920 1080' preserveAspectRatio='none meet' style='width:100%; height:100%;  background-color: #111;' @mousedown.stop='onEnabledDrag' @mouseup.stop='onDragDrop' @mouseleave.stop='onDragDrop' @mousemove.stop='onDragMove' @mousewheel.prevent.stop='onScaleView'>",
                "<pavement ",
                    // ":pedestrian='Pedestrian || []' ",
                    ":roads='Roads || []' ",
                    ":road-width='RoadWidth || 600' ",
                    ":style=\"{ transformOrigin: 'center center', transform: getMatrix }\" ",
                    "></pavement>",
                "<g>",
                    "<circle cx='60' cy='60' r='40' fill='#fff' stroke='#ececec' stroke-width='2' />",
                    "<path d='M60,25 L50,60 S60,45 70,60 L60,25 z' fill='#ea4748'/>",
                    "<path d='M60,95 L50,60 S60,75 70,60 L60,95 z' fill='#4e79e2'/>",
                    "<path d='M35,60 L45,70 45,50 35,60 z' fill='#ddd'/>",
                    "<path d='M85,60 L75,70 75,50 85,60 z' fill='#ddd'/>",
                    "<text x='60' y='15' font-size='12' text-anchor='middle' fill='#fff'>N</text>",
                    "<text x='10' y='65' font-size='12' text-anchor='middle' fill='#fff'>W</text>",
                    "<text x='110' y='65' font-size='12' text-anchor='middle' fill='#fff'>E</text>",
                    "<text x='60' y='115' font-size='12' text-anchor='middle' fill='#fff'>S</text>",
                "</g>",
            "</svg>"
        ];
        return template.join('');
    }

    var road = Vue.extend({
        template: render.apply(this),
        provide: function() {
            var me = this;
            return {
                'editState': me.getEditableState,
                'name': me.Name,
                'startCrossName': me.StartCrossName,
                'endCrossName': me.EndCrossName,
                'segmentation' : me.Segmentation
            }
        },
        props: {
            // Pedestrian : {
            //     default : function() {
            //         return [];
            //     },
            //     type: Array
            // },
            Roads : {
                default : function() {
                    return [];
                },
                type: Array
            },
            Angle: {
                default : 0,
                type: Number
            },
            RoadWidth : {
                default: 600,
                type: Number
            },
            Name: {
                default: '',
                type: String
            },
            StartCrossName: {
                default: '',
                type: String
            },
            EndCrossName: {
                default: '',
                type: String
            },
            Segmentation: {
                default: [],
                type: Array
            }
        },
        data: function() {
            return {
                move: { isDrag : false, drag : { x : 0, y : 0, offsetX: 0, offsetY: 0 } },
                rotate: { isRotate : false, x: 0, y: 0 },
                moveTop: 0,
                moveLeft: 0,
                scale: 1,
                editor: { isUpward : true, laneIndex: -1  }
            }
        },
        components: {
            'Pavement': Pavement
        },
        computed:{
            getMatrix: function() {
                var me = this;
                var m1 = (Math.cos(me.Angle * Math.PI / 180) * me.scale).toFixed(6);
                var m2 = (Math.sin(me.Angle * Math.PI / 180) * me.scale).toFixed(6);
                var m3 = (-1 * (Math.sin(me.Angle * Math.PI / 180) * me.scale)).toFixed(6);
                return "matrix("+ m1 +","+ m2 +","+ m3 +","+ m1 +","+ me.moveLeft +","+ me.moveTop +")";
            },
            getEditableState: function() {
                var me = this;
                return me.editor;
            }
        },
        methods: {
            onEnabledDrag: function(e) {
                var me = this;
                if (e.button === 0) {
                    me.$set(me, "move", { isDrag : true, drag : { x : e.clientX, y : e.clientY, offsetX: me.moveLeft, offsetY: me.moveTop } });
                }

                if (e.button === 1) {
                    me.$set(me, "rotate", { isRotate : true, x : e.clientX, y : e.clientY });
                }
            },
            onDragDrop: function(e) {
                var me = this;
                if (e.button === 0) {
                    me.$set(me, "move", { isDrag : false, drag : { x : 0, y : 0, offsetX: me.moveLeft, offsetY: me.moveTop } });
                }

                if(e.button === 1) {
                    me.$set(me, "rotate", { isRotate : false, x: 0, y : 0 });
                }
            },
            onDragMove: function (e) {
                var me = this
                if(me.move.isDrag) {
                    var top = e.clientY;
                    var left = e.clientX;
                    var moveTop = top - me.move.drag.y;
                    var moveLeft = left - me.move.drag.x;
                    me.moveTop = (me.move.drag.offsetY + moveTop);
                    me.moveLeft =  (me.move.drag.offsetX + moveLeft);
                }

                if(me.rotate.isRotate) {
                    var p = { x: 1920 / 2, y : 1080 / 2 };
                    var angle = utils.calcTriangleAngle(
                        p,
                        { x : e.clientX, y : e.clientY }
                    )
                    me.$emit('update:angle', angle);
                }
            },
            onScaleView: function(e) {
                var me = this;
                me.scale = event.wheelDelta > 0 ? me.scale + 0.05 : me.scale - 0.05;
                me.scale = me.scale > 4 ? 4 : me.scale < 0 ? 0 : me.scale;
            },
            setEditablePavement: function(index, isUpward) {
                var me = this;
                me.editor.isUpward = isUpward;
                me.editor.laneIndex = index;
            },
            toImage: function () {
                var me = this;
                return new Promise(function (resolve, reject) {
                    var image = new Image();
                    image.width = me.$refs.image.clientWidth;
                    image.height = me.$refs.image.clientHeight;
                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    try {
                        image.onload = function () {
                            canvas.width = me.$refs.image.clientWidth;
                            canvas.height = me.$refs.image.clientHeight;
                            ctx.drawImage(image, 0, 0);
                            resolve(canvas.toDataURL());
                        }
                        image.onerror = function () {
                            reject("");
                        }
                        image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(me.$refs.image.outerHTML)));
                    } catch (e) {
                        reject("");
                    }
                })
            }
        }
    })

    function initialize() {
        Vue.component("road", road);
    }

    exports.install = initialize;
    Object.defineProperty(exports, '__esModule', { value: true });
})));