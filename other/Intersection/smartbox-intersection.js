/**
 * Developer    :   SongQian
 * Time         :   2019-11-27
 * eMail        :   onlylove1172559463@vip.qq.com
 * Description  :   交通路口组件
 */
import SmartBoxPedestrianLight from "./SmartBoxPedestrianLight.vue"
import SmartBoxCarLight from "./SmartBoxCarLight.vue"

export default (function() {

    return {
        name : "SmartBoxIntersection",
        props : {
            E : {
                default() {
                    return {
                        lane : 0, sidewalkStop : 0, sidewalkRun : 0, sidewalkText : -2, sidewalkLightMode : 0,  roads : []
                    }
                },
                type : Object
            },
            W : {
                default() {
                    return {
                        lane : 0, sidewalkStop : 0, sidewalkRun : 0, sidewalkText : -2, sidewalkLightMode : 0,  roads : []
                    }
                },
                type : Object
            },
            S : {
                default() {
                    return {
                        lane : 0, sidewalkStop : 0, sidewalkRun : 0, sidewalkText : -2, sidewalkLightMode : 0,  roads : []
                    }
                },
                type : Object
            },
            N : {
                default() {
                    return {
                        lane : 0, sidewalkStop : 0, sidewalkRun : 0, sidewalkText : -2, sidewalkLightMode : 0,  roads : []
                    }
                },
                type : Object
            },
            Title : {
                default : "",
                type : String
            }
        },
        components : {
            SmartBoxPedestrianLight,
            SmartBoxCarLight
        },
        data() {
            return {
                
            }
        },
        computed : {
            hasShowNorthboundRoadblock() {
                let me = this;
                return !((me.N.roads.length && me.N.roads.some(it => it[2] === 'straight')) || 
                    (me.E.roads.length && me.E.roads.some(it => it[2] === 'left')) ||
                    (me.W.roads.length && me.W.roads.some(it => it[2] === 'right')));
            },
            hasShowSouthwardRoadblock() {
                let me = this;
                return !((me.S.roads.length && me.S.roads.some(it => it[2] === 'straight')) || 
                    (me.E.roads.length && me.E.roads.some(it => it[2] === 'right')) ||
                    (me.W.roads.length && me.W.roads.some(it => it[2] === 'left')));
            },
            hasShowWestwardRoadblock() {
                let me = this;
                return !((me.W.roads.length && me.W.roads.some(it => it[2] === 'straight')) || 
                    (me.N.roads.length && me.N.roads.some(it => it[2] === 'left')) ||
                    (me.S.roads.length && me.S.roads.some(it => it[2] === 'right')));
            },
            hasShowEastwardRoadblock() {
                let me = this;
                return !((me.E.roads.length && me.E.roads.some(it => it[2] === 'straight')) || 
                    (me.N.roads.length && me.N.roads.some(it => it[2] === 'right')) ||
                    (me.S.roads.length && me.S.roads.some(it => it[2] === 'left')));
            },
            getBoredTitle() {
                let me = this;
                return me.Title.match(/((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))|(.{1,8})/g);
            }
        },
        methods: {
            calcLaneIcon(direction, flat) {
                let me = this;
                switch(direction) {
                    case 'e' :
                        return { 'right' : require("../../../assets/Images/e_right.png"), 'left' : require("../../../assets/Images/e_left.png"), 'straight' : require("../../../assets/Images/e.png") }[flat];
                    case 'w' :
                        return { 'right' : require("../../../assets/Images/w_right.png"), 'left' : require("../../../assets/Images/w_left.png"), 'straight' : require("../../../assets/Images/w.png") }[flat];
                    case 's' :
                        return { 'right' : require("../../../assets/Images/s_right.png"), 'left' : require("../../../assets/Images/s_left.png"), 'straight' : require("../../../assets/Images/s.png") }[flat];
                    case 'n' :
                        return { 'right' : require("../../../assets/Images/n_right.png"), 'left' : require("../../../assets/Images/n_left.png"), 'straight' : require("../../../assets/Images/n.png") }[flat];
                }
                return "";
            }
        }
    }

})();