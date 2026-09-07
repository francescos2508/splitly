import { colors, sp } from '@/src/constants/constants';
import { Ionicons } from '@expo/vector-icons';
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

                {/* <Text style={styles.arrow}>›</Text> */}
                <Text style={styles.arrow}>
                    <Ionicons name='calendar-outline' size={20} color={colors.textSecondary}/>
                </Text>
            </Pressable>

            <Modal visible={showPicker} transparent animationType="fade"
                onRequestClose={() => setShowPicker(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Select date</Text>

                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="inline"
                            onChange={((event, selectedDate) => {
                                setShowPicker(false);
                                if (selectedDate) {
                                    setDate(selectedDate);
                                    onChange?.(selectedDate);
                                }
                            })}
                        />

                        <Pressable
                            style={styles.doneButton}
                            onPress={() => setShowPicker(false)}
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: sp['half'],
    },

    input: {
        height: 40,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.input,
        borderRadius: 20,
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
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },

    modal: {
        width: "100%",
        backgroundColor: colors['textSecondary'],
        borderRadius: 20,
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