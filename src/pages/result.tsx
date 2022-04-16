import {
    Button,
    Container,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import StyledTableCell from "../components/styledTableCell";
import React, {useContext} from "react";
import {useSearchParams} from "react-router-dom";
import {DATES, INTERVALS} from "../env";
import copy from "clipboard-copy";
import {Global} from "global-component";

export default function Result(props) {
    const {openTip} = useContext(Global)
    const [searchParams, setSearchParams] = useSearchParams();

    const _days = searchParams.get("days") || DATES.join(","), days = decodeURI(_days).split(",")
    const _intervals = searchParams.get("intervals") || INTERVALS.join(","),
        intervals = decodeURI(_intervals).split(",")
    const _result = searchParams.get("result") || "",
        result = _result && _result !== "" ? JSON.parse(decodeURI(_result)) : []

    const copyRes = () => {
        copy(result.map(v => v.length ? v : "没人").join(",")).then(r => {
            openTip("复制成功")
        }).catch(e => {
            openTip("复制失败", "error")
        })
    }
    return <Container maxWidth="sm">
        <Stack justifyContent={"center"} sx={{height: '100vh'}} spacing={1}>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 400}} size="small">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell/>
                            {days.map((v, i) => <StyledTableCell key={i}>{v}</StyledTableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {result.map((v, i, arr) =>
                            i % days.length === 0 ? <TableRow key={i}>
                                <TableCell>
                                    <Typography>{intervals[i / days.length]}</Typography>
                                </TableCell>
                                {arr.slice(i, i + days.length).map((slot, j) =>
                                    <TableCell key={j}>
                                        {slot.map((username, k) => <Typography
                                            key={k}>{username}</Typography>)}
                                    </TableCell>)}
                            </TableRow> : null)}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button variant={"contained"} onClick={copyRes}>可以了</Button>
        </Stack>
    </Container>
}
