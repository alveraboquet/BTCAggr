import React, {useState, useEffect} from "react";
import { View, Text, FlatList, StyleSheet} from 'react-native'

function Table(){

    let [trades, setTrades] = useState([])

    const binanceWebSocket = 'wss://stream.binance.com:9443/ws'
    const binanceFuturesWebSocket = 'wss://fstream.binance.com/ws'
    const ftxWebSocket = 'wss://ftx.com/ws/'
    const krakenWebSocket = 'wss://ws.kraken.com'
    const coinbaseWebSocket = 'wss://ws-feed.exchange.coinbase.com'

    const arrLength = 100

    const formatTotal = n => {
        if (n < 1e3) return Number(n).toFixed(2);
        if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
        if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
        if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
        if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
    };

    useEffect(() => {
        var binanceSpotWS = new WebSocket(binanceWebSocket)
        binanceSpotWS.onopen = (event) =>{
            binanceSpotWS.send(JSON.stringify({"method": "SUBSCRIBE", "params":["btcusdt@aggTrade"], "id": 3}))
        }
        binanceSpotWS.onmessage = (event) => {
            let data = JSON.parse(event.data)
            if (data.hasOwnProperty('e')){
                if (data.q * data.p > 100000){
                    setTrades(oldArray => {
                        if (oldArray.length > arrLength){
                            oldArray.splice(0,25)
                        }
                        return [{exchange: "binance", time: data.T, type: data.m ? "BUY" : "SELL", buysell: data.m, quantity: data.q, total: formatTotal(data.q * data.p), price: data.p}, ...oldArray]
                    })
                }
            }
        }
        return () => {
            binanceSpotWS.close()
        }
    },[])

    useEffect(() => {
        var binanceFuturesWS = new WebSocket(binanceFuturesWebSocket)
        binanceFuturesWS.onopen = (event) =>{
            binanceFuturesWS.send(JSON.stringify({"method": "SUBSCRIBE", "params":["btcusdt@aggTrade"], "id": 4}))
        }
        binanceFuturesWS.onmessage = (event) => {
            let data = JSON.parse(event.data)
            if (data.hasOwnProperty('e')){
                if (data.q * data.p > 100000){
                    setTrades(oldArray => {
                        if (oldArray.length > arrLength){
                            oldArray.splice(0,25)
                        }
                        return [{exchange: "binance", time: data.T, type: data.m ? "BUY" : "SELL", buysell: data.m, quantity: data.q, total: formatTotal(data.q * data.p), price: data.p}, ...oldArray]
                    })
                }
            }
        }
        return () => {
            binanceFuturesWS.close()
        }
    },[])

    useEffect(() => {
        var ftxSpotWS = new WebSocket(ftxWebSocket)
        ftxSpotWS.onopen = (event) =>{
            ftxSpotWS.send(JSON.stringify({'op': 'subscribe', 'channel': 'trades', 'market': 'BTC/USD'}))
        }
        ftxSpotWS.onmessage = (event) => {
            let data = JSON.parse(event.data)
            if (data.hasOwnProperty('data')){
                var arr = []
                data.data.map(d => {
                    var total = d.size * d.price
                    if (total > 50000){
                        arr = [{
                            exchange: "ftx",time: new Date(d.time).getTime(), type: d.side.toUpperCase(), buysell: d.side === "buy" ? true : false, 
                            quantity: d.size, total: formatTotal(total), price: d.price}, ...arr]
                    }
                })
                setTrades(oldArray => {
                    if (oldArray.length > arrLength){
                        oldArray.splice(0,25)
                    }
                    return [...arr, ...oldArray]
                })
            }
        }
        return () => {
            ftxSpotWS.close()
        }
    }, [])

    useEffect(() => {
        var ftxFuturesWS = new WebSocket(ftxWebSocket)
        ftxFuturesWS.onopen = (event) =>{
            ftxFuturesWS.send(JSON.stringify({'op': 'subscribe', 'channel': 'trades', 'market': 'BTC-PERP'}))
        }
        ftxFuturesWS.onmessage = (event) => {
            let data = JSON.parse(event.data)
            if (data.hasOwnProperty('data')){
                var arr = []
                data.data.map(d => {
                    var total = d.size * d.price
                    if (total > 50000){
                        arr = [{exchange: "ftx",time: new Date(d.time).getTime(), type: d.side.toUpperCase(), 
                            buysell: d.side === "buy" ? true : false, quantity: d.size, total: formatTotal(total), price: d.price}, ...arr]
                    }
                })
                setTrades(oldArray => {
                    if (oldArray.length > arrLength){
                        oldArray.splice(0,25)
                    }
                    return [...arr, ...oldArray]
                })
            }
        }
        return () => {
            ftxFuturesWS.close()
        }
    }, [])

    useEffect(() => {
        var krakenWS = new WebSocket(krakenWebSocket)
        krakenWS.onopen = (event) =>{
            krakenWS.send(JSON.stringify({"event":"subscribe", "subscription":{"name":"trade"}, "pair":["BTC/USD"]}))
        }
        krakenWS.onmessage = (event) => {
            var data = JSON.parse(event.data)
            if (Array.isArray(data)){
                var arr = []
                data[1].map(d => {
                    var price = parseFloat(d[0])
                    var quantity = parseFloat(d[1])
                    if (price*quantity > 5000){
                        arr = [{exchange: "kraken",time: parseInt(parseFloat(d[2])*1000), type: d.side === "b" ? "BUY" : "SELL", 
                            buysell: d.side === "b" ? true : false, quantity: quantity, total: formatTotal(quantity * price), price: price}, ...arr]
                    }
                })
                setTrades(oldArray => {
                    if (oldArray.length > arrLength){
                        oldArray.splice(0,25)
                    }
                    return [...arr, ...oldArray]
                })
            }
        }
        return () => {
            krakenWS.close()
        }
    }, [])

    useEffect(() => {
        var coinbaseWS = new WebSocket(coinbaseWebSocket)
        coinbaseWS.onopen = (event) =>{
            coinbaseWS.send(JSON.stringify({
                "type": "subscribe",
                "channels": [{ "name": "full", "product_ids": ["BTC-USD"] }]
            }))
        }
        coinbaseWS.onmessage = (event) => {
            var data = JSON.parse(event.data)
            if(data.hasOwnProperty('type') && data.type === 'match'){
                var price = parseFloat(data.price)
                var quantity = parseFloat(data.size)
                if (price*quantity > 10000){
                    setTrades(oldArray => {
                        if (oldArray.length > arrLength){
                            oldArray.splice(0,25)
                        }
                        return [{
                            exchange: "coinbase", time: new Date(data.time).getTime(), type: data.side === "buy" ? "BUY" : "SELL", buysell: data.side === "buy" ? true : false, 
                            quantity: quantity, total: formatTotal(quantity * price), price: price}, ...oldArray]
                    })
                }
            }
        }
        return () => {
            coinbaseWS.close()
        }
    }, [])

    const Row = (props) => {
        var data = props.item.item
        return (
            <View style={styles.row}>
                <Text style={[data.buysell ? styles.buyColor : styles.sellColor, styles.price]}>{Number(data.price).toFixed(0)}</Text>
                <Text style={[styles.item, styles.btc]}>{data.quantity % 1 != 0 ? parseFloat(data.quantity) : Number(data.quantity).toFixed(0)} BTC</Text>
                <Text style={[styles.item, styles.total]}>{data.total}</Text>
            </View>
        )
    }

    const Separator = () => {
        return <View style={styles.separator} />
    }

    const Header = () => {
        return(
            <View style={styles.header}>
                <Text style={[styles.item, styles.price]}>Price</Text>
                <Text style={[styles.item, styles.btc]}>Size</Text>
                <Text style={[styles.item, styles.total]}>Total</Text>
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <FlatList data={trades} 
                renderItem={r => <Row item={r}/>}
                ItemSeparatorComponent={Separator}
                ListHeaderComponent={Header}
                stickyHeaderIndices={[0]} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginBottom: 10,
	},
    header:{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#374151",
        height: 25,
    },
    row: {
        marginTop: 10,
        marginBottom: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    separator: {
        height: 0.5,
        width: "100%",
        backgroundColor: "#374151"
    },
    item: {
        textAlign: "center",
        color: "#D1D5DB"
    },
    buysell: {
        width: "10%"
    },
    price: {
        width: "30%"
    },
    btc: {
        width: "40%"
    },
    total: {
        width: "20%"
    },
    buyColor: {
        color: "#10B981",
        textAlign: "center",

    },
    sellColor:{
        color: "#EF4444",
        textAlign: "center",
    },
});
  

export default Table