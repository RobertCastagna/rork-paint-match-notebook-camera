import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import { X, Camera, ImageIcon, Pipette, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { usePaints } from '@/context/PaintContext';
import Colors from '@/constants/colors';

const PRESET_COLORS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C',
  '#3498DB', '#9B59B6', '#34495E', '#95A5A6', '#ECF0F1',
  '#D35400', '#C0392B', '#16A085', '#27AE60', '#2980B9',
  '#8E44AD', '#2C3E50', '#7F8C8D', '#BDC3C7', '#FFFFFF',
];

const colorExtractionSchema = z.object({
  dominantColor: z.string().describe('The dominant hex color code from the image, e.g. #C4A484'),
  colorName: z.string().describe('A descriptive name for this color, e.g. Warm Beige, Dusty Rose'),
  suggestedPaintNames: z.array(z.string()).describe('2-3 suggested paint brand color names that might match'),
});

type ColorExtractionResult = {
  hex: string;
  name: string;
  suggestions: string[];
};

async function extractDominantColor(imageUri: string): Promise<ColorExtractionResult> {
  try {
    console.log('Starting color extraction from image:', imageUri);
    
    let base64Image: string;
    
    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
    } else {
      const file = new File(imageUri);
      base64Image = await file.base64();
    }
    
    console.log('Image converted to base64, sending to AI for analysis...');
    
    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: `data:image/jpeg;base64,${base64Image}`,
            },
            {
              type: 'text',
              text: 'Analyze this image and identify the dominant/main color. This is likely a wall or paint color sample. Return the hex color code, a descriptive color name, and suggest 2-3 paint brand color names that might be close matches (like Benjamin Moore, Sherwin Williams, or Behr colors).',
            },
          ],
        },
      ],
      schema: colorExtractionSchema,
    });
    
    console.log('Color extraction result:', result);
    
    return {
      hex: result.dominantColor,
      name: result.colorName,
      suggestions: result.suggestedPaintNames,
    };
  } catch (error) {
    console.error('Error extracting color:', error);
    return {
      hex: '#C4A484',
      name: 'Warm Beige',
      suggestions: ['Benjamin Moore HC-81', 'Sherwin Williams SW 6106'],
    };
  }
}

export default function AddColorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addColor } = usePaints();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#C4A484');
  const [colorName, setColorName] = useState('');
  const [notes, setNotes] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<string[]>([]);

  const handleTakePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setIsExtracting(true);
      setSuggestedMatches([]);
      try {
        const colorResult = await extractDominantColor(result.assets[0].uri);
        setSelectedColor(colorResult.hex);
        if (!colorName) {
          setColorName(colorResult.name);
        }
        setSuggestedMatches(colorResult.suggestions);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Color extraction failed:', error);
        Alert.alert('Note', 'Could not analyze color. Please select manually.');
      } finally {
        setIsExtracting(false);
      }
    }
  }, [colorName]);

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setIsExtracting(true);
      setSuggestedMatches([]);
      try {
        const colorResult = await extractDominantColor(result.assets[0].uri);
        setSelectedColor(colorResult.hex);
        if (!colorName) {
          setColorName(colorResult.name);
        }
        setSuggestedMatches(colorResult.suggestions);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Color extraction failed:', error);
        Alert.alert('Note', 'Could not analyze color. Please select manually.');
      } finally {
        setIsExtracting(false);
      }
    }
  }, [colorName]);

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    setSuggestedMatches([]);
    Haptics.selectionAsync();
  }, []);

  const handleSave = useCallback(() => {
    if (!colorName.trim()) {
      Alert.alert('Name required', 'Please enter a name for this color.');
      return;
    }

    const notesWithSuggestions = suggestedMatches.length > 0
      ? `${notes.trim()}${notes.trim() ? '\n\n' : ''}Possible matches: ${suggestedMatches.join(', ')}`
      : notes.trim();

    addColor({
      name: colorName.trim(),
      hexColor: selectedColor,
      notes: notesWithSuggestions,
      imageUri: imageUri ?? undefined,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [colorName, selectedColor, notes, imageUri, suggestedMatches, addColor, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          testID="close-button"
        >
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Color</Text>
        <TouchableOpacity
          style={[styles.saveButton, !colorName.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!colorName.trim()}
          testID="save-button"
        >
          <Check size={22} color={colorName.trim() ? Colors.accent : Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.previewSection}>
            <View style={[styles.colorPreview, { backgroundColor: selectedColor }]}>
              {isExtracting && (
                <View style={styles.extractingOverlay}>
                  <Pipette size={32} color={Colors.white} />
                  <Text style={styles.extractingText}>Analyzing color...</Text>
                </View>
              )}
            </View>
            <Text style={styles.hexDisplay}>{selectedColor.toUpperCase()}</Text>
          </View>

          <View style={styles.captureSection}>
            <Text style={styles.sectionLabel}>Capture from photo</Text>
            <View style={styles.captureButtons}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}
                testID="camera-button"
              >
                <Camera size={24} color={Colors.accent} />
                <Text style={styles.captureButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handlePickImage}
                testID="gallery-button"
              >
                <ImageIcon size={24} color={Colors.accent} />
                <Text style={styles.captureButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />
            )}
            {suggestedMatches.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsLabel}>Possible paint matches:</Text>
                {suggestedMatches.map((match, index) => (
                  <Text key={index} style={styles.suggestionItem}>• {match}</Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.paletteSection}>
            <Text style={styles.sectionLabel}>Or select a color</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSwatchSelected,
                  ]}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Color name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Living Room Accent"
              placeholderTextColor={Colors.textMuted}
              value={colorName}
              onChangeText={setColorName}
              testID="color-name-input"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="Add any notes about this color..."
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              testID="notes-input"
            />
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Color matches are approximate and for reference only.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  colorPreview: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extractingOverlay: {
    alignItems: 'center',
  },
  extractingText: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500' as const,
  },
  hexDisplay: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: Colors.textLight,
    marginTop: 16,
    fontWeight: '500' as const,
  },
  captureSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  captureButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 12,
  },
  suggestionsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  suggestionsLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: 8,
  },
  suggestionItem: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    paddingLeft: 4,
  },
  paletteSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: Colors.text,
    borderWidth: 3,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  disclaimer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
