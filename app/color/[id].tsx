import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Trash2, Check, Edit3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { usePaints } from '@/context/PaintContext';
import Colors from '@/constants/colors';

export default function ColorDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getColorById, updateColor, deleteColor } = usePaints();

  const color = getColorById(id ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (color) {
      setEditName(color.name);
      setEditNotes(color.notes);
    }
  }, [color]);

  const handleSaveEdit = useCallback(() => {
    if (!editName.trim()) {
      Alert.alert('Name required', 'Please enter a name for this color.');
      return;
    }

    if (id) {
      updateColor(id, {
        name: editName.trim(),
        notes: editNotes.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditing(false);
    }
  }, [id, editName, editNotes, updateColor]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Color',
      'Are you sure you want to delete this color from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (id) {
              deleteColor(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              router.back();
            }
          },
        },
      ]
    );
  }, [id, deleteColor, router]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!color) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Color not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isEditing ? 'Edit Color' : color.name}
        </Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveEdit}
            testID="save-edit-button"
          >
            <Check size={22} color={Colors.accent} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsEditing(true)}
            testID="edit-button"
          >
            <Edit3 size={22} color={Colors.text} />
          </TouchableOpacity>
        )}
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
          <View style={styles.colorDisplaySection}>
            <View style={[styles.largeColorSwatch, { backgroundColor: color.hexColor }]} />
            <Text style={styles.hexCode}>{color.hexColor.toUpperCase()}</Text>
          </View>

          {color.imageUri && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionLabel}>Source Image</Text>
              <Image source={{ uri: color.imageUri }} style={styles.sourceImage} />
            </View>
          )}

          <View style={styles.detailsSection}>
            {isEditing ? (
              <>
                <Text style={styles.sectionLabel}>Color Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Color name"
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={[styles.sectionLabel, styles.marginTop]}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add notes..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                />
              </>
            ) : (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>{color.name}</Text>
                </View>

                {color.notes ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Notes</Text>
                    <Text style={styles.detailValue}>{color.notes}</Text>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Added</Text>
                  <Text style={styles.detailValue}>{formatDate(color.createdAt)}</Text>
                </View>

                {color.updatedAt !== color.createdAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Updated</Text>
                    <Text style={styles.detailValue}>{formatDate(color.updatedAt)}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This color match is approximate and for personal reference only.
            </Text>
          </View>

          {!isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              testID="delete-button"
            >
              <Trash2 size={20} color={Colors.error} />
              <Text style={styles.deleteButtonText}>Delete Color</Text>
            </TouchableOpacity>
          )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  colorDisplaySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  largeColorSwatch: {
    width: 180,
    height: 180,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  hexCode: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: Colors.textLight,
    marginTop: 20,
    fontWeight: '600' as const,
  },
  imageSection: {
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
  sourceImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  detailsSection: {
    paddingHorizontal: 20,
  },
  detailRow: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  marginTop: {
    marginTop: 16,
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
    marginTop: 24,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.error,
  },
});
