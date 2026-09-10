import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { joinGroup } from "../../src/api/api";
import AppInput from "../../src/components/AppInput";
import { saveMemberToken } from "../../src/storage/auth";
import { commonStyle } from "../../src/styles/common";



export default function JoinGroup() {
    const [inviteCode, setInviteCode] = useState(null);
    const [username, setUsername] = useState(null);

    const handleJoin = async () => {
        try {
            const res = await joinGroup(inviteCode, username);
            await saveMemberToken(res.member.member_token);
            if (res && res.group) router.replace(`/groups/${res.group.id}`)
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Text style={commonStyle.title}>Join Group</Text>
            </View>
            <View style={commonStyle.body}>
                <Text style={commonStyle.label}>Insert invite code</Text>
                <AppInput style={commonStyle.input} value={inviteCode} onChangeText={setInviteCode} placeholder="Invite code" />
                
                <Text style={commonStyle.label}>Join group as </Text>
                <AppInput style={commonStyle.input} value={username} onChangeText={setUsername} placeholder="Join group as" />

                <Pressable style={commonStyle.btn} onPress={handleJoin}>
                    <Text style={commonStyle.btnText}>Join</Text>
                </Pressable>
            </View>
        </View>
    )
}