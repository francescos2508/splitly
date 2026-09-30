import { sp } from '@/src/constants/constants';
import { useTheme } from "@/src/context/ThemeContext";
import { router } from "expo-router";
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(15)).current;


  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 2,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      // Pause
      // Animated.delay(200),

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.body}>

        <Animated.Image
          source={require('@/assets/images/logo.png')}
          style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
          resizeMode='contain'
        />
        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <Text style={styles.welcome}>
            Split. Share. Done.
            {/* Less math. More moments.{'\n'}
            Because nobody likes doing the math. */}
          </Text>
          <Pressable style={styles.btn} onPress={() => router.push('/groups')}>
            <Text style={styles.btnText}>Get started</Text>
          </Pressable>
          <Text style={styles.label}>No account required</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({  
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    // fontWeight: 700,
    marginBottom: sp[2],
    fontStyle: 'italic',
    color: colors.text,
  },
  body: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: sp[1],
    width: "100%",
  },
  btn: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: colors.primary,
  },
  btnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  logo: {
     width: 210,
    height: 140,
    marginBottom: sp[1],
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  }
})