// server/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Safe requireRole fallback if your roleGuard export differs
let requireRole;
try {
  const rg = require('../middleware/roleGuard');
  requireRole = rg && typeof rg.requireRole === 'function' ? rg.requireRole : null;
} catch (e) {
  requireRole = null;
}
if (!requireRole) {
  requireRole = (allowed = []) => (req, res, next) => {
    try {
      const user = req.user || {};
      const role = String(user.role || '').toLowerCase();
      if (!user.user_id) return res.status(403).json({ error: 'Forbidden' });
      if (allowed.length === 0) return next();
      if (allowed.map(x => String(x).toLowerCase()).includes(role)) return next();
      return res.status(403).json({ error: 'Forbidden' });
    } catch (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  };
}

function cleanQuery(q) {
  if (!q) return '';
  return String(q).trim().replace(/^['"]+|['"]+$/g, '').trim();
}

/* Cache teacher_profiles columns for a short while */
let _cachedCols = null;
let _cachedColsAt = 0;
async function getTeacherProfileCols() {
  const now = Date.now();
  if (_cachedCols && (now - _cachedColsAt) < 60_000) return _cachedCols; // 60s cache
  const sql = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'teacher_profiles' AND table_schema = 'public'
  `;
  const r = await pool.query(sql);
  const cols = (r.rows || []).map(r => r.column_name);
  _cachedCols = cols;
  _cachedColsAt = now;
  return cols;
}

/**
 * GET /api/recommendations?q=...&limit=...
 * Search teacher profiles (expertise, bio, education if present).
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const rawQ = cleanQuery(req.query.q || '');
    if (!rawQ) return res.json({ recommendations: [] });

    const limit = Math.min(parseInt(req.query.limit || '20', 10) || 20, 200);
    const cols = await getTeacherProfileCols();

    // preferred searchable columns
    const preferred = ['expertise', 'bio', 'education', 'qualifications', 'areas', 'skills'];
    const searchable = preferred.filter(c => cols.includes(c));

    if (searchable.length === 0) {
      // fallback: list faculty users without profile matching
      const simpleSql = `
        SELECT u.user_id, COALESCE(u.display_name, u.email) AS display_name, u.email
        FROM users u
        WHERE lower(u.role) LIKE 'faculty%' OR lower(u.role) = 'teacher'
        LIMIT $1
      `;
      const r = await pool.query(simpleSql, [limit]);
      return res.json({ recommendations: (r.rows || []) });
    }

    // build WHERE clause
    const ilikeParts = searchable.map((c) => `tp.${c} ILIKE $1`);
    const whereClause = `(${ilikeParts.join(' OR ')})`;

    // determine rating availability and ordering expression
    const ratingExists = cols.includes('rating');
    // alias the ordering expression into the select list to satisfy strict SQL engines
    const ratingOrderExpr = ratingExists ? 'COALESCE(tp.rating, 0)' : '0';
    const ratingSelect = ratingExists ? 'tp.rating AS rating,' : 'NULL AS rating,';

    // include expertise/bio/education only if present (safe select)
    const selectExpertise = cols.includes('expertise') ? 'tp.expertise,' : 'NULL as expertise,';
    const selectEducation = cols.includes('education') ? 'tp.education,' : 'NULL as education,';
    const selectBio = cols.includes('bio') ? 'tp.bio,' : 'NULL as bio,';

    // include ordering alias in SELECT (name _rating_order) and ORDER BY that alias
    const sql = `
      SELECT u.user_id,
             COALESCE(u.display_name, u.email) AS display_name,
             u.email,
             ${selectExpertise}
             ${selectEducation}
             ${selectBio}
             ${ratingSelect}
             (${ratingOrderExpr}) AS _rating_order
      FROM teacher_profiles tp
      JOIN users u ON u.user_id = tp.user_id
      WHERE ${whereClause}
      ORDER BY _rating_order DESC NULLS LAST
      LIMIT $2
    `;

    const param = `%${rawQ}%`;
    const r = await pool.query(sql, [param, limit]);
    const rows = r.rows || [];
    return res.json({ recommendations: rows });
  } catch (err) {
    console.error('[recommendations] GET / error:', err && err.stack ? err.stack : err);
    return next(err);
  }
});

/**
 * GET /api/recommendations/profiles
 */
router.get('/profiles', authMiddleware, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '200', 10) || 200, 1000);
    // include ordering alias to be safe
    const sql = `
      SELECT u.user_id, COALESCE(u.display_name, u.email) AS display_name, u.email, u.role, tp.*, COALESCE(tp.rating,0) AS _rating_order
      FROM teacher_profiles tp
      JOIN users u ON u.user_id = tp.user_id
      ORDER BY _rating_order DESC NULLS LAST
      LIMIT $1
    `;
    const r = await pool.query(sql, [limit]);
    return res.json({ profiles: r.rows || [] });
  } catch (err) {
    console.error('[recommendations] GET /profiles error:', err && err.stack ? err.stack : err);
    return next(err);
  }
});

/**
 * POST /api/recommendations/teacher/profile
 * Create or update teacher profile. Allowed for admin/management/faculty or the owner.
 */
router.post('/teacher/profile', authMiddleware, async (req, res, next) => {
  try {
    const { user_id, expertise = null, education = null, bio = null, rating = null } = req.body || {};
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    // check referenced user exists
    const userCheck = await pool.query('SELECT user_id, role FROM users WHERE user_id = $1', [user_id]);
    if (!userCheck.rows || userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Referenced user not found' });
    }

    const requester = req.user || {};
    const requesterId = requester.user_id || null;
    const requesterRole = String(requester.role || '').toLowerCase();
    const isPrivileged = ['faculty', 'admin', 'management'].includes(requesterRole);
    const isOwner = requesterId && Number(requesterId) === Number(user_id);
    if (!isPrivileged && !isOwner) return res.status(403).json({ error: 'Forbidden' });

    const cols = await getTeacherProfileCols();
    const hasExpertise = cols.includes('expertise');
    const hasEducation = cols.includes('education');
    const hasBio = cols.includes('bio');
    const hasRating = cols.includes('rating');

    // upsert
    const ex = await pool.query('SELECT id FROM teacher_profiles WHERE user_id = $1', [user_id]);
    if (ex.rows && ex.rows.length > 0) {
      const updates = [];
      const vals = [];
      let idx = 1;
      if (hasExpertise) { updates.push(`expertise = $${idx++}`); vals.push(expertise); }
      if (hasEducation) { updates.push(`education = $${idx++}`); vals.push(education); }
      if (hasBio) { updates.push(`bio = $${idx++}`); vals.push(bio); }
      if (hasRating) { updates.push(`rating = $${idx++}`); vals.push(rating); }
      if (updates.length === 0) {
        return res.json({ updated: ex.rows[0] });
      }
      updates.push(`updated_on = NOW()`);
      const q = `UPDATE teacher_profiles SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING *`;
      vals.push(user_id);
      const up = await pool.query(q, vals);
      return res.json({ updated: up.rows[0] });
    } else {
      const insertCols = ['user_id'];
      const insertVals = ['$1'];
      const vals = [user_id];
      let idx = 2;
      if (hasExpertise) { insertCols.push('expertise'); insertVals.push(`$${idx++}`); vals.push(expertise); }
      if (hasEducation) { insertCols.push('education'); insertVals.push(`$${idx++}`); vals.push(education); }
      if (hasBio) { insertCols.push('bio'); insertVals.push(`$${idx++}`); vals.push(bio); }
      if (hasRating) { insertCols.push('rating'); insertVals.push(`$${idx++}`); vals.push(rating); }
      insertCols.push('created_on'); insertVals.push('NOW()');
      insertCols.push('updated_on'); insertVals.push('NOW()');

      const q = `INSERT INTO teacher_profiles (${insertCols.join(',')}) VALUES (${insertVals.join(',')}) RETURNING *`;
      const ins = await pool.query(q, vals);
      return res.json({ created: ins.rows[0] });
    }
  } catch (err) {
    console.error('[recommendations] POST /teacher/profile error:', err && err.stack ? err.stack : err);
    return next(err);
  }
});

module.exports = router;
