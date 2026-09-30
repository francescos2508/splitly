import { useTheme } from '@/src/context/ThemeContext';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function Loader( {overlay = false} ) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const translateY = useRef(new Animated.Value(8)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -8,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 8,
                    duration: 500,
                    useNativeDriver: true
                })
            ])
        ).start()
    }, []);
    // return (
    //     <View style={styles.container}>
    //     <ActivityIndicator size="large" color={colors.primary} />
    //     </View>
    // );
    return (
        <View style={overlay ? styles.overlay : styles.container}>
            <Animated.Image style={[styles.logo, {transform: [{translateY}]}]} resizeMode='contain' source={require('@/assets/images/symbol.png')} />
        </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  logo: {
    height: 150,
    width: 150,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  }
});