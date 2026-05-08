import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getARModels} from '../../services/supabase';
import {ARModel, RootStackParamList} from '../../types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryDetail'>;

const CATEGORY_META: Record<string, {icon: string; gradient: string[]}> = {
  alphabets: {icon: '🔤', gradient: ['#4158D0', '#C850C0']},
  numbers: {icon: '🔢', gradient: ['#0093E9', '#80D0C7']},
  shapes: {icon: '🔷', gradient: ['#8EC5FC', '#E0C3FC']},
  animals: {icon: '🐾', gradient: ['#F093FB', '#F5576C']},
};

export default function CategoryDetailScreen({route, navigation}: Props) {
  const {category} = route.params;
  const [models, setModels] = useState<ARModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModels, setFilteredModels] = useState<ARModel[]>([]);
  
  const meta = CATEGORY_META[category] || {icon: '📦', gradient: ['#667eea', '#764ba2']};

  useEffect(() => {
    fetchModels();
  }, [category]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredModels(models);
    } else {
      const filtered = models.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredModels(filtered);
    }
  }, [searchQuery, models]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getARModels(category);
      const fetched = data || [];
      setModels(fetched);
      setFilteredModels(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleARView = (model: ARModel) => {
    navigation.navigate('ARView', {model});
  };

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient
        colors={meta.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerEmoji}>{meta.icon}</Text>
            <Text style={styles.headerTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>
          <View style={styles.headerCountBadge}>
            <Text style={styles.headerCountText}>{models.length} Models</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search in ${category}...`}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9B59B6" />
          <Text style={styles.loadingText}>Loading AR models...</Text>
        </View>
      ) : filteredModels.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>{searchQuery ? '😕' : '🔍'}</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No Results' : 'No Models Yet'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? `We couldn't find any models matching "${searchQuery}"`
              : "Your teacher hasn't uploaded any AR models for this category yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredModels}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{gap: 12}}
          renderItem={({item}) => (
            <ModelCard model={item} gradient={meta.gradient} onPress={handleARView} />
          )}
        />
      )}
    </LinearGradient>
  );
}

function ModelCard({
  model,
  gradient,
  onPress,
}: {
  model: ARModel;
  gradient: string[];
  onPress: (m: ARModel) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.modelCard}
      onPress={() => onPress(model)}
      activeOpacity={0.85}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)']}
        style={styles.cardInner}>
        {model.thumbnail_url ? (
          <Image
            source={{uri: model.thumbnail_url}}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient colors={gradient} style={styles.thumbnailPlaceholder}>
            <Text style={{fontSize: 36}}>📦</Text>
          </LinearGradient>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.modelTitle} numberOfLines={1}>
            {model.title}
          </Text>
          <Text style={styles.modelSub} numberOfLines={2}>
            {model.description}
          </Text>
          {model.profiles?.name && (
            <Text style={styles.teacherName}>👨‍🏫 {model.profiles.name}</Text>
          )}
          <TouchableOpacity
            style={styles.arBtn}
            onPress={() => onPress(model)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={gradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.arBtnGradient}>
              <Text style={styles.arBtnText}>View in AR 🔮</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backBtn: {marginBottom: 12},
  backText: {color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600'},
  headerTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20},
  headerCountBadge: {backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  headerCountText: {color: '#fff', fontSize: 11, fontWeight: '700'},
  searchContainer: {flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'},
  searchIcon: {fontSize: 14, marginRight: 8},
  searchInput: {flex: 1, color: '#fff', fontSize: 14, paddingVertical: 10},
  searchClear: {fontSize: 14, color: 'rgba(255,255,255,0.4)', padding: 4},
  headerEmoji: {fontSize: 44, marginBottom: 2},
  headerTitle: {fontSize: 28, fontWeight: '800', color: '#fff'},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30},
  loadingText: {color: 'rgba(255,255,255,0.6)', marginTop: 12},
  emptyEmoji: {fontSize: 56, marginBottom: 12},
  emptyTitle: {fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8},
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {padding: 16, gap: 12},
  modelCard: {flex: 1, borderRadius: 18, overflow: 'hidden'},
  cardInner: {borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)'},
  thumbnail: {width: '100%', height: 120, borderRadius: 14, borderBottomLeftRadius: 0, borderBottomRightRadius: 0},
  thumbnailPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardContent: {padding: 12},
  modelTitle: {fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4},
  modelSub: {fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 6, lineHeight: 16},
  teacherName: {fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 10},
  arBtn: {borderRadius: 10, overflow: 'hidden'},
  arBtnGradient: {paddingVertical: 8, alignItems: 'center'},
  arBtnText: {color: '#fff', fontSize: 12, fontWeight: '700'},
});
