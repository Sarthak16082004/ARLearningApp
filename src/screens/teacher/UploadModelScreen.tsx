import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {decode} from 'base64-arraybuffer';
import {useAuth} from '../../utils/AuthContext';
import {createARModel, uploadModelFile} from '../../services/supabase';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'UploadModel'>;

const CATEGORIES = [
  {id: 'alphabets', label: 'Alphabets', icon: '🔤'},
  {id: 'numbers', label: 'Numbers', icon: '🔢'},
  {id: 'shapes', label: 'Shapes', icon: '🔷'},
  {id: 'animals', label: 'Animals', icon: '🐾'},
];

export default function UploadModelScreen({navigation}: Props) {
  const {user} = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('alphabets');
  const [subcategory, setSubcategory] = useState('');
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.allFiles,
        copyTo: 'cachesDirectory',
      });
      if (!result.name?.endsWith('.glb') && !result.name?.endsWith('.gltf')) {
        Alert.alert(
          'Invalid File',
          'Please select a .glb or .gltf 3D model file.',
        );
        return;
      }
      setFile(result);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the model.');
      return;
    }
    if (!file) {
      Alert.alert('No File', 'Please select a .glb model file.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    try {
      // Read file content
      const filePath = file.fileCopyUri || file.uri;
      const fileContent = await RNFS.readFile(filePath, 'base64');
      const arrayBuffer = decode(fileContent);

      setUploadProgress(40);

      // Upload to Supabase storage
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${user.id}/${Date.now()}_${safeFileName}`;
      const modelUrl = await uploadModelFile(
        storagePath,
        arrayBuffer,
        'model/gltf-binary',
      );

      setUploadProgress(80);

      // Create DB record
      await createARModel({
        title: title.trim(),
        description: description.trim(),
        category,
        subcategory: subcategory.trim() || undefined,
        model_url: modelUrl,
        teacher_id: user.id,
      });

      setUploadProgress(100);

      Alert.alert(
        '🎉 Upload Successful!',
        `"${title}" has been uploaded and is now available for students.`,
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert('Upload Failed', err.message || 'Something went wrong.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Upload AR Model</Text>
          <Text style={styles.pageSubtitle}>
            Share 3D models with your students
          </Text>
        </View>

        {/* Category Selector */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catBtn,
                category === cat.id && styles.catBtnActive,
              ]}
              onPress={() => setCategory(cat.id)}
              activeOpacity={0.8}>
              <Text style={styles.catBtnIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.catBtnLabel,
                  category === cat.id && styles.catBtnLabelActive,
                ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <Text style={styles.sectionLabel}>Model Title *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Letter A, Number 5, Elephant..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Subcategory */}
        <Text style={styles.sectionLabel}>Subcategory (optional)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g. A, B, C or 1, 2, 3..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={subcategory}
            onChangeText={setSubcategory}
          />
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>Description</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what students will see in AR..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* File Picker */}
        <Text style={styles.sectionLabel}>3D Model File (.glb / .gltf)</Text>
        <TouchableOpacity
          style={[styles.filePicker, file && styles.filePickerSelected]}
          onPress={pickFile}
          activeOpacity={0.8}>
          {file ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileIcon}>✅</Text>
              <View style={{flex: 1}}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileSize}>
                  {((file.size || 0) / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFile(null)}>
                <Text style={styles.fileRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fileEmpty}>
              <Text style={styles.fileEmptyIcon}>📁</Text>
              <Text style={styles.fileEmptyText}>Tap to select .glb file</Text>
              <Text style={styles.fileEmptyHint}>
                Supported: .glb, .gltf
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Progress */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#27AE60', '#1E8449']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.progressFill, {width: `${uploadProgress}%`}]}
              />
            </View>
            <Text style={styles.progressText}>
              Uploading... {uploadProgress}%
            </Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={handleUpload}
          disabled={uploading}
          activeOpacity={0.85}>
          <LinearGradient
            colors={['#27AE60', '#1A8040']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.uploadBtnGradient}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.uploadBtnIcon}>☁️</Text>
                <Text style={styles.uploadBtnText}>Upload to AR Library</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📌 Tips for best results</Text>
          {[
            'Use .glb format (binary glTF) for compatibility',
            'Keep file size under 20 MB for faster loading',
            'Ensure the model is centered at origin (0,0,0)',
            'Test your model before uploading',
          ].map((tip, i) => (
            <Text key={i} style={styles.tipItem}>
              • {tip}
            </Text>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {paddingTop: 54, paddingHorizontal: 20, paddingBottom: 40},
  header: {marginBottom: 24},
  backText: {color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 12},
  pageTitle: {fontSize: 28, fontWeight: '800', color: '#fff'},
  pageSubtitle: {fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4},
  sectionLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  categoryRow: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  catBtnActive: {
    backgroundColor: 'rgba(39,174,96,0.2)',
    borderColor: '#27AE60',
  },
  catBtnIcon: {fontSize: 18},
  catBtnLabel: {fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600'},
  catBtnLabelActive: {color: '#27AE60'},
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
  },
  textAreaContainer: {paddingVertical: 4},
  input: {color: '#fff', fontSize: 15, paddingVertical: 14},
  textArea: {height: 90, paddingTop: 14},
  filePicker: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    borderStyle: 'dashed',
    padding: 20,
  },
  filePickerSelected: {
    borderColor: '#27AE60',
    backgroundColor: 'rgba(39,174,96,0.08)',
    borderStyle: 'solid',
  },
  fileInfo: {flexDirection: 'row', alignItems: 'center', gap: 12},
  fileIcon: {fontSize: 24},
  fileName: {color: '#fff', fontSize: 14, fontWeight: '600'},
  fileSize: {color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2},
  fileRemove: {color: '#E74C3C', fontSize: 18, paddingHorizontal: 8},
  fileEmpty: {alignItems: 'center', gap: 8},
  fileEmptyIcon: {fontSize: 36},
  fileEmptyText: {color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600'},
  fileEmptyHint: {color: 'rgba(255,255,255,0.4)', fontSize: 12},
  progressContainer: {marginTop: 16, gap: 8},
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {height: '100%', borderRadius: 3},
  progressText: {color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center'},
  uploadBtn: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#27AE60',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  uploadBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  uploadBtnIcon: {fontSize: 20},
  uploadBtnText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  tipsCard: {
    marginTop: 24,
    backgroundColor: 'rgba(39,174,96,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(39,174,96,0.25)',
    gap: 8,
  },
  tipsTitle: {fontSize: 13, fontWeight: '700', color: '#27AE60'},
  tipItem: {fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 18},
});
