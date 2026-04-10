import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const API_KEY: string = Constants.expoConfig?.extra?.visionApiKey ?? '';
const VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

export async function analyzeReceipt(imageUri: string): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      'Google Cloud Vision API key is not configured. Set GOOGLE_CLOUD_VISION_API_KEY in your environment.'
    );
  }

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  const response = await axios.post(VISION_URL, {
    requests: [
      {
        image: { content: base64 },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
      },
    ],
  });

  const fullText: string | undefined =
    response.data?.responses?.[0]?.fullTextAnnotation?.text;

  if (!fullText) {
    throw new Error('No text found in the receipt image. Try a clearer photo.');
  }

  return fullText;
}
