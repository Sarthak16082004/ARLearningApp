import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

type Props = {
    html: string;
};

/**
 * Renders a self-contained WebGL/Canvas 3D scene as a transparent overlay
 * on top of the camera feed using react-native-webview.
 */
export default function ARScene3D({ html }: Props) {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <WebView
                source={{ html }}
                style={styles.webview}
                scrollEnabled={false}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                androidLayerType="software"
                originWhitelist={['*']}
                javaScriptEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
