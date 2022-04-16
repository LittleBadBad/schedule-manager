import {
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
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
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {DATES, INTERVALS, MAX_NUM_NEED} from "../env";
import StyledTableCell from "../components/styledTableCell";
import React, {useContext, useState} from "react";
import {LocalizationProvider, MobileTimePicker} from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import znLocale from "date-fns/locale/zh-CN";
import AddIcon from "@mui/icons-material/Add";
import {storeLocal} from "../utils";
import {Global} from "global-component";
import copy from "clipboard-copy";
import {useSearchParams} from "react-router-dom";

function toTemplate(dates, intervals, perSlot) {
    return new Array<number>(dates.length * intervals.length).fill(perSlot)
}

function trans(days, intervals, template) {
    return JSON.stringify({
        days, intervals, template
    });
}

export default function SetChart(props) {

    const {openTip} = useContext(Global)

    const [searchParams, setSearchParams] = useSearchParams();
    const _days = searchParams.get("days") || DATES.join(",")
    const _intervals = searchParams.get("intervals") || INTERVALS.join(",")


    const [createDutyOpen, setCreateDutyOpen] = useState(false)
    const [interval, setInterval] = useState<{ start: Date | null, end: Date | null }>({start: null, end: null});
    const [days, setDays] = useState(decodeURI(_days).split(","))
    const [intervals, setIntervals] = useState(decodeURI(_intervals).split(","))
    const [perSlot, setPerSlot] = useState(1)

    const _template = searchParams.get("template") || toTemplate(days, intervals, perSlot).join(",")

    const [template, setTemplate] = useState(decodeURI(_template).split(",").map(v => parseInt(v)))
    const [anchor, setAnchor] = useState([0, 0])
    const [changeSingle, setChangeSingleOpen] = useState(false)

    const setCreateDuty = (open: boolean) => () => setCreateDutyOpen(open)
    const setChangeSingle = (open: boolean) => () => setChangeSingleOpen(open)

    const selectDates = (date: string) => () => {
        const i = days.indexOf(date)
        if (i !== -1) {
            days.splice(i, 1)
            const newDates = new Array(...days)
            setDays(newDates)
            storeLocal(newDates, 'days')
        } else {
            const newDates = [...days, date]
            setDays(newDates)
            storeLocal(newDates, 'days')
        }
    };
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
        const newIntervals = [...intervals, str]
        setIntervals(newIntervals)
        storeLocal(newIntervals, 'intervals')
    }
    const deleteItem = (name: "date" | "interval", i) => () => {
        if (name === "date") {
            days.splice(i, 1)
            const newDates = [...days]
            setDays(newDates)
            storeLocal(newDates, 'days')
        } else if (name === "interval") {
            intervals.splice(i, 1)
            const newIntervals = [...intervals]
            setIntervals(newIntervals)
            storeLocal(newIntervals, 'intervals')
        }
    }
    const confirmDutyChart = () => {
        setTemplate(toTemplate(days, intervals, perSlot))
        setCreateDutyOpen(false)
    }
    const changePerBlock = (event) => {
        setTemplate(toTemplate(days, intervals, event.target.value))
        setPerSlot(event.target.value)
    }
    const clickSingleBlock = (i, j) => () => {
        setAnchor([i, j])
        setChangeSingleOpen(true)
    }
    const selectAll = () => {
        if (days.length <= DATES.length && days.length > 0) {
            setDays([])
        } else {
            setDays(new Array(...DATES))
        }
    }
    const changeSingleBlock = (v: number) => () => {
        template[anchor[0] * days.length + anchor[1]] = v
        setTemplate(new Array(...template))
        setChangeSingleOpen(false)
    }
    const copyInfo = () => {
        copy(trans(days, intervals, template)).then(r => {
            openTip("复制成功")
        }).catch(e => {
            openTip("复制失败", "error")
        })
    }

    return <Container maxWidth={"sm"}>
        <Stack justifyContent={"center"} sx={{height: '100vh'}} spacing={1}>
            <Stack spacing={2} direction="row" style={{marginBottom: 10}} alignItems="flex-end">
                <Button variant={"outlined"} onClick={setCreateDuty(true)}>修改</Button>
                <FormControl sx={{width: 100}}>
                    <InputLabel id="demo-multiple-chip-label">每班人数</InputLabel>
                    <Select
                        variant={"standard"}
                        value={perSlot}
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
                            {days.map((v, i) => <StyledTableCell key={i}>{v}</StyledTableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {template.map((v, i, arr) =>
                            i % days.length === 0 ? <TableRow key={i}>
                                <TableCell>
                                    <Typography>{intervals[i / days.length]}</Typography>
                                </TableCell>
                                {arr.slice(i, i + days.length).map((v2, j) =>
                                    <TableCell key={j}
                                               onClick={clickSingleBlock(i / days.length, j)} align={"center"}>
                                        {v2}
                                    </TableCell>)}
                            </TableRow> : null)}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button variant='contained' onClick={copyInfo} id={'ok'}>好了</Button>
        </Stack>
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
                                    checked={days.length === DATES.length}
                                    indeterminate={days.length < DATES.length && days.length > 0}
                                    onChange={selectAll}/>}
                            />
                            <FormGroup aria-label="position">
                                {DATES.map((v, i) => {
                                    return <FormControlLabel
                                        key={i}
                                        control={<Checkbox checked={days.indexOf(v) !== -1}
                                                           name={v}
                                                           onChange={selectDates(v)}/>} label={v}/>
                                })}
                            </FormGroup>
                        </FormControl>
                        <Paper component={List} elevation={0} style={{width: 100}}>
                            {days.map((v, i) =>
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
    </Container>
}
