import {DutyChart} from "../models";

export const DUTY_CHART = localStorage.dutyChart ? JSON.parse(localStorage.dutyChart) : new DutyChart()
export const VACANTS = localStorage.vacants ? JSON.parse(localStorage.vacants) : []
export const USERS = localStorage.users ? JSON.parse(localStorage.users) : []
export const DATES = localStorage.dates ? JSON.parse(localStorage.dates) : ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
export const INTERVALS = localStorage.intervals ? JSON.parse(localStorage.intervals) : ["8:00-10:00", "10:00-12:30", "14:00-16:00", "16:00-18:00", "19:00-21:30", "21:30-23:30"]
export const MAX_NUM_NEED = 3
