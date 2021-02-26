/**
 * Developer    :   SongQian
 * Time         :   2019-11-27
 * eMail        :   onlylove1172559463@vip.qq.com
 * Description  :   交通路口机动车信号灯组件
 */

export default (function() {

    let colors = ['#757575', '#359f40', '#FFF100', '#E60012', '#fff', '#000'];

    return {
        name : "SmartBoxCarLight",
        props : {
            // [  value = [default 默认灯色, run 绿灯， wait 黄灯, stop 红灯, none 无灯, wait-flash 黄闪], 
            //    value = [0-∽ 读秒, -1 机动车信号灯故障, -3 机动车信号灯无读秒], 
            //    value = [right 左转地标，left 左转地标,straight 直行地标], 
            //    value = [run 红灯故障, wait 黄灯故障, stop 红灯故障, run-stop 组合故障]
            // ]
            // ['run', 0, 'right', "wait"], //第一车道 [车道信号灯, 信号灯读秒, 行车标志, 灯故障]
            light : {
                default : 'default',
                type : String
            },
            timer : {
                default : 0,
                type : Number
            },
            landmark : {
                default : '',
                type : String
            },
            lightDamage : {
                default : '',
                type : String
            },
            textRotate : {
                default : 0,
                type : Number
            },
            lightRotate : {
                default : 0,
                type: Number
            },
            rotate : {
                default : 0,
                type : Number
            },
            x : {
                default : 0,
                type : Number
            },
            y : {
                default : 0,
                type : Number
            }
        },
        computed : {
            RunLight() {
                let me = this;
                if(me.lightDamage.indexOf('run') > -1) {
                    return colors[5];
                }
                return { 'default' : colors[0], 'run' : colors[1], 'none' : colors[4] }[me.light] || colors[0];
            },
            WaitLight() {
                let me = this;
                if(me.lightDamage.indexOf('wait') > -1) {
                    return colors[5];
                }
                return { 'default' : colors[0], 'wait' : colors[2], 'none' : colors[4] }[me.light] || colors[0];
            },
            StopLight() {
                let me = this;
                if(me.lightDamage.indexOf('stop') > -1) {
                    return colors[5];
                }
                return { 'default' : colors[0], 'stop' : colors[3], 'none' : colors[4] }[me.light] || colors[0];
            },
            hasWaitFlashLight() {
                let me = this;
                return me.light === 'wait-flash';
            },
            hasBlinkerDamage() {
                let me = this;
                return me.timer !== -3;
            },
            BlinkerLight() {
                let me = this;
                if(me.timer === -1) {
                    return colors[5];
                }
                return { 'run' : colors[1], 'wait' : colors[2], 'stop' : colors[3], 'none' : colors[4] }[me.light] || colors[0];
            },
            BlinkerText () {
                let me = this;
                return me.timer < 0 || isNaN(me.timer) ? "" : Number((Array(2).join('0') + me.timer).slice(-2));
            }
        },
        data() {
            return {

            }
        }
    }

})();