/**
 * Developer    :   SongQian
 * Time         :   2021-02-08
 * Descript     :   路口角度调整组件
 */

 (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.alien = {}));
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
        calcTriangleForCH: function(a, b) {
            //计算直角三角形的边（弦）的高
            // var c = Math.sqrt(a * a + b * b);
            // var p = (a + b + c) / 2;
            // var s = Math.sqrt(p * (p - a) * (p - b) * (p - c));
            // return 2 / (c * s);
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

    

    var render = function() {
        var template = [
            "<div class='ivsom-alien'>",
                "<div class='ivsom-alien-title'>",
                    "{{Title}}",
                "</div>",
                "<div class='ivsom-alien-container'>",
                    "<svg xmlns='http://wwW.w3.org/2000/svg' class='ivsom-alien-drawing' version='1.1' viewBox='0 0 600 600' preserveAspectRatio='none xMidYMid'>",
                        "<g>",
                            "<circle cx='60' cy='60' r='40' fill='#fff' />",
                            "<path d='M60,25 L50,60 S60,45 70,60 L60,25 z' fill='#ea4748'/>",
                            "<path d='M60,95 L50,60 S60,75 70,60 L60,95 z' fill='#4e79e2'/>",
                            "<path d='M35,60 L45,70 45,50 35,60 z' fill='#ddd'/>",
                            "<path d='M85,60 L75,70 75,50 85,60 z' fill='#ddd'/>",
                            "<text x='60' y='15' font-size='12' text-anchor='middle' fill='#333'>N</text>",
                            "<text x='10' y='65' font-size='12' text-anchor='middle' fill='#333'>W</text>",
                            "<text x='110' y='65' font-size='12' text-anchor='middle' fill='#333'>E</text>",
                            "<text x='60' y='115' font-size='12' text-anchor='middle' fill='#333'>S</text>",
                        "</g>",
                        "<g>",
                            "<circle cx='300' cy='300' r='260' fill='none' stroke-width='2' stroke='#3999f4' />",
                            "<circle cx='300' cy='300' r='20' fill='#333' stroke-width='0' stroke='none' />",
                            "<line :x1='item.p1.x' :x2='item.p2.x' :y1='item.p1.y' :y2='item.p2.y' v-for='(item, i) in getScaleList' :key='i' fill='#3999f4' stroke='#3999f4' :stroke-width='i % 5 === 0 ? 5 : 2' />",
                            "<text x='300' y='30' font-size='12' text-anchor='middle' fill='#53d551'>0°</text>",
                            "<text x='25' y='305' font-size='12' text-anchor='middle' fill='#53d551'>270°</text>",
                            "<text x='300' y='580' font-size='12' text-anchor='middle' fill='#53d551'>180°</text>",
                            "<text x='580' y='305' font-size='12' text-anchor='middle' fill='#53d551'>90°</text>",
                        "</g>",
                        "<g v-for='(item, i) in getRoadsView' :transform=\"'rotate('+ (-90 + item.angle) +', 300, 300)'\">",
                            "<g>",
                                "<rect x='300' y='280' width='260' height='40' :fill=\"active === item.id ? '#3999f4' : '#333'\" />",
                                "<line x1='300' x2='560' y1='300' y2='300' fill='#f3c53f' stroke='#f3c53f' stroke-width='2' />",
                                "<rect x='300' y='280' width='40' height='40' fill='#333' />",
                                "<circle cx='300' cy='300' r='20' fill='#2895fc' stroke-width='0' stroke='none' />",
                                "<text x='300' y='300' font-size='16' style='dominant-baseline:middle;text-anchor:middle;' :transform=\"'rotate('+ (-(-90 + item.angle)) +', 300, 300)'\" fill='#fff'>{{ {'start' : '起', 'middle' :  '中', 'end' : '终'}[item.type] }}</text>",
                            "</g>",
                        "</g>",
                    "</svg>",
                    "<div class='ivsom-alien-table'>",
                        "<table cellspacing='0' cellpadding='0' border='0'>",
                            "<tbody>",
                                "<tr v-for='(item, i) in getRoadsView' @click='acitveRoad(item)' :key='i'>",
                                    "<td>{{i + 1}}</td>",
                                    "<td>{{ item.name }}</td>",
                                    "<td>{{item.angle}}°</td>",
                                    "<td><span class='plus' @click.stop='addRoadAngle(i, item)'>+</span><span class='less' @click.stop='lessRoadAngle(i, item)'>-</span></td>",
                                "</tr>",
                            "</tbody>",
                        "</table>",
                    "</div>",
                "</div>",
            "</div>"
        ];
        return template.join('');
    }

    var alien = Vue.extend({
        template: render.apply(this),
        props: {
            Title : {
                default : '',
                type: String
            },
            Roads: {
                default: [],
                type: Array
            }
        },
        data: function(){
            return {
                active : ''
            }
        },
        computed : {
            getScaleList: function() {
                var scale = 360 / 60;
                var lines = [];
                for(var i = 0; i < 60; i++) {
                    var len = i % 5 === 0 ? 15 : 10;
                    var p1 = utils.calcRadiusAnyPoint(300, 300, 260 - len, i * scale);
                    var p2 = utils.calcRadiusAnyPoint(300, 300, 260, i * scale);
                    lines.push({ p1 : p1, p2 : p2 })
                }
                return lines;
            },
            getRoadsView : function() {
                var me = this;
                var total = 0;
                var result = [];
                for(var i in me.Roads) {
                    if(total < 4) {
                        total += 1
                        result.push(me.Roads[i])
                    }
                }
                return result;
            }
        },
        methods: {
            addRoadAngle: function(index, item) {
                var me = this;
                var roads = me.Roads;
                var angle = item.angle;
                angle += 30;
                if (angle - 360 > 0) {
                    item.angle = angle - 360;
                    roads[index] = item;
                    me.$emit('update:Roads', roads);
                    return;
                }
                
                item.angle = angle;
                roads[index] = item;
                me.$emit('update:Roads', roads);

            },
            lessRoadAngle: function(index, item) {
                var me = this;
                var roads = me.Roads;
                var angle = item.angle;
                angle -= 30;

                if (angle + 360 < 360) {
                    item.angle = angle + 360;
                    roads[index] = item;
                    me.$emit('update:Roads', roads);
                    return;
                }
                
                item.angle = angle;
                roads[index] = item;
                me.$emit('update:Roads', roads);
            },
            acitveRoad: function(item) {
                var me = this;
                if (me.active == item.id) {
                    me.active = '';
                } else {
                    me.active = item.id;
                }
            }
        }
    })

    function initialize() {
        Vue.component("alien", alien);
    }

    exports.install = initialize;
    Object.defineProperty(exports, '__esModule', { value: true });
})));