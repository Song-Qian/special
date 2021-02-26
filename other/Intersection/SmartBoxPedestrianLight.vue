<template>
    <g v-show="!(sidewalkText === -2 && sidewalkStop === 4 && sidewalkRun === 4)" :title="sidewalkText">
        <rect :x="(sidewalkStop === 4 && sidewalkRun === 4) ? 30 : -35" y="0" width="30" height="30" rx="5" ry="5" v-if="sidewalkText !== -2 && textPosition === 'left'" style="stroke:#fff; stroke-width: 3; fill:#000;"></rect>
        <text :x="(sidewalkStop === 4 && sidewalkRun === 4) ? 45 : -20" y="15" fill="red" class="smart-box-svg-font" v-if="sidewalkText !== -2 && textPosition === 'left'" text-anchor="middle" dominant-baseline="middle" :transform="textTransform"  :style="{ fill : sidewalkText === -1 ? '#000' : BlinkerTextColor }">{{ BlinkerText }}</text>
        <rect x="0" y="0" width="60" height="30" rx="5" ry="5" v-show="!(sidewalkStop === 4 && sidewalkRun === 4)" style="stroke:#000; stroke-width: 3; fill:#323230; " />
        <circle :cx="sidewalkRun === 4 ? 30 : 15"  cy="15" r="10" stroke="black" style="stroke:#fff; stroke-width:0;" v-show="sidewalkStop !== 4" :style="{ fill : StopDamage }"/>
        <circle :cx="sidewalkStop === 4 ? 30 : 45" cy="15" r="10" stroke="black" style="stroke:#fff; stroke-width:0;" v-show="sidewalkRun !== 4" :style="{ fill : RunDamage }"/>
        <rect :x="(sidewalkStop === 4 && sidewalkRun === 4) ? 0 : 65" y="0" width="30" height="30" rx="5" ry="5" v-if="sidewalkText !== -2 && textPosition === 'right'" style="stroke:#fff; stroke-width: 3; fill:#000; "></rect>
        <text :x="(sidewalkStop === 4 && sidewalkRun === 4) ? 15 : 80" y="15" fill="red" class="smart-box-svg-font" v-if="sidewalkText !== -2 && textPosition === 'right'" text-anchor="middle" dominant-baseline="middle" :transform="textTransform"  :style="{ fill : sidewalkText === -1 ? '#000' : BlinkerTextColor  }">{{ BlinkerText }}</text>
    </g>
</template>
<script>
import { default as SmartBoxPedestrianLight } from './smartbox-pedestrian-light'
export default SmartBoxPedestrianLight
</script>