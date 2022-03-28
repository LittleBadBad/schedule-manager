export enum Like {
    like,
    little,
    refuse,
    finished
}

export class User {
    id: number = 0
    username: string = ""
}

export class DutyChart {
    id: number = 0

    /**
     * 天数
     */
    days: Array<string> = []

    /**
     * 时间间隔
     */
    interval: Array<string> = []

    /**
     * 最终表格
     */
    chart: Array<Array<User>> = []

    /**
     * 每班需要人数
     */
    numNeed: Array<number> = []
}

export class Vacant {
    user: User = new User()
    dutyChart: DutyChart = new DutyChart()
    vacant: Array<Like> = []
    duty: Array<number> = []
    maxDuty: number = 3
}
