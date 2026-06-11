// src/components/NewsCard.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { mediaService } from '../services/appwrite';
import moment from 'moment';

const { width } = Dimensions.get('window');

const NewsCard = ({ article, onPress, variant = 'default' }) => {
  const imageUrl = mediaService.getArticleImage(article, 600);
  const isVideo = !!article?.youtube_id;
  const isBreaking = article?.category === 'Breaking';
  const timeAgo = moment(article?.submittedAt).fromNow();

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.featuredImage} />
        ) : (
          <View style={[styles.featuredImage, styles.imagePlaceholder]} />
        )}
        <View style={styles.featuredOverlay}>
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
          <Text style={styles.featuredTitle} numberOfLines={3}>
            {article?.title}
          </Text>
          <Text style={styles.featuredMeta}>
            📍 {article?.location}  ·  {timeAgo}
          </Text>
        </View>
        {isVideo && (
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.compactContent}>
          {isBreaking && <View style={styles.compactBreakingBar} />}
          <View style={styles.compactBadgeRow}>
            <Text style={styles.compactCategory}>{article?.category}</Text>
            <Text style={styles.compactTime}>{timeAgo}</Text>
          </View>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {article?.title}
          </Text>
          <Text style={styles.compactLocation}>📍 {article?.location}</Text>
        </View>
        {imageUrl && (
          <View style={styles.compactImageWrap}>
            <Image source={{ uri: imageUrl }} style={styles.compactImage} />
            {isVideo && (
              <View style={styles.compactPlayOverlay}>
                <Text style={styles.compactPlayIcon}>▶</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Default card
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {imageUrl && (
        <View style={styles.imageWrap}>
          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
          {isVideo && (
            <View style={styles.videoOverlay}>
              <View style={styles.smallPlayButton}>
                <Text style={styles.smallPlayIcon}>▶</Text>
              </View>
              <View style={styles.smallVideoBadge}>
                <Text style={styles.videoText}>🎬 VIDEO</Text>
              </View>
            </View>
          )}
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardBadgeRow}>
          {isBreaking && (
            <View style={styles.smallBreakingBadge}>
              <Text style={styles.smallBreakingText}>BREAKING</Text>
            </View>
          )}
          <Text style={styles.cardCategory}>{article?.category}</Text>
          <Text style={styles.cardTime}>{timeAgo}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {article?.title}
        </Text>
        {article?.location && (
          <Text style={styles.cardLocation}>📍 {article?.location}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ── Featured ──────────────────────────────────────────────────
  featuredCard: {
    width: width - 32,
    height: 280,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginHorizontal: 16,
    ...SHADOWS.lg,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 60,
    background: 'transparent',
    backgroundColor: 'transparent',
  },
  imagePlaceholder: {
    backgroundColor: COLORS.surface,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  breakingBadge: {
    backgroundColor: COLORS.breaking,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  videoText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: '800',
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  featuredMeta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: SIZES.sm,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: COLORS.white,
    fontSize: 22,
    marginLeft: 4,
  },

  // ── Compact ───────────────────────────────────────────────────
  compactCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  compactBreakingBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.breaking,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 14,
  },
  compactBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compactCategory: {
    color: COLORS.primary,
    fontSize: SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  compactTime: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
  },
  compactTitle: {
    color: COLORS.text,
    fontSize: SIZES.md,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  compactLocation: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
  },
  compactImageWrap: {
    width: 90,
    position: 'relative',
  },
  compactImage: {
    width: 90,
    height: '100%',
    resizeMode: 'cover',
  },
  compactPlayOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  compactPlayIcon: {
    color: COLORS.white,
    fontSize: 16,
  },

  // ── Default ───────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  imageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallPlayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallPlayIcon: {
    color: COLORS.white,
    fontSize: 18,
    marginLeft: 3,
  },
  smallVideoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.video,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  cardContent: {
    padding: 12,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  smallBreakingBadge: {
    backgroundColor: COLORS.breaking,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  smallBreakingText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardCategory: {
    color: COLORS.primary,
    fontSize: SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTime: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    marginLeft: 'auto',
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: SIZES.base,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardLocation: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
  },
});

export default NewsCard;
