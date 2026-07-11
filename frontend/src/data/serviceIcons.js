import roadMaintenance from '../assets/services/road-maintenance.png';
import wasteManagement from '../assets/services/waste-management.png';
import waterSupply from '../assets/services/water-supply.png';
import streetLighting from '../assets/services/street-lighting.png';
import drainage from '../assets/services/drainage.png';
import buildingPermits from '../assets/services/building-permits.png';
import defaultService from '../assets/services/road-maintenance.png';

export const SERVICE_ICONS = {
  roadMaintenance,
  wasteManagement,
  waterSupply,
  streetLighting,
  drainageIssues: drainage,
  buildingPermits,
};

export const DEFAULT_SERVICE_ICON = defaultService;

export function getServiceIcon(iconKey) {
  return SERVICE_ICONS[iconKey] || DEFAULT_SERVICE_ICON;
}
