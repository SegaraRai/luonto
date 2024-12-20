export const NOW_UPDATE_INTERVAL_ERROR_CONTENT = 500;
export const NOW_UPDATE_INTERVAL_DEVICE_SENSORS = 1000;

export const REFRESH_INTERVAL_HOME = 90_000;
export const REFRESH_INTERVAL_APPLIANCE_PAGE = REFRESH_INTERVAL_HOME;
export const REFRESH_INTERVAL_DEVICE_PAGE = REFRESH_INTERVAL_HOME;

export const SWIPE_THRESHOLD_DISTANCE_AC_TEMPERATURE = 1;

export const STYLE_CLICKABLE_CARD =
  "[.group:where(:disabled,[aria-disabled=true])_&]:opacity-60 [.group:where(:enabled,:any-link)_&]:hover:bg-gray-50 [.group:where(:enabled,:any-link)_&]:dark:hover:bg-gray-800";

export const STYLE_FOCUS_VISIBLE_RING =
  "focus:outline-none focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400";

export const STYLE_FOCUS_VISIBLE_RING_GROUP =
  "group-focus:outline-none group-focus-visible:outline-0 group-focus-visible:ring-2 group-focus-visible:ring-primary-500 dark:group-focus-visible:ring-primary-400";
