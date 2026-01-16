import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Droplets } from 'lucide-react-native';
import { usePaints } from '@/context/PaintContext';
import Colors from '@/constants/colors';
import { PaintColor } from '@/types/paint';

function ColorCard({ item, onPress }: { item: PaintColor; onPress: () => void }) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={`color-card-${item.id}`}
      >
        <View style={[styles.colorSwatch, { backgroundColor: item.hexColor }]} />
        <View style={styles.cardContent}>
          <Text style={styles.colorName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.hexValue}>{item.hexColor.toUpperCase()}</Text>
          {item.notes ? (
            <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Droplets size={48} color={Colors.textMuted} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>No colors saved yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to snap a wall color{'\n'}and save your close matches
      </Text>
    </View>
  );
}

export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isLoading } = usePaints();

  const handleAddColor = () => {
    router.push('/add-color');
  };

  const handleColorPress = (id: string) => {
    router.push(`/color/${id}`);
  };

  const renderItem = ({ item }: { item: PaintColor }) => (
    <ColorCard item={item} onPress={() => handleColorPress(item.id)} />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Paint Collection</Text>
        <Text style={styles.subtitle}>Your saved color matches</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={colors}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            colors.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={handleAddColor}
        activeOpacity={0.8}
        testID="add-color-button"
      >
        <Plus size={28} color={Colors.white} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textLight,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  colorSwatch: {
    height: 120,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  colorName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  hexValue: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  notes: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
