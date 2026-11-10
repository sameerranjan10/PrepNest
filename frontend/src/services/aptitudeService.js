const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const READ_CACHE_TTL_MS = 20_000;
const readCache = new Map();

function getAuthHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  try {
    const token = localStorage.getItem('prepnest_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore storage access errors
  }
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: getAuthHeaders(options.headers),
  });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('prepnest:auth-expired'));
    const err = new Error('Your session has expired. Please sign in again.');
    err.status = 401;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    const detail = body?.detail || `Request failed (${res.status})`;
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  return body;
}

function getCached(key) {
  const entry = readCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > READ_CACHE_TTL_MS) {
    readCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  readCache.set(key, { data, ts: Date.now() });
}

export function invalidateAptitudeCache() {
  readCache.clear();
}

export async function fetchCategoriesAndOverview({ force = false } = {}) {
  const cacheKey = 'categories_overview';
  if (!force) {
    const hit = getCached(cacheKey);
    if (hit) return hit;
  }
  const data = await request('/api/aptitude/categories');
  setCached(cacheKey, data);
  return data;
}

export async function fetchModules({ company = 'all', force = false } = {}) {
  const cacheKey = `modules:${company}`;
  if (!force) {
    const hit = getCached(cacheKey);
    if (hit) return hit;
  }
  const qs =
    company && company !== 'all'
      ? `?company=${encodeURIComponent(company)}`
      : '';
  const data = await request(`/api/aptitude/modules${qs}`);
  setCached(cacheKey, data);
  return data;
}

export async function fetchDirectoryQuestions({
  category = 'all',
  subtopic = 'all',
  company = 'all',
  difficulty = 'all',
  status = 'all',
  sortBy = 'id',
  search = '',
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (category && category !== 'all') params.set('category', category);
  if (subtopic && subtopic !== 'all') params.set('subtopic', subtopic);
  if (company && company !== 'all') params.set('company', company);
  if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty);
  if (status && status !== 'all') params.set('status', status);
  if (sortBy && sortBy !== 'id') params.set('sort_by', sortBy);
  if (search && search.trim()) params.set('search', search.trim());

  return request(`/api/aptitude/directory?${params.toString()}`);
}

export async function fetchQuestionById(questionId) {
  return request(`/api/aptitude/questions/${questionId}`);
}

export async function submitQuestionAnswer(questionId, selectedOption) {
  const data = await request('/api/aptitude/solve-single', {
    method: 'POST',
    body: JSON.stringify({
      question_id: questionId,
      selected_option: selectedOption,
    }),
  });
  invalidateAptitudeCache();
  return data;
}

export async function toggleQuestionStar(questionId) {
  const data = await request(`/api/aptitude/questions/${questionId}/star`, {
    method: 'POST',
  });
  invalidateAptitudeCache();
  return data;
}

export async function generateAssessment({
  category = 'all',
  difficulty = 'all',
  company = 'all',
  subtopic = 'all',
  limit = 10,
  timerMode = 'standard',
} = {}) {
  return request('/api/aptitude/assessments/generate', {
    method: 'POST',
    body: JSON.stringify({
      category,
      difficulty,
      company,
      subtopic,
      limit,
      timer_mode: timerMode,
    }),
  });
}

export async function fetchAssessmentSession(assessmentId) {
  return request(`/api/aptitude/assessments/${assessmentId}`);
}

export async function saveAssessmentProgress(
  assessmentId,
  { savedAnswers = {}, markedReview = {} } = {}
) {
  return request(`/api/aptitude/assessments/${assessmentId}/progress`, {
    method: 'PUT',
    body: JSON.stringify({
      saved_answers: savedAnswers,
      marked_review: markedReview,
    }),
  });
}

export async function submitAssessment(
  assessmentId,
  { category = 'all', timeTakenSeconds = 0, answers = [] } = {}
) {
  const endpoint = assessmentId
    ? `/api/aptitude/assessments/${assessmentId}/submit`
    : '/api/aptitude/submit';

  const data = await request(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      assessment_id: assessmentId || null,
      category,
      time_taken_seconds: timeTakenSeconds,
      answers,
    }),
  });
  invalidateAptitudeCache();
  return data;
}

export async function fetchAssessmentHistory(limit = 10, { force = false } = {}) {
  const cacheKey = `history:${limit}`;
  if (!force) {
    const hit = getCached(cacheKey);
    if (hit) return hit;
  }
  const data = await request(`/api/aptitude/results?limit=${limit}`);
  setCached(cacheKey, data);
  return data;
}

export async function fetchAssessmentResultDetail(resultId) {
  return request(`/api/aptitude/results/${resultId}`);
}

