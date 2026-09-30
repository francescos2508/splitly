import { sp } from '@/src/constants/constants';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function DateInput({ value, label, onChange }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [date, setDate] = useState(value || new Date());
    const [showPicker, setShowPicker] = useState(false);

    const formattedDate =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const handleWebChange = (event) => {
        const value = event.target.value;

        if (!value) return;

        const [year, month, day] = value.split('-');
        const newDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        setDate(newDate);
        onChange?.(newDate);
    };

    return (
        <View>
            <Text style={styles.label}>{label || 'Date'}</Text>

            {Platform.OS === 'web' ? (
                <View style={styles.input}>
                    <Text style={styles.inputText}>
                        {date.toLocaleDateString("en-GB")}
                    </Text>

                    <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={colors.textSecondary}
                    />

                    <input
                        type="date"
                        value={formattedDate}
                        onChange={handleWebChange}
                        style={styles.webInput}
                    />
                </View>
            ) : (
                <>
                    <Pressable
                        style={styles.input}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={styles.inputText}>
                            {date.toLocaleDateString("en-GB")}
                        </Text>

                        <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={colors.textSecondary}
                        />
                    </Pressable>

                    <Modal
                        visible={showPicker}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowPicker(false)}
                    >
                        <Pressable
                            style={styles.modalOverlay}
                            onPress={() => setShowPicker(false)}
                        >
                            <View style={styles.modal}>
                                <Text style={styles.modalTitle}>
                                    Select date
                                </Text>

                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="inline"
                                    onChange={(event, selectedDate) => {
                                        setShowPicker(false);

                                        if (selectedDate) {
                                            setDate(selectedDate);
                                            onChange?.(selectedDate);
                                        }
                                    }}
                                />

                                <Pressable
                                    style={styles.doneButton}
                                    onPress={() => setShowPicker(false)}
                                >
                                    <Text style={styles.doneButtonText}>
                                        Done
                                    </Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Modal>
                </>
            )}
        </View>
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
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingHorizontal: sp[1],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: sp[1],
        position: "relative",
    },

    inputText: {
        fontSize: 16,
        color: colors.text,
    },

    webInput: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        cursor: "pointer",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },

    modal: {
        width: "100%",
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 16,
    },

    doneButton: {
        marginTop: 16,
        backgroundColor: colors.primary,
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: "center",
    },

    doneButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
});