import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../utils/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Category } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentHome'>;

const { width } = Dimensions.get('window');

const CATEGORIES: {
  id: Category;
  label: string;
  icon: string;
  gradient: string[];
  count: number;
  desc: string;
}[] = [
    {
      id: 'alphabets',
      label: 'Alphabets',
      icon: '🔤',
      gradient: ['#4158D0', '#C850C0'],
      count: 26,
      desc: 'Learn A to Z with AR',
    },
    {
      id: 'numbers',
      label: 'Numbers',
      icon: '🔢',
      gradient: ['#0093E9', '#80D0C7'],
      count: 10,
      desc: 'Explore 0 to 9 in 3D',
    },
    {
      id: 'shapes',
      label: 'Shapes',
      icon: '🔷',
      gradient: ['#8EC5FC', '#E0C3FC'],
      count: 12,
      desc: 'Circle, Square and more',
    },
    {
      id: 'animals',
      label: 'Animals',
      icon: '🐾',
      gradient: ['#F093FB', '#F5576C'],
      count: 15,
      desc: 'Discover the animal world',
    },
  ];

export default function StudentHomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subGreeting}>What do you want to learn today?</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Bar */}
        <Animated.View
          style={[
            styles.statsBar,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>63+</Text>
            <Text style={styles.statLabel}>AR Objects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>360°</Text>
            <Text style={styles.statLabel}>View</Text>
          </View>
        </Animated.View>

        {/* Featured Banner */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            style={styles.banner}
            onPress={() =>
              navigation.navigate('CategoryDetail', { category: 'animals', models: [] })
            }
            activeOpacity={0.9}>
            <LinearGradient
              colors={['#F093FB', '#F5576C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerEmoji}>🐘</Text>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerBadge}>✨ FEATURED</Text>
                  <Text style={styles.bannerTitle}>Explore Animals</Text>
                  <Text style={styles.bannerSub}>
                    See real 3D animals in your room!
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Learn Categories</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat, index) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={index}
              onPress={() =>
                navigation.navigate('CategoryDetail', {
                  category: cat.id,
                  models: [],
                })
              }
            />
          ))}
        </View>

        {/* Bottom Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>How to use AR</Text>
            <Text style={styles.tipText}>
              Tap any model, then point your camera at a flat surface to see it in 3D!
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

interface CategoryCardProps {
  cat: any;
  index: number;
  onPress: () => void;
}

function CategoryCard({ cat, index, onPress }: CategoryCardProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.catCardWrapper,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        },
      ]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={cat.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.catCard}>
          <Text style={styles.catIcon}>{cat.icon}</Text>
          <Text style={styles.catLabel}>{cat.label}</Text>
          <Text style={styles.catDesc}>{cat.desc}</Text>
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{cat.count} Models</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 54, paddingBottom: 30, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 3 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  banner: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 10,
    shadowColor: '#F5576C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  bannerGradient: { borderRadius: 20 },
  bannerContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  bannerEmoji: { fontSize: 60 },
  bannerText: { flex: 1 },
  bannerBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  catCardWrapper: { width: (width - 44) / 2 },
  catCard: {
    borderRadius: 20,
    padding: 18,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  catIcon: { fontSize: 38 },
  catLabel: { fontSize: 19, fontWeight: '800', color: '#fff', marginTop: 8 },
  catDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  catBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  tipCard: {
    backgroundColor: 'rgba(155, 89, 182, 0.15)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.3)',
  },
  tipIcon: { fontSize: 24 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  tipText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
});
