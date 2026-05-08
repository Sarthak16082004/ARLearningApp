import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const {width, height} = Dimensions.get('window');

export default function SplashScreen({navigation}: Props) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, {toValue: 1, duration: 2000, useNativeDriver: true}),
        Animated.timing(orbAnim, {toValue: 0, duration: 2000, useNativeDriver: true}),
      ]),
    ).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const orbTranslate = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <LinearGradient
      colors={['#0F0C29', '#302B63', '#24243E']}
      style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Decorative orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {transform: [{translateY: orbTranslate}]},
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {transform: [{translateY: orbTranslate}]},
        ]}
      />

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{scale: logoScale}],
              opacity: logoOpacity,
            },
          ]}>
          <LinearGradient
            colors={['#9B59B6', '#6C3483']}
            style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🔮</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{opacity: textOpacity}}>
          <Text style={styles.title}>AR Learn</Text>
          <Text style={styles.subtitle}>
            Learning Through Augmented Reality
          </Text>
        </Animated.View>

        <Animated.View style={[styles.dotsRow, {opacity: textOpacity}]}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </Animated.View>
      </View>

      <Animated.Text style={[styles.footer, {opacity: textOpacity}]}>
        Empowering Education with AR
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  center: {alignItems: 'center', gap: 16},
  orb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.25,
  },
  orb1: {
    width: 300,
    height: 300,
    top: -80,
    left: -100,
    backgroundColor: '#9B59B6',
  },
  orb2: {
    width: 250,
    height: 250,
    bottom: 50,
    right: -80,
    backgroundColor: '#3498DB',
  },
  logoContainer: {marginBottom: 8},
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#9B59B6',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  logoIcon: {fontSize: 56},
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#9B59B6',
    width: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});
