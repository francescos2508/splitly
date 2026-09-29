import { colors } from "@/src/constants/constants";
import { commonStyle } from "@/src/styles/common";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function AppInput({ suffix, iconLeft, iconRight, ...props }) {
    return (
        <View style={[commonStyle.input, { flexDirection: "row", alignItems: "center" }]}>
            {iconLeft && <Ionicons name={iconLeft} size={20} color={colors.textSecondary} />}

            <TextInput
                {...props}
                style={{ flex: 1 }}
                placeholderTextColor={colors.textMuted}
            />

            {iconRight && <Ionicons name={iconRight} size={20} color={colors.textSecondary} />}

            {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    suffix: {
        right: 8,
        color: colors.textSecondary,
        fontSize: 16,
        position: 'absolute'
    }
})