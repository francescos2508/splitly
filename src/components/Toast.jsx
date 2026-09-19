import { colors } from '@/src/constants/constants';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export default function Toast({ message, onHide, time = 2000 }) {
    const translateY = useRef(new Animated.Value(30)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.spring(translateY, {toValue: 30, duration: 200, useNativeDriver: true }),
                Animated.timing(opacity, {toValue: 0, duration: 200, useNativeDriver: true})
            ]).start(() => {
                onHide();
            })
        }, time);

        return () => clearTimeout(timer);
    }, [])
    return (
        <Animated.View style={[ styles.toast, { opacity, transform: [{translateY}] } ]}>
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        bottom: 60,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.primary,
        zIndex: 100,
    },
    text: {
        color: colors.white,
        fontWeight: 600
    }
});