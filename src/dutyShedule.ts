import {DutyChart, Like, Vacant} from "./models";
import _ from "lodash/fp";
import {multiMunkres} from "./multiMunkres";

export function checkVacant(dutyChart: DutyChart, v: Vacant, defaultV: Like = Like.like): Vacant {
    const length = dutyChart.days.length * dutyChart.interval.length
    const vacant = _.cloneDeep(v)
    vacant.vacant = vacant.vacant.slice(0, length)
    if (vacant.vacant.length < length) {
        vacant.vacant = vacant.vacant.concat(new Array(length - vacant.vacant.length).fill(defaultV))
    }
    return vacant
}


export function scheduling(chart: DutyChart, vs: Array<Vacant>): DutyChart {
    const chart2 = _.cloneDeep(chart)
    const vacants = vs.map(v => checkVacant(chart2, v))
    const resChart = multiMunkres(chart2.numNeed, vacants.map(v => v.vacant), vacants.map(v => v.maxDuty))
    chart2.chart = resChart.map(v => v.map(v1 => vacants[v1].user))
    return chart2
}
