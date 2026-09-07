/* import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
 */

import { colors, sp } from '@/src/constants/constants';
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";


export default function Index() {

  // console.log(supabase);

  return (
    <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
      <View style={styles.body}>
        <Text style={styles.welcome}>Welcome to Splitly</Text>
        <Pressable  style={styles.btn} onPress={() => router.push('/groups')}>
          <Text style={styles.btnText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: sp[2]},
  body:{
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: sp[1],
    width: "100%",
  },
  btn: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: colors['primary'],
  },
  btnText: {
    color: colors['white'],
    fontSize: 16,
    fontWeight: "600",
  }
})