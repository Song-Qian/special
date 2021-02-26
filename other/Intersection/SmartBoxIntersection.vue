<template>
    <svg :xmlns="'http://wwW.w3.org/2000/svg'" version="1.1" viewBox="0 0 1000 750" preserveAspectRatio="none meet" style="width:100%; height:100%">
        <g>
            <line x1="275" y1="0" x2="275" y2="750" style="stroke:#fff;stroke-width:10;" />
            <line x1="725" y1="0" x2="725" y2="750" style="stroke:#fff;stroke-width:10;" />
            <line x1="0" y1="200" x2="1000" y2="200" style="stroke:#fff;stroke-width:10;" />
            <line x1="0" y1="550" x2="1000" y2="550" style="stroke:#fff;stroke-width:10;" />
            <polygon points="275,0 275,200 0,200 0,550 275,550 275,750 725,750 725,550 1000,550 1000,200 725,200 725,0 275,0" style="fill:#323230;"/>
            <line x1="1000" :y1="(350 / 2 / E.lane) * n + 200" x2="0" :y2="(350 / 2 / E.lane) * n + 200" stroke-dasharray="5,10" style="stroke-width:1;" stroke="#fff" v-for="n in Math.max(E.lane - 1, 0)" :key="'E-' + n"></line>
            <line x1="0" :y1="(350 / 2 / W.lane) * n + 200 + (350 / 2)" x2="1000" :y2="(350 / 2 / W.lane) * n + 200 + (350 / 2)" stroke-dasharray="5,10" style="stroke-width:1;" stroke="#fff" v-for="n in Math.max(W.lane - 1, 0)" :key="'W-' + n"></line>
            <line :x1="450 / 2 / N.lane * n + 275" y1="0" :x2="450 / 2 / N.lane * n + 275" y2="750" stroke-dasharray="5,10" style="stroke-width:1;" stroke="#fff" v-for="n in Math.max(N.lane - 1, 0)" :key="'N-' + n"></line>
            <line :x1="450 / 2 / S.lane * n + 275 + (450 / 2)" y1="750" :x2="450 / 2 / S.lane * n + 275 + (450 / 2)" y2="0" stroke-dasharray="5,10" style="stroke-width:1;" stroke="#fff" v-for="n in Math.max(S.lane - 1, 0)" :key="'S-' + n">{{n}}</line>
            <polygon points="275,150 275,200 725,200 725,150 275,150" style="fill:#323230;"/>
            <polygon points="275,550 275,600 725,600 725,550 275,550" style="fill:#323230;"/>
            <polygon points="225,200 275,200 275,550 225,550 225,220" style="fill:#323230;"/>
            <polygon points="725,200 775,200 775,550 725,550 725,200" style="fill:#323230;"/>
            <line x1="275" y1="175" x2="725" y2="175" stroke-dasharray="5,10" style="stroke:#999998;stroke-width:50;"/>
            <line x1="275" y1="575" x2="725" y2="575" stroke-dasharray="5,10" style="stroke:#999998;stroke-width:50;"/>
            <line x1="250" y1="200" x2="250" y2="550" stroke-dasharray="5,10" style="stroke:#999998;stroke-width:50;"/>
            <line x1="750" y1="200" x2="750" y2="550" stroke-dasharray="5,10" style="stroke:#999998;stroke-width:50;"/>
            <line x1="500" y1="0" x2="500" y2="750" style="stroke:#d6cb0a;stroke-width:5;" />
            <line x1="0" y1="375" x2="1000" y2="375" style="stroke:#d6cb0a;stroke-width:5;" />
            <polygon points="275,200 275,550 725,550 725,200 275,200" style="fill:#323230;"/>
            <!-- <rect x="500" y="75" fill="#323230" Color="#fff" width="40" height="40" transform="translate(-20,-20)"></rect>
            <rect x="500" y="675" fill="#323230" Color="#fff" width="40" height="40" transform="translate(-20,-20)"></rect>
            <rect x="925" y="375" fill="#323230" Color="#fff" width="40" height="40" transform="translate(-20,-20)"></rect>
            <rect x="75" y="375" fill="#323230" Color="#fff" width="40" height="40" transform="translate(-20,-20)"></rect>
            <text x="500" y="80" text-anchor="middle" dominant-baseline="middle" style="fill: #fff; font-size: 36px; font-weight: bold;">北</text>
            <text x="500" y="680" text-anchor="middle" dominant-baseline="middle" style="fill: #fff; font-size: 36px; font-weight: bold;">南</text>
            <text x="925" y="380" text-anchor="middle" dominant-baseline="middle" style="fill: #fff; font-size: 36px; font-weight: bold;">东</text>
            <text x="75" y="380" text-anchor="middle" dominant-baseline="middle" style="fill: #fff; font-size: 36px; font-weight: bold;">西</text> -->
            <text x="500" y="380" text-anchor="middle" dominant-baseline="middle" style="fill: #fff; font-size: 22px; font-weight: bold;">
                <tspan x="500" :y="(380 - (getBoredTitle.length * 30 / 2)) + (30 * index)" text-anchor="middle" dominant-baseline="middle" v-for="(bordeStr, index) in getBoredTitle" :key="index">{{bordeStr}}</tspan>
            </text>

        </g>
        <g>
            <image x="800" :y="(350 / 2 / E.lane * (n - 1)) + (350 / 4 / E.lane) + 200" transform="translate(-15,-15)" width="90" height="30" :xlink:href="calcLaneIcon('e', E.roads[n - 1] && E.roads[n - 1][2] || '')" v-for="n in E.lane" :key="'E-Landmark-' + n" />
            <image x="140" :y="(350 / 2 / W.lane * (n - 1)) + (350 / 2) + (350 / 4 / W.lane) + 200" transform="translate(-15, -15)" width="90" height="30" :xlink:href="calcLaneIcon('w', W.roads[n - 1] && W.roads[n - 1][2] || '')" v-for="n in W.lane" :key="'W-Landmark-' + n" />
            <image :x="(450 / 2 / S.lane * (n - 1)) + (450 / 2) + (450 / 4 / S.lane) + 275" y="625" transform="translate(-15,-15)" width="30" height="90" :xlink:href="calcLaneIcon('s', S.roads[n - 1] && S.roads[n - 1][2] || '')" v-for="n in S.lane" :key="'S-Landmark-' + n" />
            <image :x="(450 / 2 / N.lane * (n - 1)) + (450 / 4 / N.lane) + 275" y="70" transform="translate(-15,-15)" width="30" height="90" :xlink:href="calcLaneIcon('n', N.roads[n - 1] && N.roads[n - 1][2] || '')" v-for="n in N.lane" :key="'N-Landmark-' + n" />
        </g>
        <g>
            <defs>
                <g id="Roadblock">
                    <linearGradient id="bgColor" x1="0%" y1="0%" x2="100%" y2="50%" transform="">
                        <stop offset="10%" stop-color="#4f5d73" />
                        <stop offset="10%" stop-color="#f5cf87" />
                        <stop offset="35%" stop-color="#f5cf87" />
                        <stop offset="35%" stop-color="#4f5d73" />
                        <stop offset="65%" stop-color="#4f5d73" />
                        <stop offset="65%" stop-color="#f5cf87" />
                        <stop offset="90%" stop-color="#f5cf87" />
                        <stop offset="90%" stop-color="#4f5d73" />
                    </linearGradient>
                    <filter id="shadow" x="0" y="0" width="200%" height="200%">
                        <feOffset result="offOut" in="SourceAlpha" dx="5" dy="5" />
                        <feGaussianBlur result="blurOut" in="offOut" stdDeviation="3" />
                        <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                    </filter>
                    <rect x="35" y="35" width="8" height="40" rx="4" ry="4" transform="translate(-4,0)" style="fill:#E0995E;" filter="url(#shadow)"></rect>
                    <rect x="105" y="35" width="8" height="40" rx="4" ry="4" transform="translate(-4,0)" style="fill:#E0995E;" filter="url(#shadow)"></rect>
                    <rect x="0" y="0" width="140" height="40" rx="10" ry="10" style="fill:url(#bgColor);" filter="url(#shadow)"></rect>
                    <text x="70" y="20" text-anchor="middle" dominant-baseline="middle" style="fill:#fff; color: #fff; font-size: 18px; font-weight: bold;">禁止通行</text>
                </g>
            </defs>
            <!--北向人行信号灯-->
            <!--北向人行信号灯由东和西向的数据进行控制-->
            <smart-box-pedestrian-light v-show="W.sidewalkLightMode == 1" :sidewalkStop.sync="W.sidewalkStop" :sidewalkText.sync="W.sidewalkText" :sidewalkRun.sync="W.sidewalkRun" transform="translate(280,160)" textPosition="right"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="N.sidewalkLightMode == 0" :sidewalkStop.sync="N.sidewalkStop" :sidewalkText.sync="N.sidewalkText" :sidewalkRun.sync="N.sidewalkRun" transform="translate(280,160)" textPosition="right"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="E.sidewalkLightMode == 1" :sidewalkStop.sync="E.sidewalkStop" :sidewalkText.sync="E.sidewalkText" :sidewalkRun.sync="E.sidewalkRun" transform="translate(655,160)" textPosition="left"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="N.sidewalkLightMode == 0" :sidewalkStop.sync="N.sidewalkStop" :sidewalkText.sync="N.sidewalkText" :sidewalkRun.sync="N.sidewalkRun" transform="translate(655,160)" textPosition="left"></smart-box-pedestrian-light>
            <g>
                <use x="317.5" y="40" xlink:href="#Roadblock" v-show="!N.lane" />
                <use x="317.5" y="635"  transform="rotate(180,387.5,672.5)" xlink:href="#Roadblock" v-show="hasShowNorthboundRoadblock" />
            </g>

            <!--南向人行信号灯-->
            <!--南向人行信号灯由东和西向的数据进行控制-->
            <smart-box-pedestrian-light v-show="W.sidewalkLightMode == 1" :sidewalkStop.sync="W.sidewalkStop" :sidewalkText.sync="W.sidewalkText" :sidewalkRun.sync="W.sidewalkRun" transform="translate(280,560)" textPosition="right"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="S.sidewalkLightMode == 0" :sidewalkStop.sync="S.sidewalkStop" :sidewalkText.sync="S.sidewalkText" :sidewalkRun.sync="S.sidewalkRun" transform="translate(280,560)" textPosition="right"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="E.sidewalkLightMode == 1" :sidewalkStop.sync="E.sidewalkStop" :sidewalkText.sync="E.sidewalkText" :sidewalkRun.sync="E.sidewalkRun" transform="translate(655,560)" textPosition="left"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="S.sidewalkLightMode == 0" :sidewalkStop.sync="S.sidewalkStop" :sidewalkText.sync="S.sidewalkText" :sidewalkRun.sync="S.sidewalkRun" transform="translate(655,560)" textPosition="left"></smart-box-pedestrian-light>
            <g>
                <use x="542.5" y="40" xlink:href="#Roadblock"  v-show="hasShowSouthwardRoadblock" />
                <use x="542.5" y="635" transform="rotate(180,612.5,672.5)" xlink:href="#Roadblock" v-show="!S.lane" />
            </g>

            <!--西向人行信号灯-->
            <!--西向人行信号灯由南和北向的数据进行控制-->
            <smart-box-pedestrian-light v-show="N.sidewalkLightMode == 1" :sidewalkStop.sync="N.sidewalkStop" :sidewalkText.sync="N.sidewalkText" :sidewalkRun.sync="N.sidewalkRun" :textTransform="`rotate(-90,${ (N.sidewalkStop === 4 && N.sidewalkRun === 4) ? 15 : 80 },15)`" transform="translate(265,210) rotate(90,0,0)" textPosition="right"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="W.sidewalkLightMode == 0" :sidewalkStop.sync="W.sidewalkStop" :sidewalkText.sync="W.sidewalkText" :sidewalkRun.sync="W.sidewalkRun" :textTransform="`rotate(-90,${ (W.sidewalkStop === 4 && W.sidewalkRun === 4) ? 15 : 80 },15)`" transform="translate(265,210) rotate(90,0,0)" textPosition="right"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="S.sidewalkLightMode == 1" :sidewalkStop.sync="S.sidewalkStop" :sidewalkText.sync="S.sidewalkText" :sidewalkRun.sync="S.sidewalkRun" :textTransform="`rotate(-90,${ (S.sidewalkStop === 4 && S.sidewalkRun === 4) ? 45 : -20 },15)`" transform="translate(265,480) rotate(90,0,0)" textPosition="left"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="W.sidewalkLightMode == 0" :sidewalkStop.sync="W.sidewalkStop" :sidewalkText.sync="W.sidewalkText" :sidewalkRun.sync="W.sidewalkRun" :textTransform="`rotate(-90,${ (W.sidewalkStop === 4 && W.sidewalkRun === 4) ? 45 : -20 },15)`" transform="translate(265,480) rotate(90,0,0)" textPosition="left"></smart-box-pedestrian-light>
            <g>
                <rect x="-10" y="-10" width="160" height="160" rx="10" ry="10" fill="#cad984" />
                <image x="0" y="0" width="150" height="150" :xlink:href="require('../../../assets/Images/compass.png')"/>
                <use x="120" y="532.5" transform="rotate(-90,120,532.5)" xlink:href="#Roadblock"  v-show="!W.lane" />
                <use x="740" y="532.5" transform="rotate(90,880,532.5)"  xlink:href="#Roadblock" v-show="hasShowWestwardRoadblock" />
            </g>

            <!--东向人行信号灯-->
            <!--东向人行信号灯由南和北向的数据进行控制-->
            <smart-box-pedestrian-light v-show="N.sidewalkLightMode == 1" :sidewalkStop.sync="N.sidewalkStop" :sidewalkText.sync="N.sidewalkText" :sidewalkRun.sync="N.sidewalkRun" :textTransform="`rotate(-90,${ (N.sidewalkStop === 4 && N.sidewalkRun === 4) ? 15 : 80 },15)`" transform="translate(765,210) rotate(90,0,0)" textPosition="right"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="E.sidewalkLightMode == 0" :sidewalkStop.sync="E.sidewalkStop" :sidewalkText.sync="E.sidewalkText" :sidewalkRun.sync="E.sidewalkRun" :textTransform="`rotate(-90,${ (E.sidewalkStop === 4 && E.sidewalkRun === 4) ? 15 : 80 },15)`" transform="translate(765,210) rotate(90,0,0)" textPosition="right"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="S.sidewalkLightMode == 1" :sidewalkStop.sync="S.sidewalkStop" :sidewalkText.sync="S.sidewalkText" :sidewalkRun.sync="S.sidewalkRun" :textTransform="`rotate(-90,${ (S.sidewalkStop === 4 && S.sidewalkRun === 4) ? 45 : -20 },15)`" transform="translate(765,480) rotate(90,0,0)" textPosition="left"></smart-box-pedestrian-light>
            <smart-box-pedestrian-light v-show="E.sidewalkLightMode == 0" :sidewalkStop.sync="E.sidewalkStop" :sidewalkText.sync="E.sidewalkText" :sidewalkRun.sync="E.sidewalkRun" :textTransform="`rotate(-90,${ (E.sidewalkStop === 4 && E.sidewalkRun === 4) ? 45 : -20 },15)`" transform="translate(765,480) rotate(90,0,0)" textPosition="left"></smart-box-pedestrian-light>
            <g>
                <use x="120" y="360" transform="rotate(-90,120,360)" xlink:href="#Roadblock" v-show="hasShowEastwardRoadblock" />
                <use x="740" y="360" transform="rotate(90,880,360)" xlink:href="#Roadblock"  v-show="!E.lane" />
            </g>
        </g>
        <g>
            <!--北向机动车信号灯-->
            <smart-box-car-light 
                :x="(450 / 2 / N.lane * n) + (450 / N.lane / 4) + 275 + 15" 
                :y="710" 
                :rotate="180"
                :light="item[0] || 'default'"
                :timer="item[1] || 0"
                :landmark="item[2] || ''"
                :lightDamage="item[3] || ''"
                :textRotate="180"
                :lightRotate=" N.roads.length === 1 ? -90 : 0"
                v-show="N.lane !== 0"
                v-for="(item, n) in N.roads"
                :key="'N-Roads-' + n">
            </smart-box-car-light>

            <!--南向机动车信号灯-->
            <smart-box-car-light 
                :x="(450 / 2 / S.lane * n) + (450 / S.lane / 4) + (450 / 2) + 275 - 15" 
                :y="40" 
                :rotate="0"
                :light="item[0] || 'default'"
                :timer="item[1] || 0"
                :landmark="item[2] || ''"
                :lightDamage="item[3] || ''"
                :textRotate="0"
                :lightRotate="S.roads.length === 1 ? -90 : 0"
                v-show="S.lane !== 0"
                v-for="(item, n) in S.roads"
                :key="'S-Roads-' + n">
            </smart-box-car-light>
            
            <!--东向机动车信号灯-->
            <smart-box-car-light 
                :x="115" 
                :y="(350 / 2 / E.lane * n) + (350 / E.lane / 4) + 200 + 15" 
                :rotate="-90"
                :light="item[0] || 'default'"
                :timer="item[1] || 0"
                :landmark="item[2] || ''"
                :lightDamage="item[3] || ''"
                :textRotate="90"
                :lightRotate="E.roads.length === 1 ? -90 : 0"
                v-show="E.lane !== 0"
                v-for="(item, n) in E.roads"
                :key="'E-Roads-' + n">
            </smart-box-car-light>

            <!--西向机动车信号灯-->
            <smart-box-car-light 
                :x="885" 
                :y="(350 / 2 / W.lane * n) + (350 / W.lane / 4) + (350 / 2) + 200 - 15" 
                :rotate="90"
                :light="item[0] || 'default'"
                :timer="item[1] || 0"
                :landmark="item[2] || ''"
                :lightDamage="item[3] || ''"
                :textRotate="-90"
                :lightRotate="W.roads.length === 1 ? -90 : 0"
                v-show="W.lane !== 0"
                v-for="(item, n) in W.roads"
                :key="'W-Roads-' + n">
            </smart-box-car-light>
        </g>
    </svg>
</template>
<script>
import { default as SmartBoxIntersection } from './smartbox-intersection'
export default SmartBoxIntersection
</script>