import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getARModels, deleteARModel, deleteModelFile} from '../../services/supabase';
import {ARModel, RootStackParamList} from '../../types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'ARModels'>;

const CATEGORY_META: Record<string, {icon: string; color: string}> = {
  alphabets: {icon: '🔤', color: '#4158D0'},
  numbers: {icon: '🔢', color: '#0093E9'},
  shapes: {icon: '🔷', color: '#8EC5FC'},
  animals: {icon: '🐾', color: '#F093FB'},
};

export default function AdminARModelsScreen({navigation}: Props) {
  const [models, setModels] = useState<ARModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const data = await getARModels();
      setModels(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (model: ARModel) => {
    Alert.alert(
      'Delete AR Model',
      `Delete "${model.title}" permanently?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteARModel(model.id);
              setModels(prev => prev.filter(m => m.id !== model.id));
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
    );
  };

  const filtered = filterCat ? models.filter(m => m.category === filterCat) : models;

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All AR Models</Text>
        <Text style={styles.subtitle}>{models.length} models total</Text>
      </View>

      {/* Category Filters */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, !filterCat && styles.filterChipActive]}
          onPress={() => setFilterCat(null)}>
          <Text style={[styles.filterText, !filterCat && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {Object.entries(CATEGORY_META).map(([id, meta]) => (
          <TouchableOpacity
            key={id}
            style={[styles.filterChip, filterCat === id && styles.filterChipActive]}
            onPress={() => setFilterCat(filterCat === id ? null : id)}>
            <Text style={styles.filterChipIcon}>{meta.icon}</Text>
            <Text style={[styles.filterText, filterCat === id && styles.filterTextActive]}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E74C3C" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchModels(); }} tintColor="#E74C3C" />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No models in this category</Text>
            </View>
          }
          renderItem={({item}) => {
            const meta = CATEGORY_META[item.category] || {icon: '📦', color: '#9B59B6'};
            return (
              <View style={styles.modelCard}>
                <View style={[styles.modelIcon, {backgroundColor: meta.color + '25'}]}>
                  <Text style={{fontSize: 28}}>{meta.icon}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.modelTitle}>{item.title}</Text>
                  <Text style={styles.modelDesc} numberOfLines={1}>{item.description}</Text>
                  <View style={styles.modelMeta}>
                    <Text style={styles.metaTag}>{item.category}</Text>
                    {item.profiles?.name && (
                      <Text style={styles.metaTeacher}>👨‍🏫 {item.profiles.name}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} activeOpacity={0.7}>
                  <Text style={styles.deleteBtnIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {paddingTop: 54, paddingHorizontal: 16, paddingBottom: 16},
  backText: {color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 8},
  title: {fontSize: 26, fontWeight: '800', color: '#fff'},
  subtitle: {fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3},
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(231,76,60,0.2)',
    borderColor: '#E74C3C',
  },
  filterChipIcon: {fontSize: 14},
  filterText: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600'},
  filterTextActive: {color: '#E74C3C'},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {paddingHorizontal: 16, paddingBottom: 30, gap: 10},
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyEmoji: {fontSize: 48},
  emptyText: {fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center'},
  modelCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modelIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelTitle: {fontSize: 14, fontWeight: '700', color: '#fff'},
  modelDesc: {fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2},
  modelMeta: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5},
  metaTag: {
    fontSize: 10,
    color: '#E74C3C',
    backgroundColor: 'rgba(231,76,60,0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontWeight: '700',
  },
  metaTeacher: {fontSize: 10, color: 'rgba(255,255,255,0.4)'},
  deleteBtn: {
    backgroundColor: 'rgba(231,76,60,0.12)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.25)',
  },
  deleteBtnIcon: {fontSize: 16},
});
