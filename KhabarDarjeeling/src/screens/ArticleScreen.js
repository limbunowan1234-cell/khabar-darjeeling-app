// src/screens/ArticleScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { mediaService } from '../services/appwrite';
import moment from 'moment';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16;

const ArticleScreen = ({ route, navigation }) => {
  const { article } = route.params;
  const insets = useSafeAreaInsets();
  const [videoReady, setVideoReady] = useState(false);
  const isVideo = !!article?.youtube_id;
  const imageUrl = mediaService.getArticleImage(article, 1200);
  const isBreaking = article?.category === 'Breaking';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nRead more on Khabar Darjeeling: https://khabardarjeeling.space`,
        title: article.title,
      });
    } catch (_) {}
  };

  const youtubeEmbedHtml = article?.youtube_id
    ? `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; }
          body { background: #000; }
          iframe { width: 100%; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.youtube.com/embed/${article.youtube_id}?autoplay=1&rel=0&modestbranding=1"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>
      </body>
      </html>
    `
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Media */}
        {isVideo && article.youtube_id ? (
          <View style={styles.videoContainer}>
            <WebView
              source={{ html: youtubeEmbedHtml }}
              style={[styles.webview, { height: VIDEO_HEIGHT }]}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
            />
          </View>
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        ) : null}

        {/* Content */}
        <View style={styles.content}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            {isBreaking && (
              <View style={styles.breakingBadge}>
                <Text style={styles.breakingText}>🔴 BREAKING</Text>
              </View>
            )}
            {isVideo && (
              <View style={styles.videoBadge}>
                <Text style={styles.videoText}>🎬 VIDEO</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{article?.category}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{article?.title}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>{article?.location || 'Darjeeling'}</Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>
              {moment(article?.submittedAt).format('DD MMM YYYY, h:mm A')}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Article body */}
          <Text style={styles.body}>{article?.content}</Text>

          {/* Share section */}
          <View style={styles.shareSection}>
            <Text style={styles.shareLabel}>Share this story</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>↑  Share Article</Text>
            </TouchableOpacity>
          </View>

          {/* Source tag */}
          <View style={styles.sourceTag}>
            <Text style={styles.sourceText}>
              Published on{' '}
              <Text style={styles.sourceBrand}>Khabar Darjeeling</Text>
              {' '}· khabardarjeeling.space
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  videoContainer: {
    width,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  webview: {
    width,
    backgroundColor: '#000',
  },
  heroImage: {
    width,
    height: 260,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  breakingBadge: {
    backgroundColor: COLORS.breaking,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  breakingText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  videoBadge: {
    backgroundColor: COLORS.video,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 20,
  },
  body: {
    color: COLORS.text,
    fontSize: SIZES.base,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  shareSection: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },
  shareLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: SIZES.radiusFull,
  },
  shareBtnText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '700',
  },
  sourceTag: {
    marginTop: 24,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sourceText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  sourceBrand: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default ArticleScreen;
