// src/services/appwrite.js
// Connects to live khabardarjeeling.space Appwrite backend

const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = 'khabardarjeeling';
const DATABASE_ID = 'Khabar_db';
const ARTICLES_COLLECTION = 'articles';
const PROFILES_COLLECTION = 'user_profiles';
const BUCKET_ID = 'article-image';

// ─── HTTP Helper ────────────────────────────────────────────────────────────
const apiFetch = async (path, options = {}, authToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': PROJECT_ID,
    ...(authToken && { 'X-Appwrite-Session': authToken }),
    ...options.headers,
  };

  const response = await fetch(`${ENDPOINT}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  async login(email, password) {
    return apiFetch('/account/sessions/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email, password, name) {
    const userId = 'unique()';
    return apiFetch('/account', {
      method: 'POST',
      body: JSON.stringify({ userId, email, password, name }),
    });
  },

  async getAccount(sessionToken) {
    return apiFetch('/account', {}, sessionToken);
  },

  async logout(sessionToken) {
    return apiFetch('/account/sessions/current', {
      method: 'DELETE',
    }, sessionToken);
  },

  async sendVerification(sessionToken) {
    return apiFetch('/account/verification', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://khabardarjeeling.space/verify' }),
    }, sessionToken);
  },
};

// ─── Articles ─────────────────────────────────────────────────────────────────
export const articleService = {
  async getArticles({ limit = 20, offset = 0, category = null } = {}, sessionToken = null) {
    let queries = [
      `queries[]=limit(${limit})`,
      `queries[]=offset(${offset})`,
      `queries[]=orderDesc("submittedAt")`,
    ];

    if (category && category !== 'All') {
      queries.push(`queries[]=equal("category","${category}")`);
    }

    const queryString = queries.join('&');
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents?${queryString}`,
      {},
      sessionToken
    );
  },

  async getArticle(documentId, sessionToken = null) {
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents/${documentId}`,
      {},
      sessionToken
    );
  },

  async searchArticles(query, sessionToken = null) {
    const queryString = `queries[]=search("title","${query}")&queries[]=limit(20)&queries[]=orderDesc("submittedAt")`;
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents?${queryString}`,
      {},
      sessionToken
    );
  },

  async getByCategory(category, limit = 10, sessionToken = null) {
    const queryString = `queries[]=equal("category","${category}")&queries[]=limit(${limit})&queries[]=orderDesc("submittedAt")`;
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents?${queryString}`,
      {},
      sessionToken
    );
  },

  async getBreakingNews(sessionToken = null) {
    const queryString = `queries[]=equal("category","Breaking")&queries[]=limit(5)&queries[]=orderDesc("submittedAt")`;
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents?${queryString}`,
      {},
      sessionToken
    );
  },
};

// ─── Media Helpers ────────────────────────────────────────────────────────────
export const mediaService = {
  getImageUrl(fileId, width = 800) {
    if (!fileId) return null;
    return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}&width=${width}`;
  },

  getYoutubeThumbnail(youtubeId) {
    if (!youtubeId) return null;
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  },

  getArticleImage(article, width = 800) {
    if (article?.youtube_id) {
      return this.getYoutubeThumbnail(article.youtube_id);
    }
    if (article?.imageFileId) {
      return this.getImageUrl(article.imageFileId, width);
    }
    return null;
  },
};

// ─── User Profiles ────────────────────────────────────────────────────────────
export const profileService = {
  async getProfile(userId, sessionToken = null) {
    const queryString = `queries[]=equal("userId","${userId}")&queries[]=limit(1)`;
    const result = await apiFetch(
      `/databases/${DATABASE_ID}/collections/${PROFILES_COLLECTION}/documents?${queryString}`,
      {},
      sessionToken
    );
    return result.documents?.[0] || null;
  },

  async updateProfile(documentId, data, sessionToken) {
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${PROFILES_COLLECTION}/documents/${documentId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ data }),
      },
      sessionToken
    );
  },

  async uploadAvatar(file, sessionToken) {
    const formData = new FormData();
    formData.append('fileId', 'unique()');
    formData.append('file', file);

    const response = await fetch(`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files`, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Session': sessionToken,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
};

export const CATEGORIES = [
  'All',
  'Breaking',
  'Darjeeling',
  'Kalimpong',
  'Kurseong',
  'Mirik',
  'Siliguri',
  'West Bengal',
  'Politics',
  'Business',
  'Sports',
  'Entertainment',
  'Video',
];

export default {
  ENDPOINT,
  PROJECT_ID,
  DATABASE_ID,
  BUCKET_ID,
};
