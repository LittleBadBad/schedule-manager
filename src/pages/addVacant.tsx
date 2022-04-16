import {
    Autocomplete,
    Box,
    Button,
    Container,
    Grid,
    Paper,
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
import CircleIcon from "@mui/icons-material/Circle";
import {Like} from "../models";
import React, {useContext, useState} from "react";
import StyledTableCell from "../components/styledTableCell";
import {useSearchParams} from "react-router-dom";
import {LIKE_COLOR} from "../utils";
import {DATES, INTERVALS, USERS} from "../env";
import {Global} from "global-component";
import copy from "clipboard-copy";


function trans(name, maxDuty, vacant) {
    return JSON.stringify({
        name,
        maxDuty,
        vacant
    })
}

export default function AddVacant(props) {
    const {openTip} = useContext(Global)

    const [searchParams, setSearchParams] = useSearchParams();
    const _days = decodeURI(searchParams.get("days")) || DATES.join(","), days = _days.split(",")
    const _intervals = decodeURI(searchParams.get("intervals")) || INTERVALS.join(","),
        intervals = _intervals.split(",")
    const _vacant = decodeURI(searchParams.get("vacant")) || new Array(days.length * intervals.length).fill(Like.like).join(",")

    const initTemplate = _vacant.split(",").map(v => parseInt(v))

    const [name, setName] = useState(decodeURI(searchParams.get("name")) || "")
    const [maxDuty, setMaxDuty] = useState(parseInt(decodeURI(searchParams.get('maxDuty'))) || 3)
    const [vacant, setVacant] = useState(initTemplate)

    const changeVacantValue = (name: "name" | "maxDuty") => (event, newV) => {
        switch (name) {
            case "maxDuty":
                setMaxDuty(parseInt(event.target.value))
                break;
            case "name":
                setName(newV)
                break;
            default:
        }
    }

    const changeBlockLike = (i, j) => () => {
        let like = vacant[i * days.length + j]
        like >= 2 ? like = 0 : like += 1
        vacant[i * days.length + j] = like
        setVacant(new Array(...vacant))
    }

    const copyInfo = () => {
        copy(trans(name, maxDuty, vacant)).then(r => {
            openTip("复制成功")
        }).catch(e => {
            openTip("复制失败", "error")
        })
    }


    return <Container maxWidth="sm">
        <Stack justifyContent={"center"} sx={{height: '100vh'}} spacing={1}>

            <Grid container spacing={1} alignItems={"center"}>
                <Grid item sm={7} xs={12}>
                    <Stack spacing={1} direction="row" alignItems={"center"} flexWrap={"wrap"}>
                        <Autocomplete
                            id="free-solo-demo"
                            freeSolo
                            style={{width: 150}}
                            options={USERS.map(v => v.name)}
                            value={name}
                            size={"small"}
                            onInputChange={changeVacantValue("name")}
                            renderInput={(params) => <TextField {...params} label="昵称"/>}
                        />
                        {/*// @ts-ignore*/}
                        <TextField value={maxDuty} onChange={changeVacantValue("maxDuty")} size={"small"}
                                   style={{width: 150}} type={"number"} label={"最大班数"}/>
                    </Stack>
                </Grid>
                <Grid item sm={5} xs={12}>
                    <Stack spacing={1} direction="row" alignItems={"center"} flexWrap={"wrap"}>
                        <Stack direction="row">
                            <CircleIcon htmlColor={LIKE_COLOR[Like.like]}/>
                            <Typography>可以</Typography>
                        </Stack>
                        <Stack direction="row">
                            <CircleIcon htmlColor={LIKE_COLOR[Like.little]}/>
                            <Typography>较可以</Typography>
                        </Stack>
                        <Stack direction="row">
                            <CircleIcon htmlColor={LIKE_COLOR[Like.refuse]}/>
                            <Typography>不可以</Typography>
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>


            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell/>
                            {days.map((v, i) => <StyledTableCell key={i}>{v}</StyledTableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vacant.map((v, i, arr) => {
                            if (i % days.length === 0) {
                                return <TableRow key={i}>
                                    <TableCell>
                                        <Typography>{intervals[i / days.length]}</Typography>
                                    </TableCell>
                                    {arr.slice(i, i + days.length).map((v2, j) =>
                                        <TableCell key={j} onClick={changeBlockLike(i / days.length, j)}
                                                   sx={{padding: '5px 5px'}}>
                                            <Box sx={{backgroundColor: LIKE_COLOR[v2], minHeight: 20}}/>
                                        </TableCell>)}
                                </TableRow>
                            }
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button onClick={copyInfo} variant={"contained"} id="ok">好了</Button>
        </Stack>
    </Container>
}
