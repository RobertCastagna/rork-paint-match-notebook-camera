import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Palette, Camera, BookOpen } from 'lucide-react-native';
import Colors from '@/constants/colors';

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>About</Text>
          <Text style={styles.subtitle}>Paint Matching Notebook</Text>
        </View>

        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <AlertTriangle size={20} color={Colors.warning} />
            <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This app provides approximate color matches for personal reference only. 
            Colors may vary significantly due to lighting, screen calibration, paint 
            finishes, and other factors.{'\n\n'}
            Always test actual paint samples before purchasing. This app makes 
            no claims of accuracy and should not be used for professional 
            color matching purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          
          <FeatureItem
            icon={<Camera size={22} color={Colors.accent} />}
            title="Capture Colors"
            description="Take a photo of any wall or surface to capture its color. The app will extract the dominant color from your image."
          />
          
          <FeatureItem
            icon={<Palette size={22} color={Colors.accent} />}
            title="Adjust & Name"
            description="Fine-tune the extracted color if needed and give it a memorable name like 'Living Room Accent' or 'Kitchen Cabinet'."
          />
          
          <FeatureItem
            icon={<BookOpen size={22} color={Colors.accent} />}
            title="Build Your Collection"
            description="Save colors to your personal collection for reference when shopping for paint or discussing with contractors."
          />
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips for Better Results</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Photograph in natural daylight when possible</Text>
            <Text style={styles.tipItem}>• Avoid areas with shadows or reflections</Text>
            <Text style={styles.tipItem}>• Take multiple photos from different angles</Text>
            <Text style={styles.tipItem}>• Add notes about lighting conditions</Text>
            <Text style={styles.tipItem}>• Always verify with physical paint swatches</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0</Text>
          <Text style={styles.footerSubtext}>Made for paint enthusiasts</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
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
  disclaimerCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F5E6B3',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#8B7355',
    marginLeft: 10,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#7A6B52',
    lineHeight: 22,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  tipsSection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  tipsList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 26,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
