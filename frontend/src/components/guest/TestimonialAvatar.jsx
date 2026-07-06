import { getTestimonialAvatar } from '../../data/testimonialImages';

export default function TestimonialAvatar({ avatarKey, name }) {
  return (
    <span className="guest-avatar">
      <img
        src={getTestimonialAvatar(avatarKey)}
        alt={name}
        className="guest-avatar-img"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
