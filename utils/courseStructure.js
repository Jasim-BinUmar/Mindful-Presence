/**
 * Course structure helpers for sections + standalone lessons.
 * Structure response: { success, data: { sections: Section[], standaloneLessons: Lesson[] } }
 * Section: { _id, title, description?, order, courseId, lessons: Lesson[] }
 * Lesson: { _id, title, order, courseId, sectionId: string | null, ... }
 */

export function getAllLessonsInDisplayOrder(structure) {
  if (!structure || typeof structure !== 'object') return [];
  const sections = Array.isArray(structure.sections) ? structure.sections : [];
  const standalone = Array.isArray(structure.standaloneLessons) ? structure.standaloneLessons : [];
  const sortedSections = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const result = [];
  for (const section of sortedSections) {
    const lessons = Array.isArray(section.lessons) ? section.lessons : [];
    const sortedLessons = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    result.push(...sortedLessons);
  }
  const sortedStandalone = [...standalone].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  result.push(...sortedStandalone);
  return result;
}
