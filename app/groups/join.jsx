import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { joinGroup } from "../../src/api/api";
import AppInput from "../../src/components/AppInput";
import Loader from "../../src/components/Loader";
import { saveMemberToken } from "../../src/storage/auth";
import { createCommonStyle } from "../../src/styles/common";



export default function JoinGroup({ initialInviteCode }) {
    const { colors } = useTheme();
    const commonStyle = createCommonStyle(colors);
    const [inviteCode, setInviteCode] = useState(initialInviteCode || '');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(null);

    const handleJoin = async () => {
        try {
            setLoading(true);
            const res = await joinGroup(inviteCode.toUpperCase(), username);
            if (res && res.member) await saveMemberToken(res?.member.member_token);
            setLoading(false);
            if (res && res.group) router.replace(`/groups/${res.group.id}`)
        } catch (error) {
            // console.error(error);
            alert(error.message);
            setLoading(false);
        }
    }

    if (loading) return (<Loader />);

    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Pressable style={commonStyle.headerBack} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </Pressable>
                <Text style={commonStyle.title}>Join Group</Text>
            </View>
            <View style={commonStyle.body}>
                <Text style={commonStyle.label}>Insert invite code</Text>
                <AppInput style={commonStyle.input} autoCapitalize="characters" value={inviteCode} disabled={!!initialInviteCode} onChangeText={setInviteCode} placeholder="Invite code" />
                
                <Text style={commonStyle.label}>Join group as </Text>
                <AppInput style={commonStyle.input} value={username} onChangeText={setUsername} placeholder="Join group as" />

                <Pressable style={commonStyle.btn} onPress={handleJoin}>
                    <Text style={commonStyle.btnText}>Join</Text>
                </Pressable>
            </View>
        </View>
    )
}