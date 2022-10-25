import React from "react";
import { useState, useEffect } from "react";
import cloneDeep from "lodash/cloneDeep";
import throttle from "lodash/throttle";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import "./Table.css";
// import dotenv from "dotenv";
// dotenv.config();

import io from 'socket.io-client';
const s_url = process.env.SS_URL || "http://localhost:5000";
const socket = io(s_url);

const tableHead = {
    id: "Id",
    name: "Name",
    q: "Quality",
    price: "Price"
};

const Table = () => {
    const [countPerPage, setPerpage] = useState(5);
    const [value, setValue] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);
    const [collection, setCollection] = React.useState([]);
    const [products, setData] = useState([]);
    const [q, setQ] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [len, setLen] = useState(0);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('connected')
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on("ping", (data) => {
            setData(p => {
                var ids = new Set(data.map(d => d.id));
                var merged = [...p.filter(d => !ids.has(d.id)), ...data];
                merged.sort((a, b) => (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0);
                return merged;
            });
        })

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('ping');
        };
    }, []);

    useEffect(() => {
        updatePage(currentPage);
    }, [products, q, currentPage]);// eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect(()=> {
        setCurrentPage(1);
    }, [countPerPage]);

    useEffect(() => {        
        searchData.current(value);
        setCurrentPage(1);
    }, [value]);

    const handleChange = e => {        
        setPerpage(e.target.value);
    }

    const searchData = React.useRef(
        throttle(val => {    
            const query = val.toLowerCase();
            setQ(query);
        }, 400)
    );

    // const updatePage =  useCallback((p) => {
    //     setCurrentPage(p);
    //     const to = countPerPage * currentPage;
    //     const from = to - countPerPage;
    //     const f = products
    //             .filter(item => item.price.toLowerCase().indexOf(q) > -1);
    //     setLen(f.length);
        
    //     if (countPerPage === 'all')
    //         setCollection(cloneDeep(f));
    //     else
    //         setCollection(cloneDeep(f.slice(from, to)));
    // });
    const updatePage = p => {
        setCurrentPage(p);
        const to = countPerPage * currentPage;
        const from = to - countPerPage;
        const f = products
                .filter(item => item.price.toLowerCase().indexOf(q) > -1);
        setLen(f.length);
        
        if (countPerPage === 'all')
            setCollection(cloneDeep(f));
        else
            setCollection(cloneDeep(f.slice(from, to)));
    };

    const tableRows = rowData => {
        const { key, index } = rowData;
        const tableCell = Object.keys(tableHead);
        const columnData = tableCell.map((keyD, i) => {
            return <td key={i}>{key[keyD]}</td>;
        });
        return <tr key={index}>{columnData}</tr>;
    };

    const TableData = () => {
        if (collection == null) return;
        return collection.map((key, index) => tableRows({ key, index }));
    };

    const HeadRow = () => {
        return Object.values(tableHead).map((title, index) => (
            <td key={index}>{title}</td>
        ));
    };

    return (
        <>
            <h2>{isConnected ? "Connected" : "Disconnected"}</h2>
            <div className="search">
                <input
                    placeholder="Search Price"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />
                <select onChange={e => handleChange(e)}>
                    <option value='5' >5</option>
                    <option value='10'>10</option>
                    <option value='all'>All</option>
                </select>
            </div>
            <table>
                <thead><tr><HeadRow/></tr></thead>
                <tbody className="trhover"><TableData/></tbody>
            </table>
            {
                (countPerPage!=='all') &&
                <Pagination                    
                    pageSize={countPerPage}
                    onChange={updatePage}
                    current={currentPage}
                    total={len}
                    locale={"en_US"}
                />
            }
            <h5>{`Show : ${countPerPage} | Search Results : ${len} | Total Products ${products.length}`}</h5>
        </>
    );
};
export default Table;
