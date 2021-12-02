import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import Trade from './src/components/Trade';

const App = () => {
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Trade/>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: "#111827",
  }
});

export default App;
