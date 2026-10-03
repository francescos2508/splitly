import { sp } from '@/src/constants/constants';
import { useTheme } from '@/src/context/ThemeContext';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/*   
    options: [
        {label: 'text', onPress: () => function(), selected: boolean}
    ]
*/

export default function OptionSelector({ options }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.selectorCont}>
            {options.map((option) => {
                return (
                    <Pressable style={[styles.selectorBtn, { backgroundColor: option.selected ? colors.primaryDark : 'transparent' }]} onPress={option.onPress} key={option.label}>
                        <Text style={styles.selectorText}>{option.label}</Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

const createStyles = (colors) => StyleSheet.create({
    selectorCont: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderRadius: 20,
        
    },
    selectorBtn: {
        paddingVertical: sp.md,
        borderRadius: 20,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectorText: {
        color: colors.textLight,
        textTransform: 'uppercase',
        flexShrink: 1,
    }
}) 