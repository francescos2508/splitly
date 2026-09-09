// common style
import { colors, sp } from "@/src/constants/constants";
import { StyleSheet } from "react-native";

export const commonStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: sp[1],
        paddingTop: sp[5],
        // paddingHorizontal: sp[1]
    },
    header: {
        // backgroundColor: colors['primary'],
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: "center",
        marginBottom: sp[2],
    },
    title: {
        // color: colors['text'],
        fontSize: 20,
        fontWeight: "700",
    },
    body: {
        flex: 1,
        paddingHorizontal: sp[1]
    },
    btn: {
        width: "100%",
        paddingVertical: 14,
        alignItems: "center",
        borderRadius: 20,
        marginBottom: 12,
        backgroundColor: colors['primary'],
    },
    btnText: {
        color: colors['white'],
        fontSize: 16,
        fontWeight: "600",
    },
    btn2: {
        alignItems: "center",
        paddingVertical: 14,
    },
    btn2Text: {
        color: colors.primary,
        fontSize: 16,
    },
    inlineBtn: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 20,
        paddingVertical: sp.half,
        paddingHorizontal: sp[1],
        alignSelf: 'flex-end',
        marginTop: sp.half
    },
    inlineBtnText: {
        fontWeight: 600,
        color: colors.primary,
    },
    footer: {
        marginTop: 'auto',
        width: '100%',
        // flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        // marginBottom: sp['half'],
        marginBottom: sp['half'],
    },
    input: {
        height: 40,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.input,
        borderRadius: 20,
        paddingHorizontal: sp[1],
        marginBottom: sp[1],
        color: colors.text,
    },
})