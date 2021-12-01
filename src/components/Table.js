import React, {useState, useEffect} from "react";
import { View, Text, FlatList, StyleSheet} from 'react-native'

function Table(props){

    let [trades, setTrades] = useState([])

    const binanceWebSocket = 'wss://stream.binance.com:9443/ws'
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
	}, [])

    const Row = (props) => {
        var data = props.item.item
        console.log(data)
        return (
            <View style={data.buysell ? styles.buyColor : styles.sellColor}>
                <View style={styles.row}> 
                    <Text style={styles.item}>{data.type}</Text>
                    <Text style={styles.item}>${Number(data.price).toFixed(0)}</Text>
                    <Text style={styles.item}>{data.quantity % 1 != 0 ? parseFloat(data.quantity) : Number(data.quantity).toFixed(0)} BTC</Text>
                    <Text style={styles.item}>{data.total}</Text>
                </View>
            </View>
        )
    }

    return(
        <FlatList data={trades} renderItem={r => <Row item={r}/>} />
    )
}

const styles = StyleSheet.create({
    row: {
        marginTop: 5,
        marginBottom: 5,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
    },
    item: {
        textAlign: "center",
        width: "25%"
    },
    buyColor: {
        borderBottomWidth: 1, 
        borderBottomColor: "#111827",
        backgroundColor: "#34D399"
    },
    sellColor:{
        borderBottomWidth: 1, 
        borderBottomColor: "#111827",
        backgroundColor: "#F87171"
    }
});
  

export default Table