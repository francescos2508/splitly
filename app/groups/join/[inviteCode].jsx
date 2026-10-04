import { useLocalSearchParams } from 'expo-router';
import JoinGroup from '../join';

export default function JoinByLink() {
    const { inviteCode } = useLocalSearchParams();

    console.log(inviteCode);
    console.log('Link da creare: https://splitly-f.onrender.com/join/[inviteCode]');

    return <JoinGroup initialInviteCode={inviteCode} />;
}