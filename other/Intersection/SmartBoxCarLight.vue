<template>
    <g :transform="`translate(${x},${y}) rotate(${rotate}, 0, 0)`">
        <g :transform="`rotate(${lightRotate}, 20, 50)`">
            <rect x="0" y="0" width="30" height="100" rx="5" ry="5" style="stroke:#fff; stroke-width: 3; fill:#b0b0b0;" />
            <circle cx="15" cy="82.5" r="10" :stroke="RunLight" :fill="RunLight" stroke-width="0" />
            <circle cx="15" cy="50" r="10" :stroke="WaitLight" :fill="WaitLight" stroke-width="0">
                <animate attributeName="fill" from="#FFF100" to="#757575" dur="0.75s" v-if="hasWaitFlashLight" repeatCount="indefinite" />
            </circle>
            <circle cx="15" cy="17.5" r="10" :stroke="StopLight" :fill="StopLight" stroke-width="0" />
        </g>
        <line x1="15" :y1="lightRotate ? '75' : '100'" x2="15" y2="200" v-show="hasBlinkerDamage" style="stroke:#fff; stroke-width:2; fill:#fff;" />
        <rect x="0" y="200" width="40" height="40" rx="5" ry="5" transform="translate(-5,0)" v-show="hasBlinkerDamage" style="stroke:#fff; stroke-width: 3; fill:#000;" />
        <text x="15" y="220" class="smart-box-svg-font" style="font-size: 18" text-anchor="middle" dominant-baseline="middle" :transform="`rotate(${textRotate},15,220)`" :fill="BlinkerLight" v-show="hasBlinkerDamage">
            {{ BlinkerText }}
        </text>
    </g>
</template>
<script>
import SmartBoxCarLight from "./smartbox-car-light"
export default SmartBoxCarLight
</script>