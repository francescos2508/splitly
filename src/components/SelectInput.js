import { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { sp } from "@/src/constants/constants";
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from "@expo/vector-icons";

export default function SelectInput({ label, value, options, onChange, placeholder = "Select...", editable = true }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find(
        (option) => option.value === value
    );

    const handleSelect = (option) => {
        onChange(option.value);
        setVisible(false);
    };

    return (
        <>
            <Text style={styles.label}>{label}</Text>

            <Pressable style={styles.input} onPress={() => {if (editable) setVisible(true); else return;} }>
                <Text style={[styles.value, !selectedOption && styles.placeholder]}>
                    {selectedOption?.label || placeholder}
                </Text>

                <Ionicons name='chevron-down' size={20} color={colors.textSecondary}/>
            </Pressable>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{label}</Text>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => {
                                const sel = item.value === value;
                                return (
                                    <Pressable
                                        style={styles.option}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={sel ? styles.optionTextSelected : styles.optionText}>
                                            {item.label}
                                        </Text>
                                        {sel && (<Ionicons name="checkmark-outline" size={20} color={colors.primary} />)}
                                    </Pressable>
                                )
                            }}
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const createStyles = (colors) => StyleSheet.create({
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: sp['half'],
        color: colors.text,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingHorizontal: sp[1],
        marginBottom: sp[1],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    value: {
        fontSize: 16,
        color: colors.text,
    },
    placeholder: {
        color: colors.textMuted,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        paddingHorizontal: sp[2],
    },
    modal: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingVertical: sp[2],
        maxHeight: "60%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        paddingHorizontal: sp[2],
        marginBottom: sp[1],
    },
    option: {
        paddingVertical: sp.md,
        paddingHorizontal: sp[2],
        flexDirection: 'row',
        gap: 8,
    },
    optionText: {
        fontSize: 16,
        color: colors.text,
    },
    optionTextSelected: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '700',
    }
});