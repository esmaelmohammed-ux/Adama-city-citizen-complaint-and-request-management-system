export async function generateReferenceId(Model, prefix) {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-`);
  const count = await Model.countDocuments({ referenceId: pattern });
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}-${seq}`;
}
