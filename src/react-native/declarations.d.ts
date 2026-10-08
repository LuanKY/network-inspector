declare module "@expo/vector-icons" {
    export const FontAwesome5: any;
    export const MaterialCommunityIcons: any;
    export const Ionicons: any;
    export const Feather: any;
}

declare module "expo-clipboard" {
    export function setStringAsync(text: string): Promise<boolean>;
}

declare module "react-native-safe-area-context" {
    export function useSafeAreaInsets(): {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
