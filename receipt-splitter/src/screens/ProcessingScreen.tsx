import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { analyzeReceipt } from '../services/visionApi';
import { parseReceiptText } from '../utils/receiptParser';

type Props = NativeStackScreenProps<RootStackParamList, 'Processing'>;

export default function ProcessingScreen({ navigation, route }: Props) {
  const { imageUri, people } = route.params;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const rawText = await analyzeReceipt(imageUri);
        const items = parseReceiptText(rawText);

        if (cancelled) return;

        if (items.length === 0) {
          Alert.alert(
            'No Items Found',
            'Could not detect any line items. Check the photo is clear and try again.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }

        navigation.replace('ReviewItems', { imageUri, items, people });
      } catch (err: any) {
        if (cancelled) return;
        Alert.alert(
          'Could Not Read Receipt',
          err?.message ?? 'An unexpected error occurred. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#009688" />
      <Text style={styles.label}>Reading your receipt...</Text>
      <Text style={styles.sub}>This usually takes a few seconds.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  label: { marginTop: 20, fontSize: 18, fontWeight: '600', color: '#222' },
  sub: { marginTop: 8, fontSize: 13, color: '#888' },
});
