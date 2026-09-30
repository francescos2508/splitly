import { useTheme } from '@/src/context/ThemeContext';
import { createCommonStyle } from "@/src/styles/common";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function AppInput({ suffix, iconLeft, iconRight, ...props }) {
    const { colors } = useTheme();
    const commonStyle = createCommonStyle(colors);
    const styles = createStyles(colors);
    return (
        <View style={[commonStyle.input, { flexDirection: "row", alignItems: "center" }]}>
            {iconLeft && <Ionicons name={iconLeft} size={20} color={colors.textSecondary} />}

            <TextInput
                {...props}
                style={{ flex: 1, color: colors.text }}
                placeholderTextColor={colors.textMuted}
            />

            {iconRight && <Ionicons name={iconRight} size={20} color={colors.textSecondary} />}

            {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    suffix: {
        right: 20,
        color: colors.textSecondary,
        fontSize: 16,
        position: 'absolute'
    }
})