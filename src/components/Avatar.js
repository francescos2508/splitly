import { colors, sp } from '@/src/constants/constants';
import { StyleSheet, Text, View } from "react-native";

export default function Avatar({color, inits}) {
    return (
        <View style={[styles.avatar, {backgroundColor: color}]}>
            <Text style={styles.avatarInits}>{inits}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    avatar: {
        borderRadius: '100%',
        height: sp[2],
        width: sp[2],
        justifyContent: "center",
        alignItems: "center",
        marginRight: sp.half
    },
    avatarInits: {
        color: colors.white,
    },
})