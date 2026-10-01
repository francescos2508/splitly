import { useTheme } from '@/src/context/ThemeContext';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

const AdaptiveSheet = forwardRef(({ children, snapPoints = ['40%']}, ref) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const bottomSheetRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        present: () => {
            if (Platform.OS === 'web') {
                setVisible(true);
            } else {
                bottomSheetRef.current?.present();
            }
        },
        dismiss: () => {
            if (Platform.OS === 'web') {
                setVisible(false);
            } else {
                bottomSheetRef.current?.dismiss();
            }
        },
    }));

    const handleClose = () => {
        if (Platform.OS === 'web') {
            setVisible(false);
        } else {
            bottomSheetRef.current?.dismiss();
        }
    };

    if (Platform.OS === 'web') {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
            >
                <View style={styles.overlay}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={handleClose}
                    />

                    <View style={styles.modal}>
                        {children}
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose
            keyboardBehavior='fillParent'
            keyboardBlurBehavior='restore'
            enableDynamicSizing={false}
            backgroundStyle={{ backgroundColor: colors.surface }}
            android_keyboardInputMode="adjustResize"
            backdropComponent={(props) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    pressBehavior="close"
                />
            )}
        >
            <BottomSheetView style={styles.content}>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default AdaptiveSheet;

const createStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        minHeight: 200,
    },
    content: {
        flex: 1,
        padding: 20,
    },
});