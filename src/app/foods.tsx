import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { FOODS } from '@/data/foods';
import { useTheme } from '@/hooks/use-theme';

export default function FoodsScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? FOODS.filter((food) => food.name.toLowerCase().includes(normalized))
    : FOODS;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Alimentos</ThemedText>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar alimento..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.search, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
        </View>
        <FlatList
          data={results}
          keyExtractor={(food) => food.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary">
              Sin resultados
            </ThemedText>
          }
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.row}>
              <View style={styles.rowText}>
                <ThemedText type="small">{item.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  P {item.macrosPer100g.protein} g · C {item.macrosPer100g.carbs} g · G{' '}
                  {item.macrosPer100g.fat} g
                </ThemedText>
              </View>
              <ThemedText type="smallBold">{item.kcalPer100g} kcal/100 g</ThemedText>
            </ThemedView>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  search: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    fontSize: 16,
  },
  list: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  rowText: {
    flex: 1,
  },
});
