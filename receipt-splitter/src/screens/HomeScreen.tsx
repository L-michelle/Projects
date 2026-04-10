import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Person } from '../types';
import PersonChip from '../components/PersonChip';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

let personCounter = 0;

export default function HomeScreen({ navigation }: Props) {
  const [people, setPeople] = useState<Person[]>([]);
  const [nameInput, setNameInput] = useState('');

  function addPerson() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    personCounter++;
    setPeople((prev) => [...prev, { id: `p${personCounter}`, name: trimmed }]);
    setNameInput('');
  }

  function removePerson(id: string) {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  }

  async function pickPhoto(fromCamera: boolean) {
    if (people.length === 0) {
      Alert.alert('Add People First', 'Add at least one person before scanning the receipt.');
      return;
    }

    const { status } = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        fromCamera
          ? 'Camera permission is needed to take a photo.'
          : 'Media library permission is needed to select a photo.'
      );
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8 });

    if (!result.canceled && result.assets[0]) {
      navigation.navigate('Processing', {
        imageUri: result.assets[0].uri,
        people,
      });
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Who's at the table?</Text>
      <Text style={styles.hint}>Add each person's name, then scan the receipt.</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={nameInput}
          onChangeText={setNameInput}
          placeholder="Name (e.g. Alex)"
          placeholderTextColor="#aaa"
          returnKeyType="done"
          onSubmitEditing={addPerson}
        />
        <TouchableOpacity
          style={[styles.addBtn, !nameInput.trim() && styles.addBtnDisabled]}
          onPress={addPerson}
          disabled={!nameInput.trim()}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {people.length > 0 && (
        <View style={styles.chipsContainer}>
          {people.map((p) => (
            <PersonChip
              key={p.id}
              name={p.name}
              selected={false}
              onPress={() => {}}
              onRemove={() => removePerson(p.id)}
            />
          ))}
        </View>
      )}

      <View style={styles.spacer} />

      <Text style={styles.sectionTitle}>Scan your receipt</Text>
      <Text style={[styles.hint, people.length === 0 && styles.hintDisabled]}>
        {people.length === 0
          ? 'Add at least one person above first.'
          : 'Take a photo or choose one from your gallery.'}
      </Text>

      <TouchableOpacity
        style={[styles.photoBtn, styles.photoBtnPrimary, people.length === 0 && styles.photoBtnDisabled]}
        onPress={() => pickPhoto(true)}
        disabled={people.length === 0}
      >
        <Text style={styles.photoBtnText}>📷  Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.photoBtn, styles.photoBtnSecondary, people.length === 0 && styles.photoBtnDisabled]}
        onPress={() => pickPhoto(false)}
        disabled={people.length === 0}
      >
        <Text style={[styles.photoBtnText, styles.photoBtnTextSecondary]}>🖼  Upload from Gallery</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 4 },
  hint: { fontSize: 13, color: '#666', marginBottom: 14 },
  hintDisabled: { color: '#bbb' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: '#009688',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addBtnDisabled: { backgroundColor: '#b2dfdb' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  spacer: { height: 28 },
  photoBtn: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  photoBtnPrimary: { backgroundColor: '#009688' },
  photoBtnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#009688',
  },
  photoBtnDisabled: { opacity: 0.4 },
  photoBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  photoBtnTextSecondary: { color: '#009688' },
});
