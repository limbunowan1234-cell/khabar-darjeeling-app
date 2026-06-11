// app/(tabs)/index.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { articleService, CATEGORIES } from '../../src/services/appwrite';
import NewsCard from '../../src/components/NewsCard';
import { COLORS, SIZES } from '../../src/utils/theme';

const POLL_INTERVAL = 60000;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [breaking, setBreaking] = useState([]);
  const pollRef = useRef(null);
  const latestIdRef = useRef(null);

  const fetchArticles = useCallback(async (reset = false) => {
    try {
      const currentOffset = reset ? 0 : offset;
      const result = await articleService.getArticles({ limit: 20, offset: currentOffset, category: selectedCategory });
      const docs = result.documents || [];
      if (reset) {
        setArticles(docs);
        setFeatured(docs[0] || null);
        latestIdRef.current = docs[0]?.$id;
        setOffset(20);
      } else {
        setArticles(prev => [...prev, ...docs]);
        setOffset(prev => prev + 20);
      }
      setHasMore(docs.length === 20);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, offset]);

  const loadBreaking = async () => {
    try {
      const result = await articleService.getBreakingNews();
      setBreaking(result.documents || []);
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchArticles(true);
    loadBreaking();
    pollRef.current = setInterval(async () => {
      try {
        const result = await articleService.getArticles({ limit: 3, category: selectedCategory });
        const docs = result.documents || [];
        if (docs[0]?.$id && docs[0].$id !== latestIdRef.current) {
          const idx = docs.findIndex(d => d.$id === latestIdRef.current);
          setNewCount(idx >= 0 ? idx : 1);
        }
      } catch {}
    }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    setNewCount(0);
    fetchArticles(true);
    loadBreaking();
  };

  const goToArticle = (article) => {
    router.push({ pathname: '/article', params: { id: article.$id, data: JSON.stringify(article) } });
  };

  const renderHeader = () => (
    <View>
      {/* Breaking ticker */}
      {breaking.length > 0 && (
        <View style={styles.ticker}>
          <View style={styles.tickerLabel}>
            <Text style={styles.tickerLabelText}>🔴 LIVE</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 8 }}>
            {breaking.map((item, i) => (
              <TouchableOpacity key={item.$id} onPress={() => goToArticle(item)}>
                <Text style={styles.tickerText}>{item.title}{i < breaking.length - 1 ? '  •  ' : ''}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured */}
      {featured && (
        <View style={{ marginTop: 14 }}>
          <NewsCard article={featured} onPress={() => goToArticle(featured)} variant="featured" />
        </View>
      )}

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll} contentContainerStyle={styles.catsContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catTab, selectedCategory === cat && styles.catTabActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catTabText, selectedCategory === cat && styles.catTabTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* New articles toast */}
      {newCount > 0 && (
        <TouchableOpacity style={styles.newToast} onPress={handleRefresh}>
          <Text style={styles.newToastText}>🔄 {newCount} new article{newCount > 1 ? 's' : ''} — tap to refresh</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionLabel}>Latest News</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandHindi}>खबर दार्जिलिंग</Text>
          <Text style={styles.brandEn}>KHABAR DARJEELING</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/search')}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={item => item.$id}
          renderItem={({ item, index }) => {
            if (index === 0) return null;
            return (
              <NewsCard
                article={item}
                onPress={() => goToArticle(item)}
                variant={index <= 3 ? 'default' : 'compact'}
              />
            );
          }}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} /> : null}
          onEndReached={() => { if (!loadingMore && hasMore) { setLoadingMore(true); fetchArticles(false); } }}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  brandHindi: { color: COLORS.primary, fontSize: SIZES.xxl, fontWeight: '900' },
  brandEn: { color: COLORS.textMuted, fontSize: SIZES.xs, letterSpacing: 2, fontWeight: '600' },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  ticker: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceElevated, borderBottomWidth: 1, borderBottomColor: COLORS.border, height: 36 },
  tickerLabel: { backgroundColor: COLORS.breaking, paddingHorizontal: 10, height: '100%', justifyContent: 'center' },
  tickerLabelText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '800' },
  tickerText: { color: COLORS.text, fontSize: SIZES.sm, lineHeight: 36 },
  catsScroll: { marginTop: 14 },
  catsContent: { paddingHorizontal: 14, gap: 8 },
  catTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 4 },
  catTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catTabText: { color: COLORS.textSecondary, fontSize: SIZES.sm, fontWeight: '600' },
  catTabTextActive: { color: '#fff', fontWeight: '700' },
  newToast: { marginHorizontal: 16, marginTop: 12, backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  newToastText: { color: '#fff', fontSize: SIZES.sm, fontWeight: '700' },
  sectionLabel: { color: COLORS.textSecondary, fontSize: SIZES.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginHorizontal: 16, marginTop: 18, marginBottom: 10 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: SIZES.md },
});
