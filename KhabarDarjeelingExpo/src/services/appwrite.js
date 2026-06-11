// src/services/appwrite.js
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = 'khabardarjeeling';
const DATABASE_ID = 'Khabar_db';
const ARTICLES_COLLECTION = 'articles';
const PROFILES_COLLECTION = 'user_profiles';
const BUCKET_ID = 'article-image';

const apiFetch = async (path, options = {}, authToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': PROJECT_ID,
    ...(authToken && { 'X-Appwrite-Session': authToken }),
    ...options.headers,
  };
  const response = await fetch(`${ENDPOINT}${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Error ${response.status}`);
  return data;
};

export const authService = {
  async login(email, password) {
    return apiFetch('/account/sessions/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async register(email, password, name) {
    return apiFetch('/account', {
      method: 'POST',
      body: JSON.stringify({ userId: 'unique()', email, password, name }),
    });
  },
  async getAccount(sessionToken) {
    return apiFetch('/account', {}, sessionToken);
  },
  async logout(sessionToken) {
    return apiFetch('/account/sessions/current', { method: 'DELETE' }, sessionToken);
  },
};

export const articleService = {
  async getArticles({ limit = 20, offset = 0, category = null } = {}, token = null) {
    let q = [
      `queries[]=limit(${limit})`,
      `queries[]=offset(${offset})`,
      `queries[]=orderDesc("submittedAt")`,
    ];
    if (category && category !== 'All') {
      q.push(`queries[]=equal("category","${category}")`);
    }
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents?${q.join('&')}`,
      {}, token
    );
  },
  async getArticle(id, token = null) {
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents/${id}`,
      {}, token
    );
  },
  async searchArticles(query, token = null) {
    const q = `queries[]=search("title","${query}")&queries[]=limit(20)&queries[]=orderDesc("submittedAt")`;
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents?${q}`,
      {}, token
    );
  },
  async getBreakingNews(token = null) {
    const q = `queries[]=equal("category","Breaking")&queries[]=limit(5)&queries[]=orderDesc("submittedAt")`;
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${ARTICLES_COLLECTION}/documents?${q}`,
      {}, token
    );
  },
};

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
    if (article?.youtube_id) return this.getYoutubeThumbnail(article.youtube_id);
    if (article?.imageFileId) return this.getImageUrl(article.imageFileId, width);
    return null;
  },
};

export const profileService = {
  async getProfile(userId, token = null) {
    const q = `queries[]=equal("userId","${userId}")&queries[]=limit(1)`;
    const result = await apiFetch(
      `/databases/${DATABASE_ID}/collections/${PROFILES_COLLECTION}/documents?${q}`,
      {}, token
    );
    return result.documents?.[0] || null;
  },
  async updateProfile(documentId, data, token) {
    return apiFetch(
      `/databases/${DATABASE_ID}/collections/${PROFILES_COLLECTION}/documents/${documentId}`,
      { method: 'PATCH', body: JSON.stringify({ data }) },
      token
    );
  },
};

export const CATEGORIES = [
  'All', 'Breaking', 'Darjeeling', 'Kalimpong',
  'Kurseong', 'Mirik', 'Siliguri', 'West Bengal',
  'Politics', 'Sports', 'Entertainment', 'Video',
];
