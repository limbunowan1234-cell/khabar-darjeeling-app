// app/(tabs)/search.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { articleService } from '../../src/services/appwrite';
import NewsCard from '../../src/components/NewsCard';
import { COLORS, SIZES } from '../../src/utils/theme';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = async (text) => {
    if (!text.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      const result = await articleService.searchArticles(text.trim());
      setResults(result.documents || []);
    } catch {} finally { setLoading(false); }
  };

  const handleChange = (text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(text), 500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChange}
          placeholder="Search Khabar Darjeeling..."
          placeholderTextColor={COLORS.textMuted}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Text style={styles.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLORS.primary} size="small" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.$id}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onPress={() => router.push({ pathname: '/article', params: { id: item.$id, data: JSON.stringify(item) } })}
            variant="compact"
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{searched ? '📭' : '🔍'}</Text>
            <Text style={styles.emptyTitle}>{searched ? 'No results found' : 'Search Khabar Darjeeling'}</Text>
            <Text style={styles.emptySub}>{searched ? 'Try different keywords' : 'Darjeeling · Kalimpong · Kurseong · Siliguri'}</Text>
          </View>
        }
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusFull, paddingHorizontal: 16, gap: 8 },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, color: COLORS.text, fontSize: SIZES.base, paddingVertical: 12 },
  clear: { color: COLORS.textSecondary, fontSize: 14, paddingHorizontal: 4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  loadingText: { color: COLORS.textSecondary, fontSize: SIZES.sm },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: COLORS.text, fontSize: SIZES.lg, fontWeight: '700', textAlign: 'center' },
  emptySub: { color: COLORS.textSecondary, fontSize: SIZES.md, textAlign: 'center', lineHeight: 22 },
});
