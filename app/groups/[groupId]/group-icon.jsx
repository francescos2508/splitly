import { useGroup } from "@/backend/src/context/GroupContext";
import { updateGroup } from "@/src/api/api";
import Loader from "@/src/components/Loader";
import { colors, groupIcons } from "@/src/constants/constants";
import { commonStyle } from "@/src/styles/common";
import { lightColor } from "@/src/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// just to have some colors, not related to anything yet
const iconColors = [
    '#2A9D8F',  // Teal
    '#9B5DE5',  // Purple
    '#F77F00',  // Orange
    '#F72585',  // Magenta
    '#118AB2',  // Ocean blue
    '#8AC926', // Lime
    '#FF595E', // Coral
    '#00B4D8', // Cyan
    '#FFCA3A', // Gold
    '#52B788', // Green

    // discarded ↓
    // '#E63946',  // Red
    // '#4361EE',  // Blue
    // '#F4D35E',  // Yellow
    // '#06D6A0',  // Emerald
    // '#6C584C', // Brown
    // '#8338EC', // Violet
    // '#1982C4', // Azure
    // '#C77DFF', // Lavender
    // '#FF70A6', // Pink
    '#6D6875', // Slate
];

export default function EditGroupIcon() {
    const { group, refreshGroup, loading, setLoading } = useGroup();
    const [currentIcon, setCurrentIcon] = useState(group?.icon || 'people-outline');

    const handleSaveGroupSettings = async () => {
        try {
            setLoading(true);
            const res = await updateGroup({...group, icon: currentIcon});
            if (res) {
                await refreshGroup({group: true});
                router.back();
            }
        } catch (error) {
            console.error(error.message);
            alert('Problem while updating group, please retry in few minutes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={commonStyle.container}>
            {loading && <Loader overlay />}
            <View style={commonStyle.header}>
                <Pressable style={commonStyle.headerBack} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </Pressable>
                <Text style={commonStyle.title}>Select group icon</Text>
            </View>

            <View style={commonStyle.body}>
                <Text style={commonStyle.sectionTitle}>Group info</Text>
                <View style={styles.iconsContainer}>
                    {groupIcons?.map((icon, idx) => {
                        const col = iconColors[idx];
                        let selected = false;
                        if (icon === currentIcon) selected = true;

                        return (
                            <Pressable 
                                key={icon} 
                                style={[styles.contIcon, selected ? { backgroundColor: col, borderWidth: 3, borderColor: lightColor(col) } : {backgroundColor: lightColor(col)}]}
                                onPress={() => setCurrentIcon(icon)}    
                            >
                                <Ionicons name={icon} size={40} color={selected ? lightColor(col) : col} />
                            </Pressable>
                        )
                    })}
                </View>
            </View>

            <View style={commonStyle.footer}>
                <Pressable style={commonStyle.btn} onPress={handleSaveGroupSettings} >
                    <Text style={commonStyle.btnText}>Confirm</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    iconsContainer:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        rowGap: 4,
        columnGap: 4,
    },
    contIcon: {
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '24%',
        height: '24%',
        aspectRatio: 1,
    },
});