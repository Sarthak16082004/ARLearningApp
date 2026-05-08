import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroNode,
} from '@reactvision/react-viro';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {ARModel, RootStackParamList} from '../../types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type ARViewScreenProps = NativeStackScreenProps<RootStackParamList, 'ARView'>;

// ─── AR Scene Component ───────────────────────────────────────────────────────
function ARScene({
  model,
  onLoaded,
  onError,
}: {
  model: ARModel;
  onLoaded: () => void;
  onError: (e: any) => void;
}) {
  const [scale, setScale] = useState<[number, number, number]>([0.2, 0.2, 0.2]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [position, setPosition] = useState<[number, number, number]>([0, -0.5, -1.5]);

  const baseRotation = useRef<number>(0);
  const baseScale = useRef<[number, number, number]>([0.2, 0.2, 0.2]);

  const onPinch = (pinchState: any, scaleFactor: number, source: any) => {
    if (pinchState === 1) {
      baseScale.current = [...scale];
    } else if (pinchState === 2 || pinchState === 3) {
      const newScale = baseScale.current[0] * scaleFactor;
      setScale([newScale, newScale, newScale]);
    }
  };

  const onRotate = (rotateState: any, rotationFactor: number, source: any) => {
    if (rotateState === 1) {
      baseRotation.current = rotation[1];
    } else if (rotateState === 2 || rotateState === 3) {
      setRotation([rotation[0], baseRotation.current + rotationFactor, rotation[2]]);
    }
  };

  return (
    <ViroARScene>
      {/* Lighting is REQUIRED for .glb models to be visible */}
      <ViroAmbientLight color="#FFFFFF" intensity={1000} />
      <ViroDirectionalLight color="#FFFFFF" direction={[0, -1, -0.2]} shadowOrthographicPosition={[0, 3, -5]} shadowOrthographicSize={10} shadowNearZ={2} shadowFarZ={9} castsShadow={true} />

      <ViroNode 
        position={position} 
        scale={scale} 
        rotation={rotation}
        dragType="FixedDistance"
        onDrag={(dragToPos) => setPosition([dragToPos[0], dragToPos[1], dragToPos[2]])}
        onPinch={onPinch}
        onRotate={onRotate}
      >
        <Viro3DObject
          source={{uri: model.model_url}}
          position={[0, 0, 0]}
          scale={[1, 1, 1]}
          type="GLB"
          onLoadEnd={onLoaded}
          onError={onError}
        />
      </ViroNode>
    </ViroARScene>
  );
}

// ─── Main ARView Screen ───────────────────────────────────────────────────────
export default function ARViewScreen({route, navigation}: ARViewScreenProps) {
  const {model}: {model: ARModel} = route.params;

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [arReady, setArReady] = useState(false); 
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Request camera permission BEFORE mounting Viro
    const requestPermission = async () => {
      try {
        const permission = Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;
        const result = await request(permission);
        if (result === RESULTS.GRANTED) {
          setHasPermission(true);
          setTimeout(() => setArReady(true), 500);
        } else {
          setHasPermission(false);
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in your phone settings to use AR.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
      } catch (error) {
        setHasPermission(false);
      }
    };

    requestPermission();
  }, []);

  const handleLoaded = () => {
    setIsLoaded(true);
  };

  const handleError = (e: any) => {
    console.error('AR Object Error:', e);
    setHasError(true);
    Alert.alert(
      'Model Error',
      'Could not load the 3D model. Make sure the file is a valid .glb format.',
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {arReady ? (
          <ViroARSceneNavigator
            initialScene={{
              scene: () => (
                <ARScene
                  model={model}
                  onLoaded={handleLoaded}
                  onError={handleError}
                />
              ),
            }}
            style={styles.arView}
          />
      ) : (
        <View style={styles.permissionPlaceholder}>
          <ActivityIndicator color="#9B59B6" size="large" />
          <Text style={styles.permissionText}>
            {hasPermission === false ? 'Camera access denied' : 'Starting AR...'}
          </Text>
        </View>
      )}

      {/* Loading Overlay */}
      {!isLoaded && !hasError && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#9B59B6" />
            <Text style={styles.loadingTitle}>Loading {model.title}</Text>
            <Text style={styles.loadingHint}>
              Point camera at a flat surface to place the model
            </Text>
          </View>
        </View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.topBtnText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.modelInfo}>
          <Text style={styles.modelName}>{model.title}</Text>
          {isLoaded && (
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AR LIVE</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.topBtn, showInfo && {backgroundColor: '#9B59B6'}]}
          onPress={() => setShowInfo(!showInfo)}>
          <Text style={styles.topBtnText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* Info Sheet */}
      {showInfo && (
        <View style={styles.infoSheet}>
          <View style={styles.infoHandle} />
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>📖</Text>
            <View>
              <Text style={styles.infoTitle}>{model.title}</Text>
              <Text style={styles.infoCategory}>{model.category.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.infoDescription}>{model.description}</Text>
          <TouchableOpacity 
            style={styles.infoClose} 
            onPress={() => setShowInfo(false)}>
            <Text style={styles.infoCloseText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Placement Guide */}
      {!isLoaded && !hasError && (
        <View style={styles.placementGuide} pointerEvents="none">
          <Text style={styles.placementText}>
            🎯 Point at a flat surface to place
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  arView: {flex: 1},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  loadingCard: {
    backgroundColor: 'rgba(20,15,40,0.9)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(155,89,182,0.4)',
  },
  loadingTitle: {color: '#fff', fontSize: 16, fontWeight: '700'},
  loadingHint: {color: 'rgba(255,255,255,0.55)', fontSize: 12, textAlign: 'center'},
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  topBtnText: {color: '#fff', fontSize: 16},
  modelInfo: {backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'},
  modelName: {color: '#fff', fontSize: 14, fontWeight: '700'},
  liveTag: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2},
  liveDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#2ECC71'},
  liveText: {color: '#2ECC71', fontSize: 10, fontWeight: '800', letterSpacing: 1},
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', width: 60},
  controlBtnsRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  ctrlBtn: {
    backgroundColor: 'rgba(155,89,182,0.4)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155,89,182,0.6)',
  },
  ctrlBtnText: {color: '#fff', fontSize: 20, fontWeight: '700'},
  ctrlValue: {color: '#fff', fontSize: 14, fontWeight: '700', width: 50, textAlign: 'center'},
  dragHint: {color: 'rgba(255,255,255,0.45)', fontSize: 11, textAlign: 'center'},
  placementGuide: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  placementText: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: '#fff',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  infoSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 15, 40, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.3)',
  },
  infoHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  infoEmoji: {fontSize: 40},
  infoTitle: {color: '#fff', fontSize: 22, fontWeight: '800'},
  infoCategory: {color: '#9B59B6', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 2},
  infoDescription: {color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22, marginBottom: 24},
  infoClose: {
    backgroundColor: '#9B59B6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  infoCloseText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  permissionPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0C29',
    gap: 16,
  },
  permissionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
});
