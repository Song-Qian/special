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
            "<g :transform=\"'translate(' + Offset.x + ',' + Offset.y + ')'\" :style=\"{ display: IsShow ? 'block' : 'none' }\" > ",
                "<rect x='0' y='0' width='80' :height='Height' fill='#333' />",
                "<line x1='1.5' x2='1.5' y1='0' :y2='Height' stroke='#fff' stroke-width='3' style='pointer-events:visibleStroke;' @click.capture.stop=\"$emit('on-pedestrian-stop-click', true)\" />",
                "<line x1='78.5' x2='78.5' y1='0' :y2='Height' stroke='#fff' stroke-width='3' style='pointer-events:visibleStroke;' @click.capture.stop=\"$emit('on-pedestrian-stop-click', false)\" />",
                "<line x1='40' x2='40' y1='0' :y2='Height' stroke='#fff' stroke-width='50' stroke-dasharray='8,16' style='pointer-events:visibleStroke;' @click.capture.stop=\"$emit('on-pedestrian-click')\" />",
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
            Area: {
                default: 0,
                type: Number
            },
            IsShow: {
                default: true,
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
                "<line v-if='isSimpleLine' :x1='calcSimpleLinePosition.p1.x' :x2='calcSimpleLinePosition.p2.x' :y1='calcSimpleLinePosition.p1.y' :y2='calcSimpleLinePosition.p2.y' :stroke-dasharray=\"['dotted', 'y_dotted'].indexOf(Type) > -1 ? '45,45' : ''\" :stroke='calcLineColor' stroke-width='3' @click.capture.stop=\"$emit('on-simple-line-click', $event)\" />",
                
                "<line v-if='isDoubleLine' :x1='calcDoubleLinePosition.top.p1.x' :x2='calcDoubleLinePosition.top.p2.x' :y1='calcDoubleLinePosition.top.p1.y' :y2='calcDoubleLinePosition.top.p2.y' :stroke-dasharray='calcDoublieLineStrokeDasharray[0]' :stroke='calcDoubleLineStrokeColor[0]' :stroke-width='caclDoubleLineStrokeWidth[0]' @click.capture.stop=\"$emit('on-right-line-click', $event)\" />",
                "<line v-if='isDoubleLine' :x1='calcDoubleLinePosition.bottom.p1.x' :x2='calcDoubleLinePosition.bottom.p2.x' :y1='calcDoubleLinePosition.bottom.p1.y' :y2='calcDoubleLinePosition.bottom.p2.y' :stroke-dasharray='calcDoublieLineStrokeDasharray[1]' :stroke='calcDoubleLineStrokeColor[1]' :stroke-width='caclDoubleLineStrokeWidth[1]' @click.capture.stop=\"$emit('on-left-line-click', $event)\" />",

                "<g v-if='isBarrier' @click.capture.stop=\"$emit('on-barrier-click', $event)\">",
                    "<line v-if=\"['barrier_dashed', 'y_barrier_dashed'].indexOf(Type) > -1\" x1='0' :x2='Length' :y1='Reverse ? 14 : 1' :y2='Reverse ? 14 : 1' :stroke='calcBarrierColor[0]' :stroke-dasharray=\"['barrier_dashed', 'y_barrier_dashed'].indexOf(Type) > -1 ? '45,45' : ''\" stroke-width='3' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 5 : 10' :y2='Reverse ? 5 : 10' stroke='#fff' stroke-width='10' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 5 : 10' :y2='Reverse ? 5 : 10' stroke='#333' :stroke-dasharray='calcBarrierDasharray[0]'  stroke-width='8' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 5 : 10' :y2='Reverse ? 5 : 10' stroke='#333' :stroke-dasharray='calcBarrierDasharray[1]'  stroke-width='6' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 3 : 12' :y2='Reverse ? 3 : 12' stroke='#333' :stroke-dasharray='calcBarrierDasharray[2]'  stroke-width='3' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 10 : 5' :y2='Reverse ? 10 : 5' :stroke='calcBarrierColor[1]' stroke-width='3' />",
                    "<line x1='0' :x2='Length' :y1='Reverse ? 1.5 : 13.5' :y2='Reverse ? 1.5 : 13.5' :stroke='calcBarrierColor[1]' stroke-width='3' />",
                "</g>",
                "<rect v-if='isParterre' x='0' y='0' :width='Length' height='15' :stroke-dasharray=\"['parterre_dashed', 'y_parterre_dashed'].indexOf(Type) > -1 ? '20,20' : ''\" :stroke='calcLineColor' stroke-width='3' fill='url(#parterre)' @click.capture.stop=\"$emit('on-parterre-click', $event)\"></rect>",
            "</g>"
        ];
        return template.join("");
    }

    var Isolation = Vue.extend({
        template: IsolationRender.apply(this),
        props : {
            // solid: 白色实线, 
            // dotted: 白色虚线, 
            // y_solid: 黄色实线,
            // y_dotted: 黄色虚线, 
            // y_double_solid: 双黄实线, 
            // y_double_dashed: 双黄实虚线,

            // y_w_dashed: 黄色实线+白色虚线,
            // y_w_double_solid: 黄白双实线,
            // y_w_double_dashed: 黄白双虚线,
            // w_y_dashed: 白色实线+黄色虚线,
            // w_y_double_solid: 白黄双实线,
            // w_y_double_dashed: 白黄双虚线,

            // barrier: 白线护栏,
            // y_barrier: 黄线护栏
            // barrier_dashed: 白虚线+护栏
            // y_barrier_dashed: 黄虚线+护栏

            // parterre 花坛+白线, 
            // parterre_dashed 花坛+虚线, 
            // y_parterre_solid 花坛+黄线, 
            // y_parterre_dashed 花坛+黄虚线
            Type:  {
                default: 'solid', 
                type : String
            },
            Length: {
                default: 1200,
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
                return ["solid", "dotted", "y_solid", "y_dotted"].indexOf(me.Type) > -1;
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
                var yellow = ["y_solid", "y_dotted", "y_double_solid", "y_double_dashed", "y_parterre_solid", "y_parterre_dashed"];
                if (yellow.indexOf(me.Type) > -1) {
                    return "#D6CB0A";
                }
                return "#fff";
            },
            //是否双线
            isDoubleLine: function() {
                var me = this;
                return ["y_double_solid", "y_double_dashed", "y_w_dashed", "y_w_double_solid", "y_w_dotted", "y_w_double_dashed", "w_y_dashed", "w_y_dotted", "w_y_double_solid", "w_y_double_dashed"].indexOf(me.Type) > -1;
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
                if(me.Type === "y_double_solid" || me.Type === "y_double_dashed") {
                    return [3, 3];
                }
                var line = ["y_w_dashed", "y_w_dotted", "y_w_double_solid", "y_w_double_dashed", "w_y_dashed", "w_y_dotted", "w_y_double_solid", "w_y_double_dashed"];
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
                    'y_double_solid' : ['', ''], 
                    'y_double_dashed': ['45,45', ''], 
                    'y_w_dashed' : ['45,45', ''], 
                    'y_w_dotted' : ['', '45,45'], 
                    'y_w_double_solid' : ['', ''], 
                    'y_w_double_dashed' : ['45,45', '45,45'], 
                    'w_y_dashed': ['45,45', ''], 
                    'w_y_dotted' : ['', '45,45'], 
                    'w_y_double_solid' : ['', ''], 
                    'w_y_double_dashed' : ['45,45', '45,45'] 
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
                    'y_double_solid' : ['#D6CB0A', '#D6CB0A'], 
                    'y_double_dashed': ['#D6CB0A', '#D6CB0A'], 
                    'y_w_dashed' : ['#fff', '#D6CB0A'], 
                    'y_w_dotted' : ['#fff', '#D6CB0A'], 
                    'y_w_double_solid' : ['#fff', '#D6CB0A'], 
                    'y_w_double_dashed' : ['#fff', '#D6CB0A'], 
                    'w_y_dashed': ['#D6CB0A', '#fff'], 
                    'w_y_dotted': ['#D6CB0A', '#fff'],
                    'w_y_double_solid' : ['#D6CB0A', '#fff'], 
                    'w_y_double_dashed' : ['#D6CB0A', '#fff'] 
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
                return ["barrier", "y_barrier", "barrier_dashed", "y_barrier_dashed"].indexOf(me.Type) > -1;
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
                if (me.Type === "y_barrier_dashed") {
                    color[0] = "#D6CB0A";
                }

                if (me.Type === "y_barrier") {
                    color[1] = "#D6CB0A";
                }
                return color;
            },
            //是否花坛
            isParterre: function() {
                var me = this;
                return ["parterre", "parterre_dashed", "y_parterre_solid", "y_parterre_dashed"].indexOf(me.Type) > -1;
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
                var x = angle === 180 ||angle === 90 ? me.X + 200 * scale : me.X;
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
                "<g v-if=\"['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(Type) === -1\">",
                    "<rect x='0' y='0' width='1200' :height='Width' :fill=\"LaneType !== 'non-motorized' && Privileged ? '#9D1B87' : '#333'\"  />",
                    "<rect v-for='i in calcMarkTotal' v-show='calcLaneMarkVisible(i)' :x='calcFirstMarkArea(i).x' :y='calcFirstMarkArea(i).y' :width='calcFirstMarkArea(i).width' :height='calcFirstMarkArea(i).height' class='ivsom-lane-mark' :fill=\"LaneType !== 'non-motorized' && Privileged ? '#9D1B87' : '#333'\" stroke='#fff' stroke-width='1' stroke-dasharray='5,5' @click.capture.stop=\"$emit('on-lane-mark-select', $event, i - 1)\" />",
                    "<rect v-for='i in calcMarkTotal' v-show='calcLaneMarkVisible(calcMarkTotal + calcMarkTotal - i + 1)' :x='calcLastMarkArea(i).x' :y='calcLastMarkArea(i).y' :width='calcLastMarkArea(i).width' :height='calcLastMarkArea(i).height' class='ivsom-lane-mark' :fill=\"LaneType !== 'non-motorized' && Privileged ? '#9D1B87' : '#333'\" stroke='#fff' stroke-width='1' stroke-dasharray='5,5' @click.capture.stop=\"$emit('on-lane-mark-select', $event, calcMarkTotal + calcMarkTotal - i)\" />",
                    "<lane-mark v-for='(item, i) in calcLaneMark' :x='calcMarkPosition(item).x' :y='calcMarkPosition(item).y' :id='item.id' :mark='item.mark' :seq='item.seq' :area='Math.min(50, Width - 10)' :reverse='Reverse' @on-lanemark-click=\"$emit('on-lane-mark-click', arguments[0], i)\"></lane-mark>",
                    "<rect v-for='i in calcParkTotal' :x='450 + (i * 30)' :y='Reverse ? Width - 15 : 0' width='30' height='15' :fill=\"LaneType !== 'non-motorized' && Privileged ? '#9D1B87' : '#333'\" stroke='#fff' @click.capture.stop=\"$emit('on-lane-park-click', $event)\" />",
                    "<text v-if='!!calcText' :x=\"LaneType === 'non-motorized' ? calcText.x - 450 : calcText.x + 180\" :y='calcText.y' :fill=\"Bus ? '#D6CB0A' : '#fff'\" :rotate='Reverse ? 90 : -90' text-anchor='middle' textLength='120' lengthadjust='spacingAndGlyphs' style='font-family: Times New Roman;font-size: 30px;'>{{ calcText.text }}</text>",
                    "<text v-if=\"!!calcText && LaneType === 'non-motorized'\" :x=\"LaneType === 'non-motorized' ? calcText.x + 480 : calcText.x\" :y='calcText.y' :fill=\"Bus ? '#D6CB0A' : '#fff'\" :rotate='Reverse ? 90 : -90' text-anchor='middle' textLength='120' lengthadjust='spacingAndGlyphs' style='font-family: Times New Roman;font-size: 30px;'>{{ calcText.text }}</text>",
                    "<line v-if=\"!!calcText && Bus\" :x1=\"LaneType === 'non-motorized' ? (calcText.x - 540) : (calcText.x + 90)\" :x2=\"LaneType === 'non-motorized' ? (calcText.x - 410) : (calcText.x + 220)\" y1='0' y2='0' stroke-dasharray='10,5' stroke='#D6CB0A' stroke-width='3' fill='#D6CB0A' />",
                    "<line v-if=\"!!calcText && Bus\" :x1=\"LaneType === 'non-motorized' ? (calcText.x - 540) : (calcText.x + 90)\" :x2=\"LaneType === 'non-motorized' ? (calcText.x - 410) : (calcText.x + 220)\" :y1='Width - 5' :y2='Width - 5' stroke-dasharray='10,5' stroke='#D6CB0A' stroke-width='3' fill='#D6CB0A' />",
                    "<line v-if=\"!!calcText && LaneType === 'non-motorized' && Bus\" :x1=\"(calcText.x + 520)\" :x2=\"(calcText.x + 390)\" y1='0' y2='0' stroke-dasharray='10,5' stroke='#D6CB0A' stroke-width='3' fill='#D6CB0A' />",
                    "<line v-if=\"!!calcText && LaneType === 'non-motorized' && Bus\" :x1=\"(calcText.x + 520)\" :x2=\"(calcText.x + 390)\" :y1='Width - 5' :y2='Width - 5' stroke-dasharray='10,5' stroke='#D6CB0A' stroke-width='3' fill='#D6CB0A' />",
                    "<g v-if=\"LaneType !== 'non-motorized' && ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(Type) === -1 && Slow && Slow.isShow\" v-for='i in Slow.total' :key='i'>",
                        "<line :x1='380 + i * 20' :x2='380 + i * 20' y1='0' :y2='Width' stroke='#fff' stroke-width='2' @click.capture.stop=\"$emit('on-lane-slowline-click', $event, i - 1)\" />",
                        "<line :x1='384 + i * 20' :x2='384 + i * 20' y1='0' :y2='Width' stroke='#fff' stroke-width='2' @click.capture.stop=\"$emit('on-lane-slowline-click', $event, i - 1)\" />",
                        "<line :x1='388 + i * 20' :x2='388 + i * 20' y1='0' :y2='Width' stroke='#fff' stroke-width='2' @click.capture.stop=\"$emit('on-lane-slowline-click', $event, i - 1)\" />",
                    "</g>",
                "</g>",
                "<isolation ",
                    "v-if='HasBoundary' ",
                    ":type='Type' ",
                    ":transform=\"calcIsolationPosition\" ",
                    "length='1200' ",
                    ":reverse='Reverse' ",
                    "@on-simple-line-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'none')\" ",
                    "@on-right-line-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'right')\" ",
                    "@on-left-line-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'left')\" ",
                    "@on-barrier-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'none')\" ",
                    "@on-parterre-click=\"$emit('on-lane-isolation-click', arguments[0], Type, 'none')\" ",
                    "></isolation>",
            "</g>"
        ];
        return template.join("");
    }

    var Lane = Vue.extend({
        template: LaneRender.apply(this),
        inject: ["u_slow", "d_slow"],
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
                default : null,
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
            Reverse : {
                default : false,
                type: Boolean
            },
            Width : {
                default: 0,
                type: Number
            }
        },
        computed: {
            calcIsolationPosition: function() {
                var me = this;
                var x = 0, y = ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(me.Type) === -1 ? me.Width - 15 : 0;
                if (me.Reverse) {
                    return "translate(0,0)";
                }
                return "translate("+ x +","+ y +")";
            },
            calcMarkTotal: function() {
                var me = this;
                if(me.LaneType === 'non-motorized') {
                    return 1;
                }
                return 6;
            },
            calcParkTotal: function(){
                var me = this;
                if(me.Park) {
                    return 7;
                }
                return 0;
            },
            calcText: function() {
                var me = this;
                if(!!me.Text || !me.Bus) {
                    var x = 600;
                    var y = me.Width / 2;
                    return { x: x, y: me.Reverse ? y - 13 : y + 13, text : me.Bus ? "公交车站".split('').reverse().join('') : me.Text.substr(0, 8).split('').reverse().join('') }
                }
                return null;
            },
            calcLaneMark : function() {
                var me = this;
                if(me.LaneType === 'non-motorized') {
                    return me.Lanemark.filter(function(it, n) { return it.mark === 'non-motorized'}).slice(0, 2);
                }
                return me.Lanemark;
            }
        },
        components: {
            "Isolation" : Isolation,
            "LaneMark" : LaneMark
        },
        methods: {
            calcFirstMarkArea: function(i) {
                var me = this;
                var h = me.Width;
                return { x : 10 + ((i - 1) * 60), y : 5, width: 50, height: h - 10 };
            },
            calcLastMarkArea: function(i) {
                var me = this;
                var h = me.Width;
                return { x : 1140 - ((i - 1) * 60), y : 5, width: 50, height: h - 10 };
            },
            calcMarkPosition: function(mark) {
                var me = this;
                var diff = (50 - Math.min(50, me.Width - 10)) / 2;
                var y = (me.Width - Math.min(50, me.Width - 10)) / 2;
                if (me.LaneType === 'non-motorized' && mark.mark === 'non-motorized') {
                    return mark.seq == 1 ? { x : 10 + diff, y : y } : { x : 1140 + diff, y : y };
                }


                if ((mark.seq - 1) < 6) {
                    return { x : 10 + diff + ((mark.seq - 1) * 60), y : y };
                }
                return { x : 840 + diff + ((mark.seq - 7) * 60), y : y };
            },
            calcLaneMarkVisible: function(seq) {
                var me = this;
                if(me.Lanemark) {
                    return !me.Lanemark.some(function(it, index) { return it.seq === seq });
                }
                return true;
            }
        }
    })

    var RoadSectionRender = function() {
        var template = [
            "<g>",
                "<image v-for='(flag, n) in FlagList' :x='calcFlagListPosition(n).x' :y='calcFlagListPosition(n).y' width='190' height='100' style='cursor: pointer;' :xlink:href='flag.icon' @click.capture.stop=\"$emit('on-lane-flag', n)\" />",
                "<isolation ",
                    ":length='1200' ",
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
                    ":length='1200' ",
                    ":transform=\"'translate('+ X + ',' + (Y + calcUpwardRoadWidth + (Upward.frame && Upward.frame.boundary && Upward.frame.boundary.isShow ? 15 : 0)) +')'\" ",
                    ":type='Upward.frame.separation.type' ",
                    ":reverse='!isUnidirectional' ",
                    "@on-simple-line-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'none')\" ",
                    "@on-right-line-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'right')\" ",
                    "@on-left-line-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'left')\" ",
                    "@on-barrier-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'none')\" ",
                    "@on-parterre-click=\"$emit('on-road-separation-click', arguments[0], Upward.frame.separation.type, 'none')\" ",
                    "></isolation>",
                "<isolation ",
                    ":length='1200' ",
                    ":transform=\"'translate('+ X + ',' + (Y + RoadWidth - 15) +')'\" ",
                    ":type='calcDownIsolation' ",
                    ":reverse='false' ",
                    "@on-simple-line-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'none', false)\" ",
                    "@on-right-line-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'right', false)\" ",
                    "@on-left-line-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'left', false)\" ",
                    "@on-barrier-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'none', false)\" ",
                    "@on-parterre-click=\"$emit('on-road-boundary-click', arguments[0], calcUpwardIsolation, 'none', false)\" ",
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
                    ":bus='item.bus' ",
                    ":privileged='item.privileged' ",
                    ":text='item.text' ",
                    ":lanemark='item.lanemark' ",
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
                    ":bus='item.bus' ",
                    ":privileged='item.privileged' ",
                    ":text='item.text' ",
                    ":lanemark='item.lanemark' ",
                    "@on-lane-mark-select=\"$emit('on-road-lanemark-section', arguments[0], i, item.laneType === 'non-motorized' ? 1 - arguments[1] : 11 - arguments[1], false)\" ",
                    "@on-lane-mark-click=\"$emit('on-road-lanemark-click', arguments[0], i, item.laneType === 'non-motorized' ? 1 - arguments[1] : 11 - arguments[1], false)\" ",
                    "@on-lane-slowline-click=\"$emit('on-road-slowline-click', arguments[0], arguments[1], false)\" ",
                    "@on-lane-park-click=\"$emit('on-road-lanepark-click', arguments[0], i, false)\" ",
                    "@on-lane-isolation-click=\"$emit('on-road-isolation-click', arguments[0], i, arguments[1], arguments[2], false)\" ",
                "></lane>",
                "<use href='#penalty' :x='0' :y='0' :transform='calcUpwardPenaltyMatrix'  v-show='Upward && Upward.frame && Upward.frame.penalty && Upward.frame.penalty.isShow' @click.capture.stop=\"$emit('on-lane-penalty', true)\" />",
                "<use href='#penalty' :x='0' :y='0' :transform='calcDownPenaltyMatrix'  v-show='Down && Down.frame && Down.frame.penalty && Down.frame.penalty.isShow' @click.capture.stop=\"$emit('on-lane-penalty', false)\" />",
            "</g>"
        ];
        return template.join('');
    }

    var RoadSection = Vue.extend({
        template: RoadSectionRender.apply(this),
        props: {
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
                var pLen = me.Upward.lane.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) !== -1 }).length;
                return (me.calcUpwardRoadWidth - pLen * 15) / (lane - pLen);
            },
            //上行车道边界线
            calcUpwardIsolation: function() {
                var me = this;
                var type = me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.type;
                var isShow = me.Upward.frame && me.Upward.frame.boundary && me.Upward.frame.boundary.isShow;
                var isLine = me.Upward.frame && me.Upward.frame.line && me.Upward.frame.line.isShow;
                if (type === 'prohibit' && isLine && isShow) {
                    return 'y_w_double_solid'
                }

                if (type === 'stay' && isLine && isShow) {
                    return  'y_w_dotted'
                }

                if (type === 'prohibit' && isShow) {
                    return 'y_solid'
                }

                if (type === 'stay' && isShow) {
                    return  'y_dotted'
                }
                return '';
            },
            //下行车道边界线
            calcDownIsolation: function() {
                var me = this;
                var type = me.Down && me.Down.frame && me.Down.frame.boundary && me.Down.frame.boundary.type;
                var isShow = me.Down && me.Down.frame && me.Down.frame.boundary && me.Down.frame.boundary.isShow;
                var isLine = me.Down && me.Down.frame && me.Down.frame.line && me.Down.frame.line.isShow;
                if (type === 'prohibit' && isLine && isShow) {
                    return 'y_w_double_solid'
                }

                if (type === 'stay' && isLine && isShow) {
                    return 'y_w_dotted'
                }

                if (type === 'prohibit' && isShow) {
                    return 'y_solid'
                }

                if (type === 'stay' && isShow) {
                    return 'y_dotted'
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
                var pLen = me.Down.lane.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) !== -1 }).length;
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
                        ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(me.Upward.lane[index].type) === -1
                    ) {
                        i = index;
                        break;
                    }
                }

                var offset = lane.splice(0, i);
                var a = offset.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) !== -1 }).length
                var b = offset.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) === -1 }).length
                w += a * 15 + b * me.calcUpwardLaneWidth;
                var height = lane.splice(0, sum);
                var c = height.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) !== -1 }).length
                var d = height.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) === -1 }).length
                var h = c * 15 + d * me.calcUpwardLaneWidth;

                var m1 = (Math.cos(0 * Math.PI / 180) * 0.5).toFixed(6);
                var m2 = (Math.sin(0 * Math.PI / 180) * 1).toFixed(6);
                var m3 = (-1 * (Math.sin(0 * Math.PI / 180) * 1)).toFixed(6);
                var m4 = (Math.cos(0 * Math.PI / 180) * (h / 400)).toFixed(6);
                return "matrix("+ m1 +","+ m2 +","+ m3 +","+ m4 +","+ (me.X + 480) +","+ (me.Y + w) +")";
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
                            ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(lane[index].type) === -1
                        ) {
                            i = index;
                            break;
                        }
                    }
                    lane = lane.concat([]);
                    var offset = lane.splice(0, i);
                    var a = offset.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) !== -1 }).length
                    var b = offset.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) === -1 }).length
                    w += a * 15 + b * me.calcDownLaneWidth;
                    var height = lane.splice(0, sum);
                    var c = height.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) !== -1 }).length
                    var d = height.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) === -1 }).length
                    var h = c * 15 + d * me.calcDownLaneWidth;

                    var m1 = (Math.cos(180 * Math.PI / 180) * 0.5).toFixed(6);
                    var m2 = (Math.sin(180 * Math.PI / 180) * 1).toFixed(6);
                    var m3 = (-1 * (Math.sin(180 * Math.PI / 180) * 1)).toFixed(6);
                    var m4 = (Math.cos(180 * Math.PI / 180) * (h / 400)).toFixed(6);
                    return "matrix("+ m1 +","+ m2 +","+ m3 +","+ m4 +","+ (me.X + 480 + 200) +","+ (me.Y + me.RoadWidth - w) +")";
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
            }
        },
        components: {
            "Isolation" : Isolation,
            "Lane" : Lane
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
                var a = newLane.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) !== -1 }).length
                var b = newLane.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) === -1 }).length
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
                var a = newLane.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) !== -1 }).length
                var b = newLane.filter(function(it) { return ['parterre', 'parterre_dashed', 'y_parterre_solid', 'y_parterre_dashed'].indexOf(it.type) === -1 }).length
                w += a * 15 + b * me.calcDownLaneWidth;
                return { x : me.X, y : me.Y + w + me.calcUpwardRoadWidth }
            },
            calcFlagListPosition: function(i) {
                var me = this;
                var top = (1080 - me.RoadWidth) / 2 - 100;
                return { x : me.X + Math.floor(i % 6) * 200, y :  top - 110 * Math.floor(i / 6) };
            }
        }
    })

    //路面基础绘制
    var PavementRender = function() {
        var template = [
            "<g>",
                "<defs>",
                    "<pattern id='parterre' width='120' height='15' patternUnits='userSpaceOnUse'>",
                        "<image x='0' y='0' width='120' height='15' xlink:href='data:image/png;base64,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' />",
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
                "<pedestrians ",
                    "v-for='(item, n) in Pedestrian' ",
                    ":id='item.id' ",
                    ":x='item.x' ",
                    ":y='item.y' ",
                    ":len='item.len' ",
                    ":width='item.width' ",
                    ":area='item.area' ",
                    ":is-show='item.isShow' ",
                    ":height='RoadWidth' ",
                    ":offset='{ x: getPavementPosition.x + (1280 * (n + 1) - 80), y: getPavementPosition.y }' ",
                    "@on-pedestrian-stop-click=\"$parent.$emit('on-pedestrian-stop-click', $event, n, arguments[0])\" ",
                    "@on-pedestrian-click=\"$parent.$emit('on-pedestrian-click', $event, n)\" ",
                    "></pedestrians>",
                "<g>",
                    "<road-section ",
                        "v-for='(item, n) in Roads' ",
                        ":upward='item.upward' ",
                        ":down='item.down' ",
                        ":flag-list='item.flagList' ",
                        ":road-width='RoadWidth'",
                        ":x='getRoadSectionPosition(n).x' ",
                        ":y='getRoadSectionPosition(n).y' ",
                        "@on-road-lanemark-section=\"$parent.$emit('on-pavement-lanemark-section', arguments[0], n, arguments[1], arguments[2], arguments[3])\" ",
                        "@on-lane-flag=\"$parent.$emit('on-pavement-lane-flag', $event, n, arguments[0])\" ",
                        "@on-lane-penalty=\"$parent.$emit('on-pavement-lane-penalty', $event, n, arguments[0])\" ",
                        "@on-road-lanemark-click=\"$parent.$emit('on-pavement-lanemark-click', arguments[0], n, arguments[1], arguments[2], arguments[3])\" ",
                        "@on-road-slowline-click=\"$parent.$emit('on-pavement-slowline-click', arguments[0], n, arguments[1], arguments[2])\" ",
                        "@on-road-lanepark-click=\"$parent.$emit('on-pavement-lanepark-click', arguments[0], n, arguments[1], arguments[2])\" ",
                        "@on-road-isolation-click=\"$parent.$emit('on-pavement-isolation-click', arguments[0], n, arguments[1], arguments[2], arguments[3])\" ",
                        "@on-road-boundary-click=\"$parent.$emit('on-pavement-boundary-click', arguments[0], n, arguments[1], arguments[2], arguments[3])\" ",
                        "@on-road-separation-click=\"$parent.$emit('on-pavement-separation-click', arguments[0], n, arguments[1], arguments[2])\" ",
                        ">",
                    "</road-section>",
                "</g>",
            "</g>"
        ];
        return template.join('');
    }

    var Pavement = Vue.extend({
        template: PavementRender.apply(this),
        props: {
            Pedestrian : {
                default : function() {
                    return [];
                },
                type: Array
            },
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
                var size = me.Pedestrian && me.Pedestrian.length || 0;
                return 1280 * (size + 1) - 80;
            },
            getPavementPosition: function() {
                var me = this;
                return { x : 1920 / 2 - me.getPavementLength / 2, y : 1080/2 - me.RoadWidth / 2 };
            }
        },
        components: {
            "Pedestrians" : Pedestrians,
            "RoadSection": RoadSection
        },
        methods: {
            getRoadSectionPosition: function(i) {
                var me = this;
                return { x : me.getPavementPosition.x + i * 1280, y : me.getPavementPosition.y };
            }
        }
    })

    var render = function() {
        var template = [
            "<svg xmlns='http://wwW.w3.org/2000/svg' class='ivsom-road' version='1.1' viewBox='0 0 1920 1080' preserveAspectRatio='none meet' style='width:100%; height:100%;  background-color: #111;' @mousedown.stop='onEnabledDrag' @mouseup.stop='onDragDrop' @mouseleave.stop='onDragDrop' @mousemove.stop='onDragMove' @mousewheel.prevent.stop='onScaleView'>",
                "<defs>",
                    "<linearGradient id='orange_red' x1='20%' y1='0%' x2='80%' y2='0%'>",
                        "<stop offset='0%' style='stop-color:#a52a2a; stop-opacity:1'/>",
                        "<stop offset='50%' style='stop-color:#ff0000; stop-opacity:1'/>",
                        "<stop offset='100%' style='stop-color:#a52a2a; stop-opacity:1'/>",
                    "</linearGradient>",
                "</defs>",
                "<defs>",
                    "<linearGradient id='orange_blue' x1='20%' y1='0%' x2='80%' y2='0%'>",
                        "<stop offset='0%' style='stop-color:#3300cc; stop-opacity:1'/>",
                        "<stop offset='50%' style='stop-color:#3366ff; stop-opacity:1'/>",
                        "<stop offset='100%' style='stop-color:#3300cc; stop-opacity:1'/>",
                    "</linearGradient>",
                "</defs>",
                "<defs>",
                    "<g id='compass'>",
                        "<image x='0' y='0' width='170' height='170' :transform=\"'rotate(' + Angle + ', 85 85)'\" xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAACqCAYAAAA9dtSCAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKTWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/sl0p8zAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAEEGSURBVHja7L15fFvneSb6vAfcNxxKXmTKiaDYlkXLNkGnjrXYxmGTLraUCEzn1rpxbgkmaSsQmRFpu8ntTDwkq0zvTccyqJtC0KRNCKZRxupvOoQSOXa24cHEWhwnIZjYlqzEEWRbtLWQOtxXnPf+8X0HAKmFO0VJ+H4/ClwE4OA7z/e8+/sSMyO9Zree3lLqJ8Bp/cxA3a6Dx6Lybx6AqwgEAC3PHTwWSu/Y7BelgTq39cyW0lYG3CSAGgNQvuvgMUP+zc/M2PXi8br0Ts1tKektmPPqIMBgMAhwAGhOYdgeIupJb1EaqEtiMVANkCF+YPfTW0obAAihn15poC6hZYC5AoABIgCof2ZLqVuAOK1apYG6NNgUAGPXi8ejDK6zmJSFClCW5tU0UJcMVKVlj10Hj4cIaGIwwKwy4E7vTxqoS2TRBOH+3MFjdWDoCb5Ne1XSQF0ahMoXC3eiShBFAYLUWdMrDdSrt57ZUqoCKGNgR+rvdx08ZhBQTYCRhmkaqEth1RJRB5g7nt68tgETVYAoA9UMjqW3aR4UrHRkKr3SjJpe6ZUGanqlgZpe6ZUG6vW9qtaXqOldSAN1ya+1d93uSe9CGqhLfo2MjrnSu5AG6pJf8Xhc1YM1zvROpIG6pNfo6LgToLSemgbq0l7MrKbWUaVXGqhLz+LfsNLBDDCQZtTrCah60OfQg77r56YyO2SyVFkaWtcJUCNBnwNAG64v9nFIxKYZ9XoAqh70ORkAESoA1F9PQJVJPo7rESx6sKb2hgGqdN20AfCAASIY14L414M1DnnINCkRPPL3DQAQ2etrALBK1EiRQ/6c+Lse9Dnll8NSea4ltUdcK+3Qgz7/dQ9UPehzEKgKQAzgegZOMkMDULsEb4xTAlJeG+2AkAKa+NFizQmp0Q6SSf3MWDXx7+wWnxtOqe44AVjg1VLfcymClIBWSl739QvUFCY9oHkD5QB0AsLSlVO1BG6GxZgey4gHLrbgmWFPfUz5fULkp36fXATNGzAAODVvIApAIyAqb7yhB30aESy2dade09VcEcH6rQzUMVglca3qYjOrsoggqAfYwUBbJOhrA8hgoIWB1QD0q8UmFpshWU4yOQRqAbIn9ZEIF3VAIaIUYLFjIkwTr5N4dHkDBsBlFnCZoQOsAYjpwRq3ZFw15RoXe29qGWgFUCeukcBABwA3EbTF1FmVRfiwToDbAaoGaDWAJhYs4gZQpXkDMc0bqJY3a9ENAyKLzROVDqek7nhKeiY6pDSIysMU04M+JzMMPeiz3FHoPH0aDEAYUwxKRKesyv+JQE8+Jlr+2DVvwCCQBC65ANYJ8EjGdUYWH7AhAgzNG4imhIW3AnC5tgfKATL0YE3z9cKoBhFVA6iXoKwDeDXA1URwLrZ404M+ubG0Sg/6VGZ0CABSRIrcsDxEOgMagCiBnBC1T04CYkRQAegAVGbWI0Gfevz4yZiQ+WTV+cuDR7p869hkRr3U9aUWBmnePQYDFuNWsTgsnsWSPpo3YLi8gUr5OVQSkiGqeQPV8hr8AHmSe7pwa8FqpvSgz0kEt9z5KAtDo8y1PVC92IaA5g0YEbGZdQDcsuueIfXDMMD1mndPnR70+TVv4BKPNW7NuyccCfocLm8gdqn3qdqw0g3m1ltvtuPxx/8QAHTNG6iYSidO0WVVeU2qNDadEuRuACF50Ov0oK9V8wYqhTeBQhJQsUXYRw8AVwpI2whQQahmZhVCElRfU4waCfocBLQxcz0D9SC0AvCDsSinL8UIAIBaPehzSH3YzYIxt2reQJQILmHgXFTUfEACoE4yWxgAXFcCBPNkllOnYKuY/NLlV9jCBMBVAIVJ6M1hEmBtkbrqAekqskuA1ifdRwuL1ZRraJNSJcqMrQDFFtobsCBAZcBweQPFADUBqAajAkAlgEapAy646GLArQd9biI0AdiheQO6ZAQDQI8e9DmYEZHXckAP+pxJYAb0mcsmsoMsHRWYzY2TgDU07546zRswGOjQvIEYxIGKSp0+JN15uyVoInqwRiXCglrh8lBEhbiHyoxqFn0LGoV6h4prUvSniAw/gJbFMpakSPVo3kCDHvQ1S1HVIBlB+DqF/rmj4OaVB8yRPnzsyf9Hn+v7Vm1Y2QZm7dab7dj8+B9aumaxPBhzWq+90OAfuHBuNwEeBpomqwGRvb4GZoQs74V14BZEUu31qczCEwAwNO+eRbmvC25MyU3boQd9zQttOOnBmmbNG4gRYJdMuVtGiJokG+kAXC7xfxpHRuLRLPutW+eHwpPx/eTR5zlLjkP7djrZlnsKgCFB6pFs6pGi2AFGqhrQqAd9bssXO9/LtT1gEKGSCM0A+VP8zte+HxVABEBkKqW/an2J4//9i4/5I3tnpm9F9vpqhU5KB/Sgz81CHO3QvIEoM9tFkggf0IM+h6Xwu7wBY9OTzxrxsTGts33/3A8QkVPg1fpRWMpzfVlbRob/9jtXSZUgYGjeQJPYR1alXlvPApweS7eWhzKsB619mYFkWF/i/vd/dKdnKrAyowLgaqmKLPhacp1SqtaXuB8ou7O+zHlf5VTAjuz1acyISsvZbYl7qQs7ITwNIQBu1/ZLb+ihfTv9K1atdNzx8Ocq53DNKoALAJBi9QNAo+YNNMyBTTX7TcWt9/7JF4uvoOZo0qXml2pOM4BGAlRO7ok7xVi7kvriv2fN7Y4vt7xaiSW2llzidMvRzvCvOn534Nibx9sjey/v4JY3KQqgWeq/RmSvzy1dUH55Y1TX9oBxOZBaFv5AT6/7/eh+bS5sSkSglM59RBOiUbN7WaC5oKgwPIXnICTzCBrF5+cO6eaqlyD1SAv9sp6BqvUlatX6krYH7r9De2j9H1RjCa4lmeHfcrSz4egvjkePHzvRFhGG0KWWXwqDRj1Y49e8gSbhKoEqdTfndNhs05PP6v1GnxEfj/vnAKiLGqDLa5u1jnpo387a3MJ8R3ZuTmRqO2BPSPMGYsxwat49TQD8DNRJPb3MtT0Qkkat4xIgdYKoff2Dpc4y533V82H83TBAlXe68sjP34y9dfxEvR70tVpsoAd9tfIGVBOhVbJphx6s8QCoI6GbhmfkZSDo/T09zs72F2ZrGGhgBjODOSVfapZJ4Yf27VQB1BctUyH9vtM1XBsslxUJl5HlHfBAuLqiesrBr1pf4gHQvulj9zhK71m76GHs6wKoLUc7DQCVh37+pnHi+Ak3gDY9WOOUOme9wDLXCTbdEwJQRgTVNRvXDCPS22WAiOrfj+5XZ/50luKeJlj9sy3yI0J9RmaGmpufFy1xPjEjhpO+2BADzcyolsAt07yBkB6saSYgXLVhpfrX2qpWEJo3PbQOa9auaZqODpsG6mVW6MjpKJjrDv38DZx467dOgNogojTVAPshQqEdetBXq3n31Lm2zy6UyEB4bGwcA719DswiN5ZALnlwLgngGbKpgxm19uXFACXyBGbjFqyUor5KsmotgSLfamk1ALQND4+5JUj1hfS73hBAlcwaAiN06OjrOPHWCRWMZgD1RNQIoFWy6ZzYYNOTz8aIKNbX0wsAOzrbX3DMEOgTjKhJRt9MjTQ/ABSoRaCku2m2yyChq3qIYDR/OxwD0A5m56b167Dm7jUGRMQQaaDOcelBn9ZytLMaQPTQq2/greMnQECtiI5Qo/SNxub6PswcHuwdwNjomIqZ1nExaymvM+trOLRvpwbAXagWQVEU4zbnE/pcPpPmDcRc0jj6Vkurg2Ux5aaH1mHN3XcBEGHPpVpZcE0BFUCVrE+qAMg49PM38dbxE5ZF3Wq5Xua6iBABgH6jFwA8ne0vaDN58mQqpeS/M2FUPwDYlwu7cV42b0OJGvp2eCtA9WDGpofW4e61ayDygxGTOQKxNFBnz6TuyF6fR/MGqhlAdVWlG8yVAHD452/ihACrCka7nqhrmttbAkBPt2EBr36aQNAISUufJGh5htNQDn93pweAMysnG5nZ2YCI5s1peTasdILRxoDbAumatWsAYZBGAW5lRh0ANbJ3XvbwxgKqFOdhZpHUYoXpPueprAJzHQOQBpalH/plLsGs2XXjZ541AOhsxtF3wQCYtc7ofvd0FNSEuCehr5JCqV9Tdvc7tG+nyizUDfsyFTJ4MCe9u2rDSg8zt4HICWZsWn+vZFJEmdECoIqIKiGSdPzMCOnBGjUN1BmqV3rQ16B5AyEiHNCDNX5pMLVUV1WGwRwmEA69+gZOvHUiQSCWC2sO73uAGejv6bNwN50ggJNIDEVL5PbLKBUpCqBMvcVEqAXgUGwKCtQiAIjd5nwiNgeQ+sHcDBK5BsJwugsMGABXAnBo3kAdM9wAdrgSHgJqjizREm5lCbKpRzKorgd9rSKWTy0A+13bA7rMz6xmcJQAHDr6hqUGCNCA2uaQOaQTAcMDQxgdGQEAR2f7Cw1TPEdlFhP6LGa1kQ1ECogU2BSbdmWR/1UHsygsLBQgxWy9GFXrS1TPhpXtYK61arY3fewerLl7jaVCV2rePTHhUxVZTzI/oFa6sSoBOJaicbUUGdUQiRUcJUI1wM1iQ/ckYtAtRzoNMKoBGCBMYFYRDeJW/fKh1yu5qaLMwrDo7TIsnXNHZ/sLV2KZsosMK4VANhtIUQSrXll3qAegEgFFyxJvE5kFizoBnOSU1MJN6+8VOqnwRjSmJoRLMghH9vr8RIhp3kBdRFSdVmEJzsZSlhCTOgS4WAdQB1CzjF1bjusJq+VoZ5SZq60xjodffTNFDRCjyPVgTdss9FadCBjo64cZjwuD7cruKtUyoogIChEUmw2KokBRFBARDoeecV7OHcUMDwDkFhYgIzMTIMJtzifCM2TSWgDt0rgUIH3oHssFBQBhzbvnooNLgJOZWwDokb2+ZoYALBFpC5XPes0DVfpCQ0TUDNGkoVLUjvtqLxfeaznaGQa4yRK7qWqAdA9pANpnKMoizIAZN9Hf22exau3lclYzMmzOjAwFikJQLANK6qekKCCbDVCUSx4WSjkAhfZCyxGrz4BF1aoNK5sB+MGcCOEKP+kaAAwixAi4ZEaUyxvQATKY0cyMRoB1PVjTzAzHUgupKkuFTWWVKFzbEwD1M6NJ8waarvTcliOddQB0Swmz1ICU8KUDhDb9v33RM83LCVsM2XOu2xKbEBntlwCbQqpiU6DYFNgSgBU6qmKTj4rNeQl3lFuWYyMjMwN5hQUW0A5Mk0UdALcB8CRyDKR1b4l7CcJK1xUyomSqYCUAJ0DNADUCCOnBmoZ5cvtdH0CVfY0MFnmkOyJBX4Nre6ABQAumn9RRSSIHEyDCoVffxIm3fjdBPBOo+X//044pK2A3PfmsIVw4jLGxcQwNDFoA0ibnrHorVjkzbASbQrApgE0hZGQoIJsl9gWAlUswKnPSo1CgFoGI5IGYOr7v2bDSDaJ2MJwJI44s6/5O0aZNYLduOhlRMrdXTckPaAYorHkDTVZzuBseqERQIaIjbs0bqGNwOLLX1ypP+7TEYMvRToNlOBDSAhe5Ab+d9F7keaX56fbDoWem2vwDlr++70JPoryEmScAXbGRalMIigIkxT+EfipZViEFpChlk3TThlS9W11eLMFGsducT0SnEPcNzCwallnJ2kQi4nT3Gsi2OwDQNN0yEal2hWV1gFMC1tCDvlaAnDc8UCN7fU5mQDalkNY+qa7tYqNm8lotR05HkaqLEXDo1ddT/ayW+8gJovYj//J/X8ltpFvgHOjtx/jYmPVcR2rOqk0hh2IjZNhssCkKbDaCzaYA0jVFAqQTGPXQvp0qkdUZkFCoFknPAF1RP7Wy8JFMcUxkZwvDaU1qUWHUtX1mGVGinRAaCbCSrD1EqJa1V+4bGqjSFeSJ7PX5IVvFQDj7tdkkmrQc7QxBdBWxXO/CG2AZWJImiUgloO217/6n2suIf51IHBRmRp/RI59LAOC3clbJRg5bhgLFRlAkSBVFgS3FNSW/UlmpnmXFKjNbDn7pvKDIZUS9E4R2ItJokjW2UYI01b0H0Oxq7EVkrZ4IuzVvoIEZbsmyxtUG6lUr7rMK06Tz2XIB9UiRNeuNkYV2bSByksU8RHh4/TrcfU8pbBkZwshRFGH02GzhDJtSXf7vGoxJjvhWZnYDQGZWJm6/05HQI4f7e5veeb2jo63tZ1V9A0MagRLG2y03F+NPPvlJaXGTJD1Gz9kzdUpWbsyWY2+Vvnhk52Rj5R2rUtm+uKR824TrqN640mOa7CcilS3VxjpQG+4VLqiJt7BiVg00Jt4bD8AugFo0b0BPvVc3HKNajCn0IKGfAhzCHFvDWJUBYDZS798rR17HiWNvJa14y/cJuAFq+9W/7XROZHtOWN/jY2Mwzp5Fd+d7OPXrX+Kd1ztqCWjOzc3SbDabsPhtNvGlKDLGL8Kn1veKzeY3Rwdbx/rOYnzQgDk+murgBxFFJ4P0C498qFlRlGZFIdW6ZstKenjjfbi7dK14nyTN1s0VpLIdEzTvnmoCYhGpBmCOOb/XJFCTzn2EpeIek/qpc64bLcEag0i4mLB+duTXOPb6G5hETGDAqSjU1hH+e0+KkSeug+MYH+zBud+/he7T7yAnvwAla0pxx4MbMG4yFMUS+cKPqmQoIMHUE/ypq+5/AI6yj6J4xa2wKYz4YDfOxY7DONNpEWLiYPg+sdqxvWJVOynkIULita2Wlo9uuh9r7ylNqCPCoEJoKlfedJZLhKjDetDnZ8ADSpR8uxer2cRSFP31Uv/ZrXkDsflKgk61kMFcb+mn1mfVHi1H6X33wZaRYbEdSJHRJJut6b5PfrkuEvQ5KDP3pDk2hMzsLCy7/cMoLL4Z8fg4+i90AZSN37598u2Vd9zXUbxi1ZvLVqzGshVJZ4I5PoqhnjOIjw1jqOfMPX1nfl820P3uHUU334rsvAIM9Rk4/+4pDPX2IjM7G9n5BdV/8MTfhXb8yUc00+RWk6Gapolxk8FxUTRoxk1s2nQ/StfdA2ZT5BeYDJM5CuYK119/3Zine5PqTnNDNDc+cDWDAFcFqMKq5AOad48uN6UWopHtvNfuVK0vaYXV/pIICgGKTcGjDztRet/9UKTIhiIeyWYDgaPdp99zkKKoN33YAfstt6H/wnkM9w9hmeOB127+SHlbdsGy/w3gMGTjiWmsYgAbu2LRR43Tb1UMdsceLL7tdowM9KHrvVMY7O1FR0eHfvLU+5ppmjBNBptA3GTETQHUhzfcj7vvuUc0DDbjluVvMJsVj3xhd3Q+9y0iOs64iNDi2h6IWj29INpp6jcSo3rkSe0AEFqoenLPhpUqM7cDcKSGORWF8MimcpSWlcGmZIBs0kGfkQFFJpIULLsJ46MjGBoYH7m97I/Casma7wN4cR6sYHWkv3vzqV/94JPDxnvu/OJl2d/f9228+95ZMAuQmqYJNgGTGfE4Y+OGMqxdtw4WiJEEa+XDn3s+vID3yU2AS3bMDi1GL9YlAdTklBGEXN6A1V58R+Gtq07FTbjsy9SOArUoXFK+LTqPYHUSoY0UUhVFJI5k2BRAAR7eVI619zllIolgVCupJDtfhfrhB19Y9uF7X8DcC+0uuUb6u7ce/G9/u+21V362zYybiJumBKMJMBA3TWzcUI67SteJvgGmKfsHMJjNxo1V/7Vhvq7l0L6dDgBadm62i4iM/rPv9rAZj1oiX7bxdDELVe1GEP0OAnbId+6w3B6y8UJtbn5ufV5RgWFfVhwGEGHm8GSLeKbrcw/f7hEWNGAj4fcUhoqChx/+KO66t0xEkWw22GwZKP7QusO33fPxb5EtMwQgvsBbYjv64jc9P/iXr39ueHB4Y9xkmGYcpmliw4Zy3Fl6L5AKUNMEs6mv/7++NueepIe/u1MDaCszazl5Oc4Ce5FeWGyvs4hC9FKgKulmi1hNja9rRhWlw7wVoEjKKdWku0qfdLLrFZvNU7RMRZFaBFtmRhSirulASfm2WelIf62t8isKapVJQFUUBRs2PoC77y0D2TL4Q87H96i33xsE8MZi3ozTv2tft//5p7wfvPd+TdxkWr++DHeW3ptgUdM0ATDY5Bgzlz/05N8bs2RNNwAXAW6yKSiwF6FomT2WmZ1dVzIpxVCWWodd24X0k89V59L87VpiVGlJMgA6cDnlXJYP1wPQ8osKUGAvRH5RIaSOqDNzBEC4pHzbtMVQzccd7TYbOVNBSiRcTJseXc+uJ555Sr393iZcxbWrpqLW8aEVz99x9zoSRGYCUndlNsEmlz/4f341Ok1gqkSkAexihpsIDmYgKycb9mUq8goLDMWmNJaUb2u6nF+VhRG1CkCHBG3semdUPwGnWFiOUrT4nFNl+Bzat9MDEdpz2DIyYF9enBIjBwCKEcFSE/QrqQlf/KPVqk2hk6QoqmBWxTKw+LNP/Zen7nvk01cVpNY6oX+zdsj44Hk2eTJYqz/6542hK4rzfTudMoVwK1LKtYkIBfZCFC1TkZWTDSJqYubGK+2XYFE2NO8eaxSoG6Kq4cBiWv+LzqhWOI4IZcxQIXqIxqbJDg1E2CGfhwJ7Iew3FSNLlBfL2Y4AwDoRHWCGXlJ+cTZS7WN3OhWF2hVFgU0RRtWf/dWXAh97rPqLWELr9Zee/8f46LBPiH4AbIbK/+w/V18CmCqniHNOVB2IwEZGZgaKlqsoUu1QbDbReI25brqSSOalypGZwq143TKq9MtthagH0mdrNUqDywrrAUiKsfyiggTLpjj4YzLHM2GURYI+5+9+97v2t373DkgBNnziscNu3/N/tdg66ZQegb5z697Sv/kNNs2N4yMj6O8+3yhzdXF4305N7qdGJMLOMq0B1vd5hfkoVIuQX1RoRb+iEqD6HIhGI4IGht21iD2rrgajOqU4WgXwKdnPczbWqlMmH2sWcyjSMLAvU5GZnZX4v1ZiiizXiP72tcOw2WzOE2+fQE/vEGq//tMvAPgmluA689bPPn/2xOF/jo+NwTjzPjILbgpDydCQUquV+IwQerd9eTEK1CJkZmXK35MBcF1J+bbQLElGA2GrrAmPANBd2xe3j+qiAVXW5vfIIV/R+XLwS4OrGaKRgkzrBHLyc2FfVoy8ooJEYJ+IMNhzAe+++Rvcfs99GOrvRZHj4RdWrdv42UVwQc3adfXWT7/xnXx73rZTv/4V4qaCjDz1oh5Xufm5yLcXolC1J2W+mJq4G0DTbTNsX3kloiHAyeAyIjrg2r44euqiMmok6FNFOS9JBZ9DmnfPvFiQh7+7sxaMepCoxLQ+VWZmJvLVIqjLVZCi4N03OgACVt69DoMDGFnj+uwTWCBn/nwto/PE1rPHfrjfjMezz/z+t7Dl3wRSMqDYFOQX5qNoeTGyc3IS4JUNMUIQhlJsnoimASC7tPz1xbb8FwWoerBGI9BWBk4REHUtkLUojYpaTCpvtlqX5+ZmovfMO/jQPfdjeHAAdz5SvT+7YNk2XAPr9Zf3vLB8xfInfv+rV8Gw4aZVd6BQLbKMI1hzWKUh2TjXToBTqG4OOQITi+VPXWz3lIMITjCcvEBJKFIdcEiDy50K1vEhAzaF8ZEHHsLgAOOOTds+C2DftQDUrljHkxdOHfnOYI8B44NOfOSBj8GWkWkVBIpqCcJFDvt5vHduiFzhGBFiiyXyF5lRfbUAVAKiDDYAii7GUIND+3ZqRPAzC6t4vO8sblrlQGZ2NpZ95OHXbnI4/xhLoMximkt94+Wv/6hALXwwFn0Nt37kLhTdvALy+neXlG9rWCSycRJBZYYGMfVlUeL+9PTmtQ3PHTy2aB9SWqsaRFeO0GK87+Hv7vSYo0P140M9jtXlD6Ln7Bnc/6kv/wOAL+MaWr975V+/lpdvfunUr3+J7Px8rLhjbQhA3VzzIKYrDQH2yAG9sfk0iKcF1Kc2r2WSnfKeO3hsocRGg1DyrepOjmrePYvKZJG9Pn9mdnatw/kxDPTFcdejT26BSNm7ZpbReWLz2WM/Ojg80I/u0+8YmndP8WJfQ7LVOzsAcgCsL0YAgJ7evLYVYkT41pQZ8bt3HTwWm2egqMwQBXfifaKLEYL75b82OBWF1JGhIX9mdrYzv3gZbrrz0bdvWl3+IKaf9LxUVvGuv9r4WsntJXf0nO/GibffqRwfjxswEf3/fnxyMVi1AeAoQIbUUxfN8qenN691PCdB+cyWUhWAm8E7ZLnxbgDh5w4eM+YAUAcYHhbiImb5OudLGf/ZP+/QIOrnNUXUJ7lku0cnKaQmapdIFNopNhvWaJ//nzlFt/wZrsEV/Jst/3byxNufjsfjiJtxmHGGGTdhMjA6bkY5zobJZtQ00QMgBuYYEcVCR07H5gGolupmLU2qALOSxE9vKfXsOngsNMX/cQJwXmRMPb15rZOIdsjYsSpb5YRZsGx07h/ScqMgNuWs06BPZcAphu7CCZBdOJsBEDTR10m2dpTtc0ixyWwo8Qgl2V7Hqggt2/ofvwrg2WsRqN/92hd2Rg+98pW4aSaBajLMOGPMNGGOy59TGlQkwsmEGEQvhRiAUwAMEEXBbLQc7Zzy3kaCPg8IMQsyc5WIT28pvUBAnSSx5CA5GUmUbsUdBHRkPL1lrV82xvIA2AEiRwK6zGDRrEGlWU6hk0nSTtlfClZrCBadURzSJyf1HawSP0NNADIJ7ORPlHwUTRM4MdyBmWXF5qT5D/L7jKwcXMur+OaViQ8mOlyLZGoBTLkfKSCdsAkMsd9EKdMFxf+r2rASABtgREFkgLkDRAbEvFm0HDmtMxAFJ3GgB30aAQ7X7I1ilYFmSlyH7I9AKTMRxENHBoBaAmoT0+dAiT5IAFoICD03S33VYlGZPOEgwMHiKxHlE48kH5Og5MkIw8R9J6vHEgMKWZ+MxTFIwTZNeoWcoluuaaCK2D4nmGfC1EACwKY8yMnsFE7dSkZi4ydIU/E7FWBNfu9GwkfLqFpfAkBMzwaA7OwsnQCceu9c47daWjUAUdlTYfqfZcL3lDLxkCZQFAPISP4HkgyKKIjqdh08NiWtV21Y6QCz4/51qzUAsBfllymKombnZDtF25xkBxHrXZMXwROH3fKkzaSJHyL19CdvjIChopDs9yRr62VrHciEaFFfLxpFjHAW7sC1vgSXJtsMcSrYEoxK1nQWnry5qQMyLAnHE+jBes4kMYwz53qs/dfka2jWUzwbVkKwLltM3JOiWlwOT5UsfdmCyGgHM9dR8rqqAEKGjGzEGNgNohgBVQCan95S2gggvOvKhpQBIvz6jZO6vOAOiMrSKIi0xARbToIrcUpSMpom0OXkAERq3lrq97iIlhNPEdWmCmw2BRk22WHPJvTW1WvexUOf/tI1C9HyjZ/AiuIssCkSqVkWAlqPZtwqo5a/i5swOS5/vtw2T2QGShAJTWC1i9dFz4tK0MUI6JG6p4HLz7HSLZfo08KQr4JoYofnJFE+s6VUY2ZkgCj83MFjqV1FwtLSagWz/5ktpSFm3r3rxeMXvVnLkdMGkoO7LnlinnpsjXtlyc3O4eER18jIGEZGx5zMrHYb/Rgbm5SwlNI1mVMzS5iTG8gXn3oCJjGHhemkQpP4aYbzn5be4onEN+kbSzUwTaEWcAJlqWx6KYa+vGDmVGISBnFUpA5SFOBTAM2q3J0hJh4+s6VUA1Av30cnoP6ZLaVVzx08Vg3ADkJPBsB1qa4AAnZADNBSpWJeC6D26S2ldbsOHmua6cV86lN/pIsPyHqKXRezsqaq1pdYLg8niFRmtgwq8ZWyqxcNwb0c6OjS551A+ODd965tmE6S4hfjkFOklfXryZzIF+n+PJFsIvJ3eqp1L5suO5M9WEWu62wjVATCM1tKNcme+qVdU+wh0O4MgPzPbCk9wMw7QORMMFmiRSNCEFGrWbkiNFG7n9LZDg4CaZGgL+TyBmIpbpFLvr5oAQ4HiBwEOLJzMlYND485SIDaicliKUU7UCYbIASMDI9e00Ad7jkjPpO8TTzJ0OKU4ZY8kYUtvdEAqEOyYxSAMZ2u1HLVSojrCajR7HMl5PW1PrOltHIyvp7ZUuonoNby5NDTm9cyp4hcuWIM7JYW/5wiHkkXVFJ8zGBjplyyzaTTAm5eXrZ9eGTUmZeTpY6Nx50ZNiWpo2bYoJCCuuf/+/+8fc1Hr0mH/wn9m/82ZJz5NMvS6Xg8Lsqp42aMYcbicTPGZvwUm2aMmWMwzdjDX2iKzdf7i+l+yS7UBGtoxaz8qJolOQmIXimEnwCqYFAOAdSya5bsOQ3HPeSHVBcrRgwAX/yEQ9v40H3+geFhZ9Hy5Sj/+GffXvPQlmsyhPqbg197LSMz644Lne8hKy+vUlFs+gP/R4OxGG+uB30Nks6iEH7x2GJ1TKGnNq+9ABEqDc13fH/SB9TlEYxdjbpwPehryMzOrl9d/jEMDQJ3bNp2zSWldMU6NhvvHDk4YBjoPv1uTPMGVl+N60gmpsBJhOhi5KbSU5vvdu86eDy80G8kGxk4IJJvVakCNC3Gxna2v9Aw2HNhx+ljr6sfvv8B9Hd34b5PfumaS/M7EfnO1wrtmV+KdfwS4+MMJacoTIS6jZ95NrYI4HTIUvUeAFECDNf1Vtef0gA2tphZN+9H93uYuZ6IHMyMt39xBEU334yC4ptg//D6125afW0lTv/6e//wI/sttzwYi74GW24xKCPb+lsTAY0bxeihxWJUYRuIZnex6wKolmtDfjAngFUM9CxUvY2cB1XPzFpqA98P3j6Ood4erH5gPbrfP497H/NdM6UoHxw/8uTA2Y7v9Hd34cIHHyCz8JYJ1j0RDGY0bnry2aaFAicBW0HoYYaORdRPF5NRNYjIlU5AbKFO4PvR/Q4JUM/k8Euf0YOec+cx1NWJW++4CwzGRzZWXTPFfSfavvVCXmHWE7//1c+RW6QCmfkYla42mhi3j0l1ILxQhEMEpyzvUa/L4r5I0OcU1j/KJI7mpd7m/eh+lZlriWgHM6uWz3Z8bAw9XRfQ39NnDeDF+EA3MjKA1eUPofuDrpF7H/Mt+XLp8yejW3vePbp/uL8/+9ypk1hd/iAyc3IxPDCI/gs96O/pu1SIUwdQt+nJZ6PzBFBr0mDPYnpsrobo9wPcITP7o/P1unJAmV/6UQEAg3396O02MDQwBMvXb31KMz6K+EA3VtxxF0hRUFK29YXCm1ct2QYUwwM9tsi3v/KddQ8+tO1k+2vILy7GbXeWItX3HR+Po7+nFz1dFzA+Nj45BSIkAWvMG6MK6ehkUVIUvu4YVeqpGkQzL3BKE98ZAzS6XwOzX7hICPHxOHq6L2DA6MXYxTcLgGj5Y8bN8FjfWUdmVoZz2coPg2zZWFPxhS8otqwl2dLne8G/+Xz7z37yz4+4NsFmsnH7urJQbmGRm4gcACY2nWDGYF8/+nv6MNjbn+gaIw3G3QCaZgNYSz+V23gKKd0Yr0dG9ch8VD01dgwwZlLo1xnd7wBzM+QUu6GBQfQbvejv6cWlPgoRomDoIBzY+Jlnrfd15BYWtmfnF6qKQlj24fsP316+Zck1SftdVF/X/NV//w3TjG/My83BH3y0rPGxp5obhCTZ7yCCm5ldADQhUQBLdsTHxmF0XUB/Ty/MuCkj4hRj5sZNTz47I3KI7PU5LE+N1Y0RQJl2AzRJc0Nk85/CNCf1ST20HkCtGTcx2NePnq4LGB0ZnWw3GQDCRBSx31Ssr/tj30U6cPu//Z2biFqRUku18t5PBJZ/5MEl1Xby7z770X8cGhz2WQMmTNMM7zp4ovLSKtB+jSjRD9WZyrbWQR4aGErcBiI0Wgd3miRTJrfY6sZoXJeMmqKQd0AMQjOs0OpUtTfvR/fXAqgfGx1VjXPdGOjtl23CkbrxEWaEpzIefvmv9U4iaiNFSUxnJlIAAt96z8efWnHXQ01LAaRf+8uHa3u6LzwfjzMlxvmwCdM0G5teerthKu8HAxoBLmZ2W+MpR4eH0XP+Agb7B2DGTUCUyddtevLyAQM9WKPJDKloigdnK67/Rr41DtkkzRoN3nI5fef96H43AH/vhR7HwERGiEmr9gAAfbp612v//SsqKdRGpDhBlKgCIBC6z5/Bj176KX/qc3VPbfzkX15VsL7+w0Dti/u//fyF7j6ypqRYPfxFkjRXfP3HsWmDpLP9BScRuZnhAlgzTRN9Rg/6unowPj4GZjQSoWnjZy7ex0ldpq94v64n95RbuqfCmjcQTdmEWOrp7Gx/wTk2Oubv7+nV+o1ejI+NW6c/AiB8JQa40vr5vv/UTEQesqWWrig4f/YD/PAHP0E8bkJRFP5D9xN7Nn9h56IPmxjuPbfu7Vf+xTs+OlwzMjxIP/nBy+jq7hWZ+pBl0WJQmhE3uXxv26kZ70NndL8KZg3AViLShgYGHf1GD/qMPkOya2gSUGvl/Yql3C/HDTZsAkgVIe9H9zt6u436wf4Bz2DfQFSK9APT1aWutI58+8u1is3mV2StlVVK3X32A7z04k8Rj8dl6bUA7+q77jz8mS8FvrXsttWhRXBd2c689TPPmbde+Rwzb7RaoY8OD+GHB19E94U+WWrCiJsQj8zRf9LfKZ8H954DgHtsZNTV39vnHujpi42NjlVvejJpeAJwk2DUCIPDi93l5moZU7UQCSmhVNdHlv0WKLZMdXw8HpHiPDZf73ko9DdOImq3hugqigICcP78Wfzg4E+FVawgURxokypBcXERPlv31RdWf/SxBRuIZnSe2PrBm23bRge6t4mkdVFGAjbBbGJkaAgvff8HuHChPzFqMm4y4nETYA5985X3qufzet6P7tfOvNu5dXhwGCNGZw9M02A5WVEawlXADTIQLbLXp4ruKVwmZ06FFuq9Dn3rKRWknASgWiAFEbrOncXBg/8L43ETNmuCs3wkhWAvKsCWP/80bin5EHrPd4/ccvfD4RV3b5i3EZMDXe9t/uD4oU+ODrzvtt+8IvvM22+BMmyiAE+CVBhQjNGhQbz0/ZdwvluAVYh/wbqmydUtRztDC0gsTiLIgWhXRz+9iqK/xg9QYqI0icIuYyH8cq/8c207FHISKQAIZFNw/swZvPiijrGx8YS4tymyWlUh5OVmhz/x8Ue03Lx81X7rbVhWcjvGR0bQ192F3GLHa7eVbmzLX377jIf2Dvd1bzROv/Xo2bdfrcjKxINFt9yGge5zOBt7G2Mjo8gtLAxn5+ZrzKYaN+X0aDmpb3hoEAe/9zK6uvsTrGtyouCxfDqdTmYIUE2y5wHNGwjLbuFuIQ0Xf3rf1Rzaa7k5eojQJCfDOefzxEa+8R/8RFSbWvffde4cvn9Qx9hYXE7uky4qCdQMRakL/DTWFNnrU4tvu/1kd+d7qmKzQV1RAvstK2DLyEB/93mMjYyi8NaPvJ1rX9GRY7/lzYzMXOGz7L2APqMrqQP+/jc4E3vznttW3FJWXGy/o2DZcmRm56Dn3Afofu8djI2MQLFlgWwZlY98/r+Gf/U/Gpymya1gdrDJYjAvhMgfHhrE98Mvo/tCP0TpfqJBRAxA+UwbQFzh3qgQCScx6UN1sTRkF9t/erWNKQcALUVP9UjjqmW+fHP6Xp+HiJoTTn0idJ0/hxd/8DOMjo4nN0BOmlYUMkhRKv9JP6VL69gB5pPjI8O48MF76D13DvHxcWTl5cF+863Is6sYMLoRHx+f8L6/+eWrePONty+6nk/9uRvLb16Bvu7z6O/uhhkfB9mykJFTCNiyABHerAOAX+z/z6ppms0wTTcICfcUx02MjAzhe+EfodsYSCk8ZQDQW452VswXUIlQL6FhST5NWvuhGwaoKe4qD8S04hbNG9DlDKM5d/qTSn8bCAmnfvf5Lvzg5VcwNhZHam8t4fCn6EfL76r8YqAtlmIN1wLkBwHmeBynjv8W5vgweGwE5vgIAKBg2XJkZGZNqDz+9S8kUGliDwLtkYeQm5efAHrBspvwwbvvIz42DinAoxs/8+wEK/7Vff+xgdms58RoSQHYkeEhfP97P4HRM5hkVZF509hytLNhbntXI0lkT0iGuGvlkIndV2sEOpCsKL4qrMpAzLU9UA0gpgd9zQA75w7SGpUIzQBUYgAm4/zZc3jxJcGkiQZiEkS5OZmh5sPvlaeCVC6XVRHf031BdAvMzENG/jJkFq1oJEIFgXQ5mxSQBo5pilHm8biZ8HuaJiM3L7/ytrvuLl9d9gcovu12ZOXkosBuT4hwAE45eyCxHnry7xvYNCuY2UiMPzcZWZlZ2LLlD2EvykvpHgOAqL5qfYl7Lvsn+i1QTA/WNANwa949DQAaIcOyNxxQ5emMyfmoHgB1BArpwRp/RPhZZyskmkVSr2hX0XXuPF7+0eFEV5aUsnADRNXBttgl3TtE5LYykvqNXvk7WPpgk2t7QIdCEVNa6HEWrXTMeDzxJQAbRzwej2neQPjuT/yHqLzpYGaoy1WkkDuIkn2crLXhL/5BZzbLmTkqDpcJkxkZmZnY/LgLxfa85DWLi2yWTT1mJfIFYQCad081EWJ60NcKEeYO35BATVmNLhHlcLOYZLKbAV3qsTPd6AYIyxQAofv8ebz848MJnTS1TygRVbQcOR26jBNcY2lxD/b1W5Exi4QbEyFb5hjHZVhTPlqMOh6PC0YVX7EkILkJRIbl0y2wFyZAJkKcF69NnudibJoVpmmGTFO2nWBGVlY2Hn/MBdWel5rlrwJolv0OZqKGqQCrmjdQDbCmB31+ZsQ0b6ASS6Cu7KoCVbKqQw/WtEKEUatln1Q/EWa60RqAetHlDug6dw4v/egwRsfiiZaMDCA7O1MHqDx05PRlvQtEtNUCdm/3hHukp4YYzbgZs4wc69GMC2c8m5xgVNM0Ey9SUr7NAKPO6qVQWGxPzhpOGTc0eT3yhSbj0b/cXc1sVjObkCOnJVg12IsEWCU1O0Hwz2T/hOZAHnHYqUky/w496Ku9Wr7TpcaoMc27pxJANCLEjlPzBqqZoerTVAGkvttqWcFd587j5R8fwehYXLRhtDiLufEbkVMVsrnbFc8QAIyPjmF4cGgC+0+4uWzGOB4Xho58NJklWMWXaQLxOHekPq+k/IkQQFEwIycvD5lyOjYB6qF9O68otrW//scQMcoZbFiNGbOysrD5cQ2qPR/JJr3kqVpfUjsDd1StGAjMYQjJ5pR+7dASwMjVB2pKaM7PQB3AIVm2omneQFhu4hWNJwCtEA2D0X3+PH7wo8MYGzdT21QaACqnYxHL2LcTAIyu7sTvMzIywlb821of+8x/iVni3kyyJ8bj4iseZ/k9X+JgWM3pGEXLkqxKV2DVhJW3PRAFsJpT+nVlZWXh8cceRbE9L7XjtL9qfYk2DZACQFjopwQh2eDUg76Gq+U3XYqMCs0biFqbA1AzAS0ANcn81alunF9McxFM+pI0nBL+ReYogPKWI6enZQykNKhFv9GXSMgeHx+/ZNSM2YyZZhymjCCZcRaxeBOIs3w0+SLRKUeR6wBQUFQofb0A49J66iWsc0PzBioAarJabCZ11nwkrD+gtWrDyisddhVgvzzSdQCqJECbFjtDaskDNeVka5o3UCnr1P0CsAinNLCY/BwPQB6ApLg/jNFxM9WMDhFRRcvRzmn7/5jZRUToM3pTk7MbL5ckwybHEhEkyapsuarGLReVeTlWqhZBBwX5RfnWodAO7dupzuCQ1zFzJYl++8jKysbmxzUUq4mp2iqY267gb1aJqE4OF/FIca9fbs9veKBq3oCheQMNMruqCow6TjLmRV4APVjjhBh/jq7z5/HSjw9jdDye8PMUFuTUtRw5XR2aWh+9yC0FAH1JI8ogoqbL/X/TjAsfp+XnZAiRP24mEki+9cp7lzRG5OTnJgBQb1qecJ0RkTZD32eYGRWQgyGEGuBK6qxEzqoNK/2TiUEaSVXM8Aj25Fhkr68ZYiRPKA3UKY2rQB2LHMgqEuJIlQp+Kvu2QuqkL1s6abLisvwff/L7ppm+cWf7C05mVkeGhjE6MmL9um7jZ75yWbCzGe9g02o9LtmUkz31mXmqg9IIkJGRlYmcvBzLV7t1NuoTgAqIBHNkZ2cJP2tRQmetrVpf4knxubr1oM+veQN1BMQiQZ8fIB2MRkxsE5oG6mU2PBzZK0ZSuiRgAdqheQOVetDniQhx1QqQw3JBjY0nRLQOYHXLFVxPU7Gp5ZKSWItNVbHJDINZiHg2zWRX7MSkFlzxWsQcU94NAPn2ooT4n4NUqgS4jlmoAY8/rqFYzbeuxV+1vsSpB321LAB9QA/6/AzoLCbg+Hme+9dez4wK1/ZAg+YNhKwZqpo3UG3pTCxSz7Suc+fx8k+OYnTMGq7ATS1HOyvmmEHkMuPx1EjUlEnJphmPmqYJk8VX6oSS5OSSKy85GTpWVGxHZmYmADimclNNoQo0SXY1srOy8PifuqAW5YvxPITWztOno1IiRSEBKlstVS8VK/+aAKoU7xoRdAnYZktfBFDbJSNOIlWPDADVLUc755TL2tm+X2Vmrc/oTfSzn1YJDLMBk0Ey3i+SRCkxAYaZI9Nk8zpmRoFaNMGXOwfJpEsXVjQ7RxpY9nyA4fjhT3++A+BKqU7FGFzHQC2W8FqyQNW8Ad21PaBLF1WLPP3NIix6xGLSKDNXzE+Gu5jQ0dN1YdpsCgDa9kA0dTQWW/O6ZpiVdpvziTAAPQWornnYQ0PzBsrBCCX8rGo+AHI3t4RrpTuqFSDHUnJFXVNATVm7LZB2nT+vvpRMMAn/6Sceqquucs/LmxDR1qGBQcTH47Bl2EIzao5LMCbMbEnMKWNLb57uqsvIykReYT6m4T+ewYdDBwHVWVnZxuOPaVYiS33zt1udAJZELP+aB6rMB2juOn/eaRlOzFxXXVXZeNvKkq2ad09U+gPnxqfMWu8FA8xsxMfjdTN7LqJyQkjKLzHjmVYl5duiYA7ZlxeDCDi0b+ecwKoHfU496FOZYYDgAFCRlZUVe/wxGW5ltDa3tKpXM8/0ugGqHqyp7Tp33v3yj49gbCxuAKiorqoMA+zXvIE6PVjjgQj3qVOFW6/klhofHXMM9g6AiHbPtJFYcipyCkjlL64wWvGy7qqcvFzDlpExJ/Evu+7FALRq3kCIxVRpJwHl2dlZ+ubHXVDt+SoRtXquHLlKA3U6BlXX+S7/Sz8+jNGxeBRAuecv3FEC6gGqFOURVKZ5AyEi+OW49NmIfa2vpxcAYhs/85WZ62qEyGTkJme1zmyVlG+LEdHuIpGrOheDqh7CH1on/aUhiCZ1btf2QEVWVnbjZpEi6GTRFTEN1NmsSNCnnjt7tlUyaajlyOlyEQplNwh18iZUad5AXSToa2BGC0CpDWdnIvZdvd09IPG6s1AbMMEtlcKo+qxeD2gqtNtjik1xHp6U9T+Nw+2W0b1GiCmMMQARma7XIEbOA5o30JCVnVX52J88ahTb8z1VG1Z60kCdxfrgg/fb/lfkF+ro6Hh1y9HO6hQfYci1PWDIm1CnB30aJ90x9QAa9aCvdiZ6a5/R42Yzrs+hnbiemL88D7NWS5xPGIpNacwvzAfPgFUlc4YBrALYwSKQUG9l50eCPqu0xNrLcE5uTvljf/potNie1+zZsNKZBuoMVsuXNjf/pO0X6uDgSPnlXE8y20olQpXMEWgAuAUi3FqmeQPRyN6p2bWz/QW3zJJqnKNlndRWrRxYouiswVq+LVSg2nUriXsKgNbKXIgDkb2+WpFYQjsASmXTJtclyklc2wOx7Jycij/+xKZQsZrfNtPKgBsWqM9/fpPn0Ku/cYyOjk/ZVIEIKjPXWQO6ZF95v2RaDzNH9GCNQ4rCS66RoWHX8OBQaHKu6Qw9E7o18V1EpCwVgHvmshc5eXmNOfm52pUMJnlAQ5I5dWaokb0+JxF2A2yxaXSK6zcefyZUrT36YOOtN9tb00CdYlVtWOnoeOOk+o3IO9MKhbq2B6KyYZdT8wYaIgKQLVJJdImOHlQPIBQJ+hoil1AHus+cdwJzZNNUVk3UZYky7DmpAOVP6FnZ2fqlwqkRIeYNAHYiUgEciIgwcxMz6kVyNXXILKlpHcKtf7uvae2aVXVf+mTptAzKyN7FSwVczNboTojuG/oCvkeDBKyfRaDAAZGtHwLglzkDzfLRcfMd96Df6PU89Od/2zAP790GQPvlL6L49RsnLcqvaDlyek6ft7P9Bce7vz3pGep6r0k6Zz0AwrLNvIOAMAs2rZOh5jqI0Y+qa/vCVI5G9vqcYPhZqFm7FyMlUFkEgHoie31tALcv9HtJXdXJ4FPSib1D8waaiFBLQKPonoyI1Oc8F97vVIeNM9F5PflSJ5H5enN+7ZLybbFRkRyrAlQLIESEHWK8I7tcglV7pPrTaKkACwVSqdX4Xd5AheYNlAOIztZ/fdUZVQ/6nCTKn1dBtEKvh0gfW239faFTyUS2FccIFE1lHItVBfOwB6AwhCM8Kr0HsdmyORHqf/FaklFbjnbSLF/LIdvo1GreQJMe9LVq3kCllBSNEAkkIUtiyP/TLA3MhdxTVRqrJ+X7a0jmrlYuZO3/AjEqg4FVKRunkiwe04M1FzCfcezLs2tI8+7RrV4BknEisk2NIfQ7KpPAdMlpgjuk/ucRN6bGMUOmSYSnZqKfWlE14QOtUQHskI9Wn64D0g13QBb/NUlpoUNGrxYepDUqgDbhh+VGccihSkMuZO3dNQVUzbsnKpirxi0/gMHgHlGER9aHW5SliRzLGICtMoJVC9Bu2UA4IsFoWeeqOGZWv3rakWTnBGgut6KWK0K+hjGFnueIBH0OPehzi/mwrAEw5HyDFoDcEMnN1uNWzRvQGXCJQ8Y9EcG8lQuvvtWoADUL3ZdaAQpr3j0EcDVAjSSm20SuOaCmaBYxefMbAQoB5CRCSPPuiQkGqdFmylpzAGydZD27BVyXNxCSgAjJHgIHZCOLjohQXzoie4WnICLyY5160KdFxJdTJn24JYDVVEW1uCjPmARy69Evr2OHK8nmOkAuiyE1byBKwhcck48GJUVvRA/6NM27p2ExpjpLkLZKI62aGSqANmEcUwxAO0T5UMM1C1SrjkcqavXyBu2Wf24DyE9EzZYfdDEBC8ECsAAhARJmYCsBYRA0BnRmdkLorw6R2MEOBgwZMbJcYzGhq3EihLqy5CZNvr5jwiMl2Hvy4yTlSYKEEBEGInZDtupczLE5ADlTpE0VwBb5tEkdtcJ1PVj9mjcQBUEXIox1GTFyylr8A67tgQoi1M+m19Qcr6tJAqJlstXu8gYMZqwSAKQyeeAc4pHkI2R63CRjVIr+vNwcQ76+XWrtdovR5f+c/Ngj9cAOwVbcAsDNjLD1XlejUZk4FHxAfuY6gMJEqJYtlxatvmpRHP6ys0cFQAciQV+zsDcIALukOHMQZtZran5vBACryx4mtt9JAbAEFE8AWKLEWfybuGm5uTmxiYxJkxiUT0XE4YzI0m9d6qe6YOk9UaELBozFZdBL2hxNKazaAYYLjOrFLKlWFhEQUYhqR01+H5Y3RmVGpesqVz5aRW2ad4+1+VJFEcBN8qYAHEnAWQwp/p4sjS4sKoglAQwAMKTHIRrZ69Mg3GYOYYSRQ4IxKpkzlHpNS2URECVgBwMR1yLX/WcsMhiierCmLhL0NRPBwSxuDJbgsq4rBbiN1s2SwIxN0nXBoKhVe3XzLbeckgxtgU0XeixFrYnPlpoB+VpLPdNeXmv5VTkkV6mHvwbhZA+5lmh57iwt5IZf/aKjvuONk7GWo52rkV7XJqNO0gv1620zCRSTxz6WhtY1qqPeCIuBmIz1p4GaBuqShmpMdm05ld6LNFCX7NK8e2IyD9VI70YaqEt6jYyOxniKjPr0SgP1qq+hoZEYroHOI2mg3uCrf2A4Ntu2l+mVBuqire4L/R3pXUgDdekvWhrjbq67bb2aQ3vTK73SjJpeaaCmV3qlgZpe6XWJlZHegrmvp7eUqmBuBZGDgJhsDKED0J47eCydRZVm1CWz2kDkAFD+3MFjFQDKWdRWOdJbkwbqkljPbCnVIHJrsevgMQPykUCVlI5QpYG6VJY1DQWA4+ktpa3PbCl1AMBzArSh9A7Nz0r7UedHR71Acgy7BG0IQJ0Ea3qlGXWJnHagwuqMIo+9B8DJpzevdaZ3Jw3UJbOeO3gsCubVJAoADQaDwapof5NeaaAuFdG/eW0rEeG5g8caCFhNoDBASFv9aaAutdXBQtzjuYPHjOcOHqskUT+V1lHnaaUd/vOhoxKBwf5ntpSqLLpBawAcDG5M704aqEtmiWYUVA4BUL80rCp3HTweTu/O/Kz/fwB/Udh/NTUcIAAAAABJRU5ErkJggg==' />",
                        "<path d='M85,10 L75,85 S85,75 95,85 L85,10 z' fill='url(#orange_red)' />",
                        "<path d='M85,160 L75,85 S85,95 95,85 L85,160 z' fill='url(#orange_blue)' />",
                    "</g>",
                "</defs>",
                "<pavement ",
                    ":pedestrian='Pedestrian' ",
                    ":roads='Roads' ",
                    ":road-width='RoadWidth' ",
                    ":style=\"{ transformOrigin: 'center center', transform: getMatrix }\" ",
                    // "@on-road-lanemark-section=\"$emit('on-pavement-lanemark-section', arguments[0], arguments[1], arguments[2], arguments[3], arguments[4])\" ",
                    "></pavement>",
                "<use x='20' y='20' xlink:href='#compass' />",
            "</svg>"
        ];
        return template.join('');
    }

    var road = Vue.extend({
        template: render.apply(this),
        props: {
            Pedestrian : {
                default : function() {
                    return [];
                },
                type: Array
            },
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
                default: 600
            }
        },
        data: function() {
            return {
                move: { isDrag : false, drag : { x : 0, y : 0, offsetX: 0, offsetY: 0 } },
                rotate: { isRotate : false, x: 0, y: 0 },
                moveTop: 0,
                moveLeft: 0,
                scale: 1,
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
                me.scale = event.wheelDelta > 0 ? me.scale + 0.01 : me.scale - 0.01;
                me.scale = me.scale > 4 ? 4 : me.scale < 0 ? 0 : me.scale;
            }
        }
    })

    function initialize() {
        Vue.component("road", road);
    }

    exports.install = initialize;
    Object.defineProperty(exports, '__esModule', { value: true });
})));