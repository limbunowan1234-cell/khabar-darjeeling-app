// app/article.js
import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Share, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { COLORS, SIZES } from '../src/utils/theme';
import { mediaService } from '../src/services/appwrite';
import moment from 'moment';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16;

export default function ArticleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const article = data ? JSON.parse(data) : {};

  const isVideo = !!article?.youtube_id;
  const isBreaking = article?.category === 'Breaking';
  const imageUrl = mediaService.getArticleImage(article, 1200);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nRead more: https://khabardarjeeling.space`,
        title: article.title,
      });
    } catch {}
  };

  const youtubeHtml = article?.youtube_id ? `
    <!DOCTYPE html><html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>* { margin:0; padding:0; } body { background:#000; } iframe { width:100%; height:100vh; border:none; }</style>
    </head>
    <body>
    <iframe src="https://www.youtube.com/embed/${article.youtube_id}?autoplay=1&rel=0&modestbranding=1"
      allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </body></html>` : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareIcon}>↑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isVideo && youtubeHtml ? (
          <View style={{ height: VIDEO_HEIGHT, backgroundColor: '#000' }}>
            <WebView source={{ html: youtubeHtml }} style={{ height: VIDEO_HEIGHT }} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} javaScriptEnabled />
          </View>
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        ) : null}

        <View style={styles.content}>
          <View style={styles.badges}>
            {isBreaking && <View style={styles.breakBadge}><Text style={styles.breakText}>🔴 BREAKING</Text></View>}
            {isVideo && <View style={styles.vidBadge}><Text style={styles.vidText}>🎬 VIDEO</Text></View>}
            <View style={styles.catBadge}><Text style={styles.catText}>{article?.category}</Text></View>
          </View>

          <Text style={styles.title}>{article?.title}</Text>

          <View style={styles.meta}>
            <Text style={styles.metaText}>📍 {article?.location || 'Darjeeling'}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{moment(article?.submittedAt).format('DD MMM YYYY, h:mm A')}</Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.body}>{article?.content}</Text>

          <TouchableOpacity style={styles.shareSectionBtn} onPress={handleShare}>
            <Text style={styles.shareSectionText}>↑  Share Article</Text>
          </TouchableOpacity>

          <View style={styles.sourceTag}>
            <Text style={styles.sourceText}>Published on <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Khabar Darjeeling</Text> · khabardarjeeling.space</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: COLORS.text, fontSize: 20, fontWeight: '600' },
  shareBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  shareIcon: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroImage: { width, height: 260, resizeMode: 'cover' },
  content: { padding: 20 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  breakBadge: { backgroundColor: COLORS.breaking, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  breakText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '800' },
  vidBadge: { backgroundColor: COLORS.video, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  vidText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '700' },
  catBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  catText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: COLORS.text, fontSize: SIZES.xxl, fontWeight: '800', lineHeight: 36, marginBottom: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  metaText: { color: COLORS.textSecondary, fontSize: SIZES.sm },
  metaDot: { color: COLORS.textMuted, fontSize: SIZES.sm },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 20 },
  body: { color: COLORS.text, fontSize: SIZES.base, lineHeight: 28, letterSpacing: 0.2 },
  shareSectionBtn: { marginTop: 32, backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: SIZES.radiusFull, alignSelf: 'center' },
  shareSectionText: { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  sourceTag: { marginTop: 24, padding: 14, backgroundColor: COLORS.surface, borderRadius: SIZES.radius, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  sourceText: { color: COLORS.textSecondary, fontSize: SIZES.sm },
});
