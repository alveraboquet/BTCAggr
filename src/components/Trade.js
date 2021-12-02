import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Table from './Table'
import Chart from './Chart';

import axios from 'axios';

function Trade(){

	let [candles, setCandles] = useState([])
	let [domain, setDomain] = useState([0,0])
	let [price, setPrice] = useState(0)
		
	const getDomain = (rows) => {
		const values = rows.map(({ high, low }) => [high, low]).flat();
		return [Math.min(...values), Math.max(...values)];
	}

	useEffect(() => {
		axios.get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=20')
		.then(async response => {
			var data = []
			await response.data.map(c => {
					data.push({
						open: parseInt(Number(c[1]).toFixed(0)),
						close: parseInt(Number(c[4]).toFixed(0)),
						high: parseInt(Number(c[2]).toFixed(0)),
						low: parseInt(Number(c[3]).toFixed(0)),
						time: c[0]/1000
					})
			})
			setCandles(data)
		}).catch(error =>{
			console.log(error)
		})			
		const binanceChart = 'wss://stream.binance.com:9443/ws'
		var binanceChartWS = new WebSocket(binanceChart)
		binanceChartWS.onopen = (event) =>{
			binanceChartWS.send('{"method": "SUBSCRIBE", "params":["btcusdt@kline_1m"], "id": 4}')
		}
		binanceChartWS.onmessage = (event) => {
			let data = JSON.parse(event.data)
			if (data.hasOwnProperty('e')){
				setCandles(oldArr => {
					if (oldArr[oldArr.length-1].time === data.k.t/1000){
						return [...oldArr.slice(0,oldArr.length-1), {
							open: parseFloat(data.k.o),
							close: parseFloat(data.k.c),
							high: parseFloat(data.k.h),
							low: parseFloat(data.k.l),
							time: data.k.t/1000
						}]
					}else{
						oldArr.shift()
						return [...oldArr,{
							open: parseFloat(data.k.o),
							close: parseFloat(data.k.c),
							high: parseFloat(data.k.h),
							low: parseFloat(data.k.l),
							time: data.k.t/1000
						}]
					}
				})
				setPrice(Number(data.k.c).toFixed(0))
			}
		}
		return () => {
			binanceChartWS.close()
		}
	}, []);

	useEffect(() => {
		if (candles.length > 0){
			setDomain(getDomain(candles))
		}
	}, [candles])

    return(
        <View>
			<View>
				<Text style={[styles.textColor, styles.header]}>Bitcoin</Text>
				<Text style={[styles.textColor, styles.header]}>${price}</Text>
			</View>
			<Chart {...{ candles, domain }} />
			<Table/>
        </View>
    )
}

const styles = StyleSheet.create({
	container:{
		flex: 1
	},
	textColor: {
		color: "#D1D5DB"
	},
	header: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 5,
		textAlign: 'center'
	},
})

export default Trade