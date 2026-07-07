import abebeGirma from '../assets/testimonials/abebe-girma.png';
import fatumaAhmed from '../assets/testimonials/fatuma-ahmed.png';
import bekeleTadesse from '../assets/testimonials/bekele-tadesse.png';

export const TESTIMONIAL_AVATARS = {
  abebeGirma,
  fatumaAhmed,
  bekeleTadesse,
};

export function getTestimonialAvatar(avatarKey) {
  return TESTIMONIAL_AVATARS[avatarKey] || abebeGirma;
}
