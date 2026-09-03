import AsyncStorage from "@react-native-async-storage/async-storage";

// async storage per salvare in memoria il member_token e comprovarlo ad ogni login

const MEMBER_TOKEN_KEY = "member_token";

export async function saveMemberToken(token) {
    await AsyncStorage.setItem(MEMBER_TOKEN_KEY, token);
}

export async function getMemberToken() {
    return await AsyncStorage.getItem(MEMBER_TOKEN_KEY);
}

export async function removeMemberToken() {
    await AsyncStorage.removeItem(MEMBER_TOKEN_KEY);
}