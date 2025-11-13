// server/services/recommendationService.js
// lightweight recommendation logic used by route

function normalizeArr(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(x => String(x).toLowerCase());
  if (typeof v === 'string') {
    try { return JSON.parse(v).map(x => String(x).toLowerCase()); }
    catch (e) { return v.split(',').map(x => x.trim().toLowerCase()).filter(Boolean); }
  }
  return [];
}

function scoreFaculty(studentInterests, facultyRows) {
  studentInterests = normalizeArr(studentInterests);
  const setA = new Set(studentInterests);

  const scored = facultyRows.map(fr => {
    const expertise = normalizeArr(fr.expertise_areas);
    const setB = new Set(expertise);
    let inter = 0;
    setA.forEach(x => { if (setB.has(x)) inter++; });
    const union = new Set([...setA, ...setB]).size || 1;
    const jaccard = inter / union;
    const score = inter * 2 + jaccard;
    return {
      faculty_id: fr.faculty_id,
      name: fr.name,
      email: fr.email,
      department: fr.department,
      designation: fr.designation,
      availability_status: fr.availability_status,
      expertise_areas: expertise,
      match: {
        intersection_count: inter,
        union_size: union,
        jaccard: Number(jaccard.toFixed(3)),
        score: Number(score.toFixed(3))
      }
    };
  });

  scored.sort((a, b) => {
    if (b.match.score !== a.match.score) return b.match.score - a.match.score;
    return b.match.intersection_count - a.match.intersection_count;
  });

  return scored;
}

module.exports = { normalizeArr, scoreFaculty };
