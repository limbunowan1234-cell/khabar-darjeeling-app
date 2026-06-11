// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { profileService, mediaService } from '../services/appwrite';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import moment from 'moment';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile, sessionToken, logout, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const avatarUrl = profile?.avatarUrl
    ? mediaService.getImageUrl(profile.avatarUrl, 200)
    : null;

  const handleAvatarPick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.fileName || 'avatar.jpg',
      type: asset.type || 'image/jpeg',
    };

    try {
      setSaving(true);
      const uploaded = await profileService.uploadAvatar(file, sessionToken);
      await profileService.updateProfile(profile.$id, { avatarUrl: uploaded.$id }, sessionToken);
      await refreshProfile();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(
        profile.$id,
        { displayName, bio },
        sessionToken
      );
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={styles.guestTitle}>Not signed in</Text>
        <Text style={styles.guestSubtitle}>Sign in to access your profile</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverBg} />

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={editing ? handleAvatarPick : undefined} style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>
                  {(user.name || user.email)?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
            {editing && (
              <View style={styles.avatarEditOverlay}>
                <Text style={styles.avatarEditText}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.profileContent}>
          {editing ? (
            <>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display name"
                placeholderTextColor={COLORS.textMuted}
              />
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder="Write a short bio..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
              />
            </>
          ) : (
            <>
              <Text style={styles.displayName}>
                {profile?.displayName || user.name || 'Anonymous'}
              </Text>
              {profile?.userName && (
                <Text style={styles.userName}>@{profile.userName}</Text>
              )}
              {profile?.bio && (
                <Text style={styles.bio}>{profile.bio}</Text>
              )}
            </>
          )}

          {/* Info cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>📧 Email</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{user.email}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>📅 Joined</Text>
              <Text style={styles.infoValue}>
                {moment(profile?.joinedAT || user.$createdAt).format('MMM YYYY')}
              </Text>
            </View>
          </View>

          {/* Verification status */}
          <View style={styles.verifyCard}>
            <Text style={styles.verifyIcon}>
              {user.emailVerification ? '✅' : '⚠️'}
            </Text>
            <View style={styles.verifyInfo}>
              <Text style={styles.verifyTitle}>
                {user.emailVerification ? 'Email Verified' : 'Email Not Verified'}
              </Text>
              <Text style={styles.verifySubtitle}>
                {user.email}
              </Text>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
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
  headerTitle: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  editBtn: {
    minWidth: 52,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  editBtnText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  coverBg: {
    height: 120,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.background,
    ...SHADOWS.md,
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: COLORS.white,
    fontSize: SIZES.xxxl,
    fontWeight: '700',
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  avatarEditText: {
    fontSize: 14,
  },
  profileContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  displayName: {
    color: COLORS.text,
    fontSize: SIZES.xxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  userName: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    textAlign: 'center',
  },
  bio: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: SIZES.base,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 14,
    gap: 6,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  verifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verifyIcon: {
    fontSize: 22,
  },
  verifyInfo: {
    flex: 1,
  },
  verifyTitle: {
    color: COLORS.text,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  verifySubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: SIZES.base,
    fontWeight: '700',
  },
  guestIcon: { fontSize: 60 },
  guestTitle: {
    color: COLORS.text,
    fontSize: SIZES.xl,
    fontWeight: '800',
  },
  guestSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.base,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusFull,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '700',
  },
});

export default ProfileScreen;
