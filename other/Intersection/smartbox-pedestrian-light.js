/**
 * Developer    :   SongQian
 * Time         :   2019-11-27
 * eMail        :   onlylove1172559463@vip.qq.com
 * Description  :   交通路口人行信号灯组件
 */

 export default(function() {
     return {
         name : 'SmartBoxPedestrianLight',
         props : {
             //车道人行红灯信号灯 （0 灭， 1 亮， 2 默认， 3 故障， 4 无灯）
            sidewalkStop : {
                default : 2,
                type : Number
            },
            //车道人行绿灯信号灯 （0 灭， 1 亮， 2 默认， 3 故障， 4 无灯）
            sidewalkRun : {
                default : 2,
                type : Number
            },
            //车道人行信号灯读秒 (value >= 0 读秒数， -1 读秒故障， -2 无读秒灯)
            sidewalkText : {
                default : 0,
                type : Number
            },
            //人行信号灯读秒transform属性
            textTransform : {
                default : '',
                type : String
            },
            textPosition : {
                default : 'right',
                type : String
            }
         },
         data() {
             return {}
         },
         computed : {
            BlinkerText () {
                let me = this;
                return me.sidewalkText <= 0 || isNaN(parseInt(me.sidewalkText)) ? "0" : Number((Array(2).join('0') + me.sidewalkText).slice(-2));
            },
            BlinkerTextColor() {
                let me = this;
                //人行红灯亮或者人行红灯故障并且是红灯信号  === #e60012
                //人行绿灯亮或者人行绿灯故障并且是绿灯信号  === #359f40
                return (me.sidewalkStop === 1 || me.sidewalkStop === 5 && me.sidewalkRun !== 1 ? "#e60012" : (me.sidewalkRun == 1 || me.sidewalkRun === 5 && me.sidewalkStop !== 1 ? '#359f40' : '#757575'));
            },
            StopDamage () {
                let me = this;
                let colors = { "0" : "#757575", "1" : "#e60012", "3" : "#000", "5": "#000" };
                return  colors[me.sidewalkStop] || "#757575";
            },
            RunDamage() {
                let me = this;
                let colors = { "0" : "#757575", "1" : "#359f40", "3" : "#000", "5": "#000" };
                return colors[me.sidewalkRun] || "#757575";
            }
         }
     }
 })()