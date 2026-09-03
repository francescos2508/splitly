import { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors } from "@/src/constants/colors";
import { sp } from "@/src/constants/spacing";

export default function SelectInput({
    label,
    value,
    options,
    onChange,
    placeholder = "Select...",
}) {
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

            <Pressable
                style={styles.input}
                onPress={() => setVisible(true)}
            >
                <Text
                    style={[
                        styles.value,
                        !selectedOption && styles.placeholder,
                    ]}
                >
                    {selectedOption?.label || placeholder}
                </Text>

                <Text style={styles.arrow}>▼</Text>
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
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.option}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={styles.optionText}>
                                        {item.label}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: sp[1],
        color: colors.text,
    },

    input: {
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.input,
        borderRadius: 10,
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

    arrow: {
        fontSize: 20,
        color: colors.textSecondary,
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        paddingHorizontal: sp[2],
    },

    modal: {
        backgroundColor: colors.surface,
        borderRadius: 14,
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
        paddingVertical: sp[1],
        paddingHorizontal: sp[2],
    },

    optionText: {
        fontSize: 16,
        color: colors.text,
    },
});