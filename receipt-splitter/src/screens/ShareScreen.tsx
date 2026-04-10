import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert, Image } from 'react-native';
import * as Sharing from 'expo-sharing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { formatSplit } from '../utils/shareFormatter';

type Props = NativeStackScreenProps<RootStackParamList, 'Share'>;

export default function ShareScreen({ route }: Props) {
  const { summary, splits } = route.params;
  const shareText = formatSplit(splits, summary);

  useEffect(() => {
    shareBreakdown();
  }, []);

  async function shareBreakdown() {
    try {
      await Share.share({ message: shareText });
    } catch {
      // User dismissed or error — silently ignore, fallback button is available
    }
  }

  async function sharePhoto() {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing Not Available', 'File sharing is not supported on this device.');
      return;
    }
    try {
      await Sharing.shareAsync(summary.imageUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Receipt Photo',
      });
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not share the photo.');
    }
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: summary.imageUri }} style={styles.thumb} resizeMode="cover" />

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Breakdown Preview</Text>
        <Text style={styles.previewText} numberOfLines={20}>
          {shareText}
        </Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={shareBreakdown}>
        <Text style={styles.btnText}>💬  Share Text Breakdown</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={sharePhoto}>
        <Text style={[styles.btnText, styles.btnTextSecondary]}>🖼  Share Receipt Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  thumb: { width: '100%', height: 140, borderRadius: 10, marginBottom: 14 },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  previewLabel: { fontSize: 11, fontWeight: '700', color: '#009688', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  previewText: { fontSize: 12, color: '#444', lineHeight: 18, fontFamily: 'monospace' },
  btn: {
    backgroundColor: '#009688',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#009688',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnTextSecondary: { color: '#009688' },
});
