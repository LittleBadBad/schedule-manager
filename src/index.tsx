import React, {lazy, StrictMode, Suspense} from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {HashRouter} from 'react-router-dom';
import {CssBaseline} from "@mui/material";
import {useRoutes} from "react-router";
import Master from "global-component";

const Index = lazy(() => import ('./pages'));
const AddVacant = lazy(() => import   ("./pages/addVacant"));
const Result = lazy(() => import ("./pages/result"));
const SetChart = lazy(() => import( "./pages/setChart"));


const routes = [
    {
        path: '',
        element: <Suspense fallback={<>...</>}>
            <Index/>
        </Suspense>
    },
    {
        path: '/',
        element: <Suspense fallback={<>...</>}>
            <Index/>
        </Suspense>
    },
    {
        path: 'index',
        element: <Suspense fallback={<>...</>}>
            <Index/>
        </Suspense>
    },
    {
        path: 'vacant',
        element: <Suspense fallback={<>...</>}>
            <AddVacant/>
        </Suspense>
    },
    {
        path: 'result',
        element: <Suspense fallback={<>...</>}>
            <Result/>
        </Suspense>
    },
    {
        path: 'setChart',
        element: <Suspense fallback={<>...</>}>
            <SetChart/>
        </Suspense>
    }
];

function Routes() {
    return useRoutes(routes)
}

ReactDOM.render(
    <StrictMode>
        <CssBaseline/>
        <HashRouter>
            <Master>
                <Routes/>
            </Master>
        </HashRouter>
    </StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
