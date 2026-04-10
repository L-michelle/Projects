import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
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

  let response;
  try {
    response = await axios.post(VISION_URL, {
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        },
      ],
    });
  } catch (err: any) {
    const status = err?.response?.status;
    const message = err?.response?.data?.error?.message ?? err?.message;
    if (status === 400) {
      throw new Error(`API error 400: ${message}\n\nCheck that your API key is correct and the Cloud Vision API is enabled in Google Cloud Console.`);
    } else if (status === 403) {
      throw new Error(`API error 403: ${message}\n\nYour API key may be restricted or billing may not be set up in Google Cloud Console.`);
    } else {
      throw new Error(`API error ${status ?? 'unknown'}: ${message}`);
    }
  }

  const fullText: string | undefined =
    response.data?.responses?.[0]?.fullTextAnnotation?.text;

  if (!fullText) {
    throw new Error('No text found in the receipt image. Try a clearer photo.');
  }

  return fullText;
}
