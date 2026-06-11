// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { articleService, CATEGORIES } from '../services/appwrite';
import NewsCard from '../components/NewsCard';
import { COLORS, SIZES } from '../utils/theme';

const POLL_INTERVAL = 60000; // 1 minute live refresh

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newArticlesCount, setNewArticlesCount] = useState(0);
  const pollRef = useRef(null);
  const latestIdRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fetchArticles = useCallback(async (reset = false) => {
    try {
      const currentOffset = reset ? 0 : offset;
      const result = await articleService.getArticles({
        limit: 20,
        offset: currentOffset,
        category: selectedCategory,
      });

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
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, offset]);

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchArticles(true);
    startPolling();
    return () => stopPolling();
  }, [selectedCategory]);

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(checkForNewArticles, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const checkForNewArticles = async () => {
    try {
      const result = await articleService.getArticles({ limit: 5, category: selectedCategory });
      const docs = result.documents || [];
      const newestId = docs[0]?.$id;
      if (newestId && newestId !== latestIdRef.current) {
        // Count new articles
        const newCount = docs.findIndex(d => d.$id === latestIdRef.current);
        setNewArticlesCount(newCount > 0 ? newCount : 1);
      }
    } catch (_) {}
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setNewArticlesCount(0);
    fetchArticles(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchArticles(false);
    }
  };

  const handleArticlePress = (article) => {
    navigation.navigate('Article', { article });
  };

  const renderHeader = () => (
    <View>
      {/* Breaking news ticker */}
      <BreakingTicker navigation={navigation} />

      {/* Featured article */}
      {featured && (
        <View style={styles.featuredWrap}>
          <NewsCard
            article={featured}
            onPress={() => handleArticlePress(featured)}
            variant="featured"
          />
        </View>
      )}

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryTab,
              selectedCategory === cat && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === cat && styles.categoryTabTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* New articles toast */}
      {newArticlesCount > 0 && (
        <TouchableOpacity style={styles.newArticlesToast} onPress={handleRefresh}>
          <Text style={styles.newArticlesText}>
            🔄 {newArticlesCount} new article{newArticlesCount > 1 ? 's' : ''} — tap to refresh
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionLabel}>Latest News</Text>
    </View>
  );

  const renderArticle = ({ item, index }) => {
    if (index === 0) return null; // Skip first — shown as featured
    return (
      <NewsCard
        article={item}
        onPress={() => handleArticlePress(item)}
        variant={index <= 3 ? 'default' : 'compact'}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadMoreIndicator}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Sticky header */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <Text style={styles.stickyTitle}>खबर दार्जिलिंग</Text>
      </Animated.View>

      {/* Top header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandHindi}>खबर दार्जिलिंग</Text>
          <Text style={styles.brandEnglish}>KHABAR DARJEELING</Text>
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={articles}
          keyExtractor={(item) => item.$id}
          renderItem={renderArticle}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

// Breaking news ticker component
const BreakingTicker = ({ navigation }) => {
  const [breaking, setBreaking] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBreaking();
  }, []);

  const loadBreaking = async () => {
    try {
      const result = await articleService.getBreakingNews();
      setBreaking(result.documents || []);
    } catch (_) {}
  };

  if (!breaking.length) return null;

  return (
    <View style={styles.ticker}>
      <View style={styles.tickerLabel}>
        <Text style={styles.tickerLabelText}>🔴 LIVE</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tickerScroll}
      >
        {breaking.map((item, i) => (
          <TouchableOpacity
            key={item.$id}
            onPress={() => navigation.navigate('Article', { article: item })}
          >
            <Text style={styles.tickerText}>
              {item.title}
              {i < breaking.length - 1 ? '  •  ' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stickyTitle: {
    color: COLORS.primary,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandHindi: {
    color: COLORS.primary,
    fontSize: SIZES.xxl,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandEnglish: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    letterSpacing: 2,
    fontWeight: '600',
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 36,
  },
  tickerLabel: {
    backgroundColor: COLORS.breaking,
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
  },
  tickerLabelText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tickerScroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tickerText: {
    color: COLORS.text,
    fontSize: SIZES.sm,
    lineHeight: 36,
  },
  categoriesScroll: {
    marginTop: 14,
  },
  categoriesContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 4,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTabText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  newArticlesToast: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  newArticlesText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  featuredWrap: {
    marginTop: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
  },
  loadMoreIndicator: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default HomeScreen;
