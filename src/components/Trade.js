import React, {useEffect} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Table from './Table'

function Trade(props){
    return(
        <View>
			<Text style={[styles.textColor, styles.header]}>BTCUSD</Text>
			<Table/>
        </View>
    )
}

const styles = StyleSheet.create({
	textColor: {
		color: "#D1D5DB"
	},
	header: {
		fontSize: 20,
		fontWeight: 'bold',
		marginLeft: "10%",
		marginBottom: 20
	}
})

export default Trade