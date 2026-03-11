import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import {
    ViroARScene,
    ViroARSceneNavigator,
    Viro3DObject,
    ViroAmbientLight,
    ViroSpotLight,
    ViroNode,
} from '@reactvision/react-viro';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ARObject = {
    id: string;
    name: string;
    category: string;
    modelUrl: string;
    modelType?: 'GLB' | 'GLTF' | 'OBJ';
};

type Props = {
    object: ARObject;
    onBack: () => void;
};

/**
 * The AR Scene component that ViroARSceneNavigator will render.
 */
const MainARScene = (props: any) => {
    const { object, onModelLoadStart, onModelLoadEnd, onModelError } = props.sceneNavigator.viroAppProps;

    return (
        <ViroARScene>
            <ViroAmbientLight color="#ffffff" intensity={500} />
            <ViroSpotLight
                innerAngle={5}
                outerAngle={45}
                direction={[0, -1, -0.2]}
                position={[0, 3, 0]}
                color="#ffffff"
                castsShadow={true}
                influenceDistance={20}
                shadowMapSize={2048}
                shadowNearZ={2}
                shadowFarZ={5}
                opacity={0.7}
            />

            <ViroNode
                position={[0, -0.5, -1]}
                dragType="FixedToWorld"
                onDrag={() => { }} // Enables drag/repositioning
            >
                <Viro3DObject
                    source={{ uri: object.modelUrl }}
                    type={object.modelType || 'GLB'}
                    scale={[0.1, 0.1, 0.1]} // Default scale, can be adjusted
                    onLoadStart={onModelLoadStart}
                    onLoadEnd={onModelLoadEnd}
                    onError={onModelError}
                />
            </ViroNode>
        </ViroARScene>
    );
};

export default function ARViewScreen({ object, onBack }: Props) {
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const onModelLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    const onModelLoadEnd = () => {
        setLoading(false);
    };

    const onModelError = (event: any) => {
        setLoading(false);
        setError("Failed to load 3D model. Please check your connection.");
        console.error("Viro Error:", event.nativeEvent.error);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Viro AR Navigator */}
            <ViroARSceneNavigator
                initialScene={{
                    scene: MainARScene,
                }}
                viroAppProps={{
                    object,
                    onModelLoadStart,
                    onModelLoadEnd,
                    onModelError,
                }}
                style={styles.arView}
            />

            {/* HUD Overlays */}
            <View style={[styles.hud, { top: insets.top + 10 }]}>
                <TouchableOpacity
                    onPress={() => onBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.objectBadge}>
                    <Text style={styles.categoryText}>{object.category.toUpperCase()}</Text>
                    <Text style={styles.nameText}>{object.name}</Text>
                </View>
            </View>

            {/* Loading Indicator */}
            {loading && !error && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#6c63ff" />
                    <Text style={styles.loadingText}>Downloading {object.name}...</Text>
                </View>
            )}

            {/* Error Message */}
            {error && (
                <View style={styles.errorOverlay}>
                    <View style={styles.errorCard}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorTitle}>Model Error</Text>
                        <Text style={styles.errorSub}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryBtn}
                            onPress={() => onBack()}
                        >
                            <Text style={styles.retryBtnText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Interaction Hint */}
            {!loading && !error && (
                <View style={styles.hintBar}>
                    <Text style={styles.hintText}>Tap and drag to move the model</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    arView: {
        flex: 1,
    },
    hud: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    objectBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.4)',
        alignItems: 'flex-end',
    },
    categoryText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    nameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,101,132,0.3)',
        gap: 12,
    },
    errorIcon: {
        fontSize: 48,
    },
    errorTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    errorSub: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryBtn: {
        marginTop: 10,
        backgroundColor: '#ff6584',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    hintBar: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    hintText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '500',
    },
});
