import { commonStyle } from '@/src/styles/common';
import { router } from 'expo-router';
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createGroup } from '../../src/api/api';
import AppInput from '../../src/components/AppInput';
import SelectInput from '../../src/components/SelectInput';
import { saveMemberToken } from '../../src/storage/auth';

export default function CreateGroup() {
    const [groupname, setGroupname] = useState('');
    const [username, setUsername] = useState('Admin');
    const [currency, setCurrency] = useState('EUR');

    const currencies = [
        { label: "EUR (€)", value: "EUR" },
        { label: "USD ($)", value: "USD" },
        { label: "GBP (£)", value: "GBP" },
    ];


    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Text style={commonStyle.title}>Create Group</Text>
            </View>
            <View style={commonStyle.body}>
                <Text style={commonStyle.label}>Group name</Text>
                <AppInput
                    style={commonStyle.input}
                    placeholder='Group name'
                    value={groupname}
                    onChangeText={setGroupname}
                />
                <Text style={commonStyle.label}>Your name</Text>
                
                <AppInput
                    style={commonStyle.input}
                    placeholder='Your name'
                    value={username}
                    onChangeText={setUsername}
                />
                {/* <Text style={commonStyle.label}>Currency</Text> */}
                <View style={commonStyle.pickerContainer}>
                    <SelectInput
                        label="Currency"
                        value={currency}
                        options={currencies}
                        onChange={setCurrency}
                    />
                </View>

            </View>
            <View style={commonStyle.footer}>
                <Pressable
                    style={commonStyle.btn}
                    onPress={async () => {
                        try {
                            const data = await createGroup({ groupName: groupname, userName: username, currency: currency })
                            await saveMemberToken(data.member.member_token);
                            router.replace('/groups/' + data.group.id);
                        } catch (error) {
                            alert(error.message);
                        }
                    }}
                >
                    <Text style={commonStyle.btnText}>Create group</Text>
                </Pressable>

                <Pressable
                    style={commonStyle.btn2}
                    onPress={() => router.back()}
                >
                    <Text style={commonStyle.btn2Text}>Cancel</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    
})