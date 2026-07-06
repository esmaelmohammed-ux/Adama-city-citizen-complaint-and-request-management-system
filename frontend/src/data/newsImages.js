import digitalServicesLaunch from '../assets/news/digital-services-launch.png';
import roadRehabilitation from '../assets/news/road-rehabilitation.png';
import waterSupplyUpdate from '../assets/news/water-supply-update.png';

export const NEWS_IMAGES = {
  digitalServicesLaunch,
  roadRehabilitation,
  waterSupplyUpdate,
};

export const DEFAULT_NEWS_IMAGE = digitalServicesLaunch;

export function getNewsImage(imageKey) {
  return NEWS_IMAGES[imageKey] || DEFAULT_NEWS_IMAGE;
}
