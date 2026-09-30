import { sp } from '@/src/constants/constants';
import { useTheme } from "@/src/context/ThemeContext";
import { Pressable, StyleSheet, View } from "react-native";

export default function Switcher({ value, onChange }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <Pressable onPress={onChange} style={[styles.track, {backgroundColor: value ? colors.primary : colors.border}]}>
            <View style={[styles.thumb, {transform: [{translateX: value ? 20 : 0}]}]} />
        </Pressable>
    );
}

const createStyles = (colors) => StyleSheet.create({
    track: {
        borderRadius: 20,
        padding: 2,
        width: sp[4],
        height: sp[2],
        justifyContent: 'center'
    },
    thumb: {
        width: sp[4]/1.6,
        height: sp[2]-4,
        borderRadius: 20,
        backgroundColor: colors.white,
    },
})