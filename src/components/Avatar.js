import { sp } from '@/src/constants/constants';
import { useTheme } from '@/src/context/ThemeContext';
import { StyleSheet, Text, View } from "react-native";

export default function Avatar({color = '#6D6875', inits, height = sp[2], width = sp[2]}) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <View style={[styles.avatar, {backgroundColor: color, height: height, width: width}]}>
            <Text style={[styles.avatarInits, {fontSize: height / 2.2}]}>{inits}</Text>
        </View>
    )
}
const createStyles = (colors) => StyleSheet.create({
    avatar: {
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        marginRight: sp.half
    },
    avatarInits: {
        color: colors.white,
    },
})