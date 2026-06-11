// src/components/NewsCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../utils/theme';
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
      <TouchableOpacity style={styles.featured} onPress={onPress} activeOpacity={0.9}>
        {imageUrl
          ? <Image source={{ uri: imageUrl }} style={styles.featuredImg} />
          : <View style={[styles.featuredImg, { backgroundColor: COLORS.surface }]} />
        }
        <View style={styles.featuredOverlay}>
          <View style={styles.badgeRow}>
            {isBreaking && <View style={styles.breakBadge}><Text style={styles.breakText}>🔴 BREAKING</Text></View>}
            {isVideo && <View style={styles.vidBadge}><Text style={styles.vidText}>🎬 VIDEO</Text></View>}
            <View style={styles.catBadge}><Text style={styles.catText}>{article?.category}</Text></View>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={3}>{article?.title}</Text>
          <Text style={styles.featuredMeta}>📍 {article?.location}  ·  {timeAgo}</Text>
        </View>
        {isVideo && (
          <View style={styles.playWrap}>
            <View style={styles.playBtn}><Text style={styles.playIcon}>▶</Text></View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compact} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.compactContent}>
          {isBreaking && <View style={styles.compactBar} />}
          <View style={styles.compactMeta}>
            <Text style={styles.compactCat}>{article?.category}</Text>
            <Text style={styles.compactTime}>{timeAgo}</Text>
          </View>
          <Text style={styles.compactTitle} numberOfLines={2}>{article?.title}</Text>
          <Text style={styles.compactLoc}>📍 {article?.location}</Text>
        </View>
        {imageUrl && (
          <View style={styles.compactImgWrap}>
            <Image source={{ uri: imageUrl }} style={styles.compactImg} />
            {isVideo && (
              <View style={styles.compactPlay}>
                <Text style={{ color: '#fff', fontSize: 14 }}>▶</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {imageUrl && (
        <View style={styles.cardImgWrap}>
          <Image source={{ uri: imageUrl }} style={styles.cardImg} />
          {isVideo && (
            <View style={styles.cardPlayWrap}>
              <View style={styles.cardPlay}><Text style={styles.cardPlayIcon}>▶</Text></View>
            </View>
          )}
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardMeta}>
          {isBreaking && <View style={styles.smallBreak}><Text style={styles.smallBreakText}>BREAKING</Text></View>}
          <Text style={styles.cardCat}>{article?.category}</Text>
          <Text style={styles.cardTime}>{timeAgo}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{article?.title}</Text>
        {article?.location && <Text style={styles.cardLoc}>📍 {article?.location}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featured: { width: width - 32, height: 280, borderRadius: SIZES.radiusLg, overflow: 'hidden', marginHorizontal: 16, elevation: 8 },
  featuredImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingTop: 80, backgroundColor: 'rgba(0,0,0,0.55)' },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  breakBadge: { backgroundColor: COLORS.breaking, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  breakText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '800' },
  vidBadge: { backgroundColor: COLORS.video, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  vidText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '700' },
  catBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  catText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '700', textTransform: 'uppercase' },
  featuredTitle: { color: '#fff', fontSize: SIZES.xl, fontWeight: '800', lineHeight: 28, marginBottom: 6 },
  featuredMeta: { color: 'rgba(255,255,255,0.75)', fontSize: SIZES.sm },
  playWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.7)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
  playIcon: { color: '#fff', fontSize: 22, marginLeft: 4 },

  compact: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: SIZES.radius, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', elevation: 2 },
  compactContent: { flex: 1, padding: 12 },
  compactBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: COLORS.breaking },
  compactMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  compactCat: { color: COLORS.primary, fontSize: SIZES.xs, fontWeight: '700', textTransform: 'uppercase' },
  compactTime: { color: COLORS.textMuted, fontSize: SIZES.xs },
  compactTitle: { color: COLORS.text, fontSize: SIZES.md, fontWeight: '600', lineHeight: 20, marginBottom: 4 },
  compactLoc: { color: COLORS.textSecondary, fontSize: SIZES.xs },
  compactImgWrap: { width: 90 },
  compactImg: { width: 90, height: '100%', resizeMode: 'cover' },
  compactPlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },

  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  cardImgWrap: { width: '100%', height: 180 },
  cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardPlayWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  cardPlay: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.65)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
  cardPlayIcon: { color: '#fff', fontSize: 18, marginLeft: 3 },
  cardContent: { padding: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  smallBreak: { backgroundColor: COLORS.breaking, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  smallBreakText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  cardCat: { color: COLORS.primary, fontSize: SIZES.xs, fontWeight: '700', textTransform: 'uppercase' },
  cardTime: { color: COLORS.textMuted, fontSize: SIZES.xs, marginLeft: 'auto' },
  cardTitle: { color: COLORS.text, fontSize: SIZES.base, fontWeight: '700', lineHeight: 22, marginBottom: 6 },
  cardLoc: { color: COLORS.textSecondary, fontSize: SIZES.xs },
});

export default NewsCard;
