import React from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import znLocale from 'date-fns/locale/zh-CN';
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogProps,
    DialogTitle,
    Drawer,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    styled,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {LocalizationProvider, MobileTimePicker} from "@mui/lab";
import {DutyChart, Like, User, Vacant} from "./models";
import {checkVacant, scheduling} from "./dutyShedule";

const DATES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const INTERVALS = ["8:00-12:30", "14:00-18:00", "19:00-23:30"]
const MAX_NUM_NEED = 3
const LIKE_COLOR = ["#cfe8fc", "#d7acac", "#cb1212"]

// const user1: User = {id: 1, username: "zcy1"}
// const user2: User = {id: 2, username: "zcy2"}
// const user3: User = {id: 3, username: "zcy3"}
// const user4: User = {id: 4, username: "zcy4"}
// const user5: User = {id: 5, username: "zcy5"}

const DUTY_CHART = localStorage.dutyChart ? JSON.parse(localStorage.dutyChart) : new DutyChart()
const VACANTS = localStorage.vacants ? JSON.parse(localStorage.vacants) : []
const USERS = localStorage.users ? JSON.parse(localStorage.users) : []
const storeLocal = (v: {}, name) => {
    localStorage[name] = JSON.stringify(v)
}

interface DiaAction {
    handle?(): void

    name?: string
}

interface AlertModalProps extends DialogProps {
    title?: string,
    content?: string,
    actions?: DiaAction[];

    afterClose?(): void
}

function AlertModal(props: AlertModalProps) {
    const onCloseAlert = (event, reason) => {
        props.onClose(event, reason)
        if (typeof props.afterClose === "function") {
            props.afterClose()
        }
    }
    return <Dialog open={props.open} onClose={onCloseAlert} {...props}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {props.content}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            {props.actions && props.actions.length ? props.actions.map(value => (
                <Button key={value.name} onClick={() => {
                    if (typeof value.handle === 'function')
                        value.handle()
                    // @ts-ignore
                    onCloseAlert()
                }} color="primary" autoFocus>
                    {value.name}
                </Button>
            )) : ""}
        </DialogActions>
    </Dialog>
}

function App() {
    const StyledTableCell = styled(TableCell)(({theme}) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const [dutyChart, setDutyChart] = React.useState<DutyChart>(DUTY_CHART)
    const [createDutyOpen, setCreateDutyOpen] = React.useState(false)
    const [dates, setDates] = React.useState(new Array(...DATES))
    const [interval, setInterval] = React.useState<{ start: Date | null, end: Date | null }>({start: null, end: null});
    const [intervals, setIntervals] = React.useState(INTERVALS)
    const [tableValue, setTableValue] = React.useState<Array<{} | number>>(dutyChart.numNeed)
    const [perBlock, setPerBlock] = React.useState(1)
    const [anchor, setAnchor] = React.useState([0, 0])
    const [changeSingle, setChangeSingleOpen] = React.useState(false)
    const [vacantDialog, setVacantDialogOpen] = React.useState(false)
    const [currentVacant, setVacant] = React.useState<Vacant>(new Vacant())
    const [vacants, setVacants] = React.useState<Array<Vacant>>(VACANTS)
    const [alertOpen, setAlertOpen] = React.useState(false)
    const [alert, setAlert] = React.useState({title: "", content: "", actions: []})

    const setCreateDuty = (open: boolean) => () => setCreateDutyOpen(open)
    const selectDates = (date: string) => () => {
        const i = dates.indexOf(date)
        if (i !== -1) {
            dates.splice(i, 1)
            setDates([].concat(dates))
        } else {
            setDates([].concat(dates, [date]))
        }
    };
    const selectAll = () => {
        if (dates.length <= DATES.length && dates.length > 0) {
            setDates([])
        } else {
            setDates(new Array(...DATES))
        }
    }
    const deleteItem = (name: "date" | "interval", i) => () => {
        if (name === "date") {
            dates.splice(i, 1)
            setDates([].concat(dates))
        } else if (name === "interval") {
            intervals.splice(i, 1)
            setIntervals([].concat(intervals))
        }
    }
    const selectInterVal = (name: "start" | "end") => (newValue) => {
        setInterval({
            ...interval,
            [name]: newValue
        })
    }
    const addInterval = () => {
        const [start, end] = [new Date(interval.start), new Date(interval.end)]
        const toStr = (num: number) => num < 10 ? "0" + num : num
        const str = `${toStr(start.getHours())}:${toStr(start.getMinutes())}-${toStr(end.getHours())}:${toStr(end.getMinutes())}`
        setIntervals([].concat(intervals, [str]))
    }
    const confirmDutyChart = () => {
        const dc: DutyChart = {
            // @ts-ignore
            chart: new Array<Array<User>>(dates.length * intervals.length).fill(0).map(() => new Array<User>()),
            numNeed: new Array<number>(dates.length * intervals.length).fill(perBlock),
            id: 0,
            days: new Array(...dates),
            interval: new Array(...intervals)
        }
        storeLocal(dc, "dutyChart")
        setDutyChart(dc)
        setTableValue(dc.numNeed)
        setCreateDutyOpen(false)
    }
    const changePerBlock = (event) => {
        dutyChart.numNeed = new Array<number>(dates.length * intervals.length).fill(parseInt(event.target.value))
        setPerBlock(event.target.value)
        setTableValue([].concat(tableValue.map(v => parseInt(event.target.value))))
        storeLocal(dutyChart, "dutyChart")
        setDutyChart(Object.assign({}, dutyChart))
    }
    const setChangeSingle = (open: boolean) => () => setChangeSingleOpen(open)
    const clickSingleBlock = (i, j) => () => {
        setAnchor([i, j])
        setChangeSingleOpen(true)
    }
    const changeSingleBlock = (v: number) => () => {
        tableValue[anchor[0] * dutyChart.days.length + anchor[1]] = v
        dutyChart.numNeed[anchor[0] * dutyChart.days.length + anchor[1]] = v
        storeLocal(dutyChart, "dutyChart")
        setDutyChart(Object.assign({}, dutyChart))
        setTableValue([].concat(tableValue))
        setChangeSingleOpen(false)
    }
    const setVacantDialog = (open) => () => setVacantDialogOpen(open)
    const createVacant = (vac: Vacant | null) => () => {
        let v: Vacant = vac || {
            user: new User(),
            dutyChart: dutyChart,
            vacant: new Array<Like>(dutyChart.days.length * dutyChart.interval.length).fill(Like.like),
            duty: [],
            maxDuty: 3
        }
        v = checkVacant(dutyChart, v)
        v.dutyChart = dutyChart
        setVacant(v)
        setVacantDialogOpen(true)
    }
    const changeVacantValue = (name: "username" | "maxDuty") => (event, newV) => {
        switch (name) {
            case "maxDuty":
                setVacant({
                    ...currentVacant,
                    maxDuty: parseInt(event.target.value)
                })
                break;
            case "username":
                setVacant({
                    ...currentVacant,
                    user: {
                        ...currentVacant.user,
                        username: newV
                    }
                })
                break;
            default:
        }
    }
    const changeBlockLike = (i, j) => () => {
        let like = currentVacant.vacant[i * dutyChart.days.length + j]
        like >= 2 ? like = 0 : like += 1
        currentVacant.vacant[i * dutyChart.days.length + j] = like
        setVacant(Object.assign({}, currentVacant))
    }
    const confirmVacant = () => {
        if (!currentVacant.user.username || currentVacant.user.username === "") {
            setAlertOpen(true)
            setAlert({
                title: "提示",
                content: "请填写昵称",
                actions: [{name: "确定"}]
            })
        } else if (currentVacant.maxDuty <= 0) {
            setAlertOpen(true)
            setAlert({
                title: "提示",
                content: "请填写正确最大班数",
                actions: [{name: "确定"}]
            })
        } else {
            const i = vacants.map(v => v.user).findIndex(v => v.username === currentVacant.user.username)
            if (i > -1) {
                vacants[i] = currentVacant
            } else {
                vacants.push(currentVacant)
            }
            storeLocal(vacants, "vacants")
            setVacants([].concat(vacants))
            setVacantDialogOpen(false)
            if (!USERS.find(v => v.ususername === currentVacant.user.username)) {
                USERS.push(currentVacant.user)
                storeLocal(USERS, "users")
            }
        }
    }
    const schedule = () => {
        // @ts-ignore
        dutyChart.chart = new Array<Array<User>>(dates.length * intervals.length).fill(0).map(() => new Array<User>())
        const dNew = scheduling(dutyChart, vacants)
        setDutyChart(dNew)
        setTableValue(dNew.chart)
    }
    const closeAlert = () => {
        setAlertOpen(false)
    }
    const deleteVacant = () => {
        setAlertOpen(true)
        setAlert({
            title: "删除空闲表",
            content: "是否删除" + currentVacant.user.username + "的空闲表？",
            actions: [{
                name: "确定", handle: () => {
                    const i = vacants.findIndex(v => v.user.username === currentVacant.user.username)
                    if (i > -1) {
                        vacants.splice(i, 1)
                        storeLocal(vacants, "vacants")
                        setVacants([].concat(vacants))
                    }
                    setVacantDialogOpen(false)
                }
            }, {
                name: "取消"
            }]
        })
    }

    return <Container component="main" maxWidth="xl" style={{textAlign: "center"}}>
        {dutyChart.days.length === 0 || dutyChart.interval.length === 0 ?
            <Card component={Button} fullWidth style={{minHeight: 345, marginTop: 100}}
                  onClick={setCreateDuty(true)}>
                <CardContent>
                    <Typography gutterBottom variant="h4" align={"center"} component="div">
                        创建值班
                    </Typography>
                    <div style={{
                        height: 325,
                        width: 345,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <AddIcon style={{height: 100, width: 100}} htmlColor={"#9e9c9c"}/>
                    </div>
                </CardContent>
            </Card> :
            <Box style={{minWidth: 345}}>
                <Box component={Paper} style={{height: 345, marginBottom: 20, overflow: "auto"}}>
                    <List>
                        {vacants.map((v, i) => <ListItemButton key={i} onClick={createVacant(v)}>
                            {v.user.username}{"   最大班数："}{v.maxDuty}
                        </ListItemButton>)}
                        <ListItem component={Button} onClick={createVacant(null)}><AddIcon/>添加值班成员</ListItem>
                    </List>
                </Box>
                <Box>
                    <Stack spacing={2} direction="row" style={{marginBottom: 10}} alignItems="flex-end">
                        <Button variant={"contained"} onClick={schedule}>排班</Button>
                        <Button variant={"outlined"} onClick={setCreateDuty(true)}>修改</Button>
                        <FormControl sx={{width: 100}}>
                            <InputLabel id="demo-multiple-chip-label">每班人数</InputLabel>
                            <Select
                                variant={"standard"}
                                value={perBlock}
                                label="每班人数"
                                onChange={changePerBlock}>
                                {new Array(MAX_NUM_NEED).fill(0).map((v, i) =>
                                    <MenuItem key={i} value={i + 1}>{i + 1}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Typography color={"text.secondary"}>点击单元格可单独修改所需班数</Typography>
                    </Stack>

                    <TableContainer component={Paper}>
                        <Table sx={{minWidth: 400}} size="small">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell/>
                                    {dutyChart.days.map((v, i) => <StyledTableCell key={i}>{v}</StyledTableCell>)}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableValue.map((v, i, arr) =>
                                    i % dutyChart.days.length === 0 ? <TableRow key={i}>
                                        <TableCell>
                                            <Typography>{dutyChart.interval[i / dutyChart.days.length]}</Typography>
                                        </TableCell>
                                        {arr.slice(i, i + dutyChart.days.length).map((v2, j) =>
                                            <TableCell key={j}>
                                                {Array.isArray(v2) ?
                                                    v2.map((v3, k) => <Typography
                                                        key={k}>{v3.username}</Typography>) :
                                                    <Typography key={j} component={IconButton}
                                                                onClick={clickSingleBlock(i / dutyChart.days.length, j)}>{v2}</Typography>}
                                            </TableCell>)}
                                    </TableRow> : null)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>}
        <Dialog open={createDutyOpen} onClose={setCreateDuty(false)}>
            <DialogTitle>添加日期和时间</DialogTitle>
            <DialogContent>
                <Box>
                    <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                        选择日期
                    </Typography>
                    <div style={{display: "flex", minWidth: 300, justifyContent: "space-around"}}>
                        <FormControl component="fieldset" style={{padding: "10px 0"}}>
                            <FormControlLabel
                                label="全选"
                                control={<Checkbox
                                    checked={dates.length === DATES.length}
                                    indeterminate={dates.length < DATES.length && dates.length > 0}
                                    onChange={selectAll}/>}
                            />
                            <FormGroup aria-label="position">
                                {DATES.map((v, i) => {
                                    return <FormControlLabel
                                        key={i}
                                        control={<Checkbox checked={dates.indexOf(v) !== -1}
                                                           name={v}
                                                           onChange={selectDates(v)}/>} label={v}/>
                                })}
                            </FormGroup>
                        </FormControl>
                        <Paper component={List} elevation={0} style={{width: 100}}>
                            {dates.map((v, i) =>
                                <ListItem key={i}>
                                    <Chip label={v} onDelete={deleteItem("date", i)}/>
                                </ListItem>)}
                        </Paper>
                    </div>

                </Box>
                <Box>
                    <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                        添加时间
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns} locale={znLocale}>
                        <div style={{display: "flex", alignItems: "center", justifyContent: "space-around"}}>
                            <MobileTimePicker
                                ampm={false}
                                value={interval.start}
                                onChange={selectInterVal("start")}
                                renderInput={(params) => <TextField placeholder={"开始"} {...params} />}/>
                            <Typography variant={"h5"} style={{padding: "0px 10px"}}>到</Typography>
                            <MobileTimePicker
                                ampm={false}
                                value={interval.end}
                                onChange={selectInterVal("end")}
                                renderInput={(params) => <TextField placeholder={"结束"} {...params} />}/>
                            <IconButton color="primary" onClick={addInterval}><AddIcon/></IconButton>
                        </div>
                        <Grid container spacing={1} style={{marginTop: 20}}>
                            {intervals.map((v, i) =>
                                <Grid item key={i}>
                                    <Chip label={v} onDelete={deleteItem("interval", i)}/>
                                </Grid>)}
                        </Grid>
                    </LocalizationProvider>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color={"primary"} variant={"contained"} onClick={confirmDutyChart}>确定</Button>
                <Button color={"primary"} variant={"outlined"} onClick={setCreateDuty(false)}>取消</Button>
            </DialogActions>
        </Dialog>
        <Drawer anchor={"bottom"} open={changeSingle} onClose={setChangeSingle(false)}>
            <Box sx={{width: 'auto'}}
                 role="presentation">
                <List>
                    {new Array(MAX_NUM_NEED).fill(0).map((v, i) =>
                        <ListItem key={i} button onClick={changeSingleBlock(i + 1)}>{i + 1}</ListItem>)}
                </List>
            </Box>
        </Drawer>
        <Dialog open={vacantDialog} onClose={setVacantDialog(false)} maxWidth={"xl"}>
            <DialogTitle>空闲表</DialogTitle>
            <DialogContent>
                <Stack spacing={1} direction="row" style={{margin: "10px 0"}}>
                    <Autocomplete
                        id="free-solo-demo"
                        freeSolo
                        style={{width: 150}}
                        options={USERS.map(v => v.username)}
                        value={currentVacant.user.username}
                        onInputChange={changeVacantValue("username")}
                        renderInput={(params) => <TextField {...params} label="昵称"/>}
                    />
                    {/*// @ts-ignore*/}
                    <TextField value={currentVacant.maxDuty} onChange={changeVacantValue("maxDuty")}
                               style={{width: 150}} type={"number"} label={"最大班数"}/>
                </Stack>
                <Stack direction="row" spacing={1} style={{marginBottom: 10}}>
                    <Stack direction="row">
                        <CircleIcon htmlColor={LIKE_COLOR[Like.like]}/>
                        <Typography>可以</Typography>
                    </Stack>
                    <Stack direction="row">
                        <CircleIcon htmlColor={LIKE_COLOR[Like.like]}/>
                        <Typography>较可以</Typography>
                    </Stack>
                    <Stack direction="row">
                        <CircleIcon htmlColor={LIKE_COLOR[Like.refuse]}/>
                        <Typography>不可以</Typography>
                    </Stack>
                </Stack>
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: 400}} size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell/>
                                {dutyChart.days.map((v, i) => <StyledTableCell key={i}>{v}</StyledTableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentVacant.vacant.map((v, i, arr) => {
                                const dutyChart = currentVacant.dutyChart
                                if (i % dutyChart.days.length === 0) {
                                    return <TableRow key={i}>
                                        <TableCell>
                                            <Typography>{dutyChart.interval[i / dutyChart.days.length]}</Typography>
                                        </TableCell>
                                        {arr.slice(i, i + dutyChart.days.length).map((v2, j) =>
                                            <TableCell key={j} onClick={changeBlockLike(i / dutyChart.days.length, j)}>
                                                <Box sx={{backgroundColor: LIKE_COLOR[v2], height: 30}}/>
                                            </TableCell>)}
                                    </TableRow>
                                }
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions style={{display: "flex", justifyContent: "space-between"}}>
                <Stack direction={"row"} spacing={1}>
                    {vacants.find(v => v.user.username === currentVacant.user.username) ?
                        <Button color={"error"} variant={"contained"} onClick={deleteVacant}>删除</Button> : ""}
                </Stack>
                <Stack direction={"row"} spacing={1}>
                    <Button color={"primary"} variant={"contained"} onClick={confirmVacant}>确定</Button>
                    <Button color={"primary"} variant={"outlined"} onClick={setVacantDialog(false)}>取消</Button>
                </Stack>
            </DialogActions>
        </Dialog>
        <AlertModal open={alertOpen} onClose={closeAlert} {...alert}/>
    </Container>
}

export default App;
