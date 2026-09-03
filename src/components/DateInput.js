import { colors } from '@/src/constants/colors';
import { sp } from '@/src/constants/spacing';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
    Modal, Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function DateInput({value, label, onChange}) {
    const [date, setDate] = useState(value || new Date());
    const [showPicker, setShowPicker] = useState(false);

    return (
        <View>
            <Text style={styles.label}>{label || 'Date'}</Text>

            <Pressable
                style={styles.input}
                onPress={() => setShowPicker(true)}
            >
                <Text style={styles.inputText}>
                    {date.toLocaleDateString("en-GB")}
                </Text>

                <Text style={styles.arrow}>›</Text>
            </Pressable>

            {/* {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="inline"
                    onChange={onChange || ((event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate) setDate(selectedDate);
                    })}
                />
            )} */}
            <Modal visible={showPicker} transparent animationType="fade"
                onRequestClose={() => setShowPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Select date</Text>

                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="inline"
                            onChange={onChange || ((event, selectedDate) => {
                                setShowPicker(false);
                                if (selectedDate) setDate(selectedDate);
                            })}
                        />

                        <Pressable
                            style={styles.doneButton}
                            onPress={() => setShowPicker(false)}
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: sp[1],
    },

    input: {
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.input,
        borderRadius: 10,
        paddingHorizontal: sp[1],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: sp[1],
        color: colors.text,
    },

    inputText: {
        fontSize: 16,
        color: colors.text,
    },

    arrow: {
        fontSize: 24,
        color: colors.textSecondary,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },

    modal: {
        width: "100%",
        backgroundColor: colors['textSecondary'],
        borderRadius: 16,
        padding: 20,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.white,
        marginBottom: 16,
    },

    doneButton: {
        marginTop: 16,
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
    },

    doneButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
});