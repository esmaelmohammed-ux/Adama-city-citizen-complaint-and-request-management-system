const REF_FIELDS = [
  'citizenId',
  'departmentId',
  'assignedOfficerId',
  'userId',
  'entityId',
  'relatedEntityId',
  'changedBy',
];

function normalizeRef(value) {
  if (value == null) return null;
  if (typeof value === 'object' && value._id) return value._id.toString();
  return value.toString();
}

export function toClient(doc) {
  if (!doc) return null;

  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : { ...doc };

  obj.id = (obj._id || obj.id)?.toString();
  delete obj._id;
  delete obj.__v;
  delete obj.passwordHash;
  delete obj.password;

  for (const field of REF_FIELDS) {
    if (obj[field] != null) {
      obj[field] = normalizeRef(obj[field]);
    }
  }

  return obj;
}

export function toClientList(docs) {
  return docs.map((doc) => toClient(doc));
}
