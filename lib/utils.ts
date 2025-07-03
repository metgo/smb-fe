import { events, misc, navbar } from "@/constant/hebrew";
import {
  CtgAttractionIcon,
  CtgCultureIcon,
  CtgEatIcon,
  CtgLocalIcon,
  CtgLodgeIcon,
  CtgTourIcon,
} from "@/components/ui/icons";

const categoryId = {
  sleep: "6566fcd4a77d2a477266d3b9",
  attraction: "6566e31ca77d2a477266d2d6",
  culture: "6566e36ba77d2a477266d2f4",
  tour: "6566e256a77d2a477266d2c0",
  eat: "6566e3aaa77d2a477266d314",
  local: "6566fd7fa77d2a477266d3ca",
};

const navigationKey = {
  home: "/",
  events: "/events",
  businesses: "/businesses",
};

export const businessMarkers = {
  [categoryId.eat]: "food.svg",
  [categoryId.local]: "local.svg",
  [categoryId.sleep]: "sleep.svg",
  [categoryId.culture]: "culture.svg",
  [categoryId.attraction]: "attractions.svg",
  [categoryId.tour]: "travel.svg",
};

export const categoryGradientClasses = {
  [categoryId.eat]: "from-ctg-eat-dim via-ctg-eat-light to-ctg-eat-dim",
  [categoryId.local]: "from-ctg-local-dim via-ctg-local-light to-ctg-local-dim",
  [categoryId.sleep]: "from-ctg-lodge-dim via-ctg-lodge-light to-ctg-lodge-dim",
  [categoryId.culture]:
    "from-ctg-culture-dim via-ctg-culture-light to-ctg-culture-dim",
  [categoryId.attraction]:
    "from-ctg-attract-dim via-ctg-attract-light to-ctg-attract-dim",
  [categoryId.tour]: "from-ctg-tour-dim via-ctg-tour-light to-ctg-tour-dim",
};

export const categoryGradinteColor = {
  [categoryId.eat]: { dim: "#F7BCAC", light: "#F8CBBF" },
  [categoryId.local]: { dim: "#F9D385", light: "#F9DEA7" },
  [categoryId.sleep]: { dim: "#90BBE3", light: "#A2C6E6" },
  [categoryId.culture]: { dim: "#F1A7C9", light: "#F3BDD6" },
  [categoryId.attraction]: { dim: "#CEA7CE", light: "#D9BCD9" },
  [categoryId.tour]: { dim: "#64C5C6", light: "#8ED4D5" },
};

export const categoryBgClasses = {
  [categoryId.eat]: "bg-ctg-eat-dark",
  [categoryId.local]: "bg-ctg-local-dark",
  [categoryId.sleep]: "bg-ctg-lodge-dark",
  [categoryId.culture]: "bg-ctg-culture-dark",
  [categoryId.attraction]: "bg-ctg-attract-dark",
  [categoryId.tour]: "bg-ctg-tour-dark",
};

export const shareKeepNavigate = [
  {
    id: 1,
    label: misc.navigation,
    icon: "navigation",
  },
  // {
  //   id: 2,
  //   label: misc.keeping,
  //   icon: "heart",
  // },
  {
    id: 3,
    label: misc.sharing,
    icon: "share",
  },
];

export const eventFeatures = [
  {
    id: 1,
    label: events.evening,
    icon: "",
  },
  {
    id: 2,
    label: events.couples,
    icon: "",
  },
  {
    id: 3,
    label: events.accessible,
    icon: "",
  },
  {
    id: 4,
    label: events.paid,
    icon: "",
  },
  {
    id: 5,
    label: events.families,
    icon: "",
  },
  {
    id: 6,
    label: events.children,
    icon: "",
  },
  {
    id: 7,
    label: events.kosher,
    icon: "",
  },
];

export const categoryIcons = {
  [categoryId.tour]: {
    icon: CtgTourIcon,
    bg: "bg-ctg-tour-dark",
  },
  [categoryId.attraction]: {
    icon: CtgAttractionIcon,
    bg: "bg-ctg-attract-dark",
  },
  [categoryId.eat]: {
    icon: CtgEatIcon,
    bg: "bg-ctg-eat-dark",
  },
  [categoryId.culture]: {
    icon: CtgCultureIcon,
    bg: "bg-ctg-culture-dark",
  },
  [categoryId.sleep]: {
    icon: CtgLodgeIcon,
    bg: "bg-ctg-lodge-dark",
  },
  [categoryId.local]: {
    icon: CtgLocalIcon,
    bg: "bg-ctg-local-dark",
  },
};

export const features = [
  {
    key: 1,
    label: navbar.funDays,
    icon: "kite",
    activeIcon: "",
    link: "",
  },
  {
    key: 2,
    label: navbar.toGroups,
    icon: "user-group",
    activeIcon: "",
    link: "",
  },
  {
    key: 3,
    label: navbar.events,
    icon: "events",
    activeIcon: "events-dark",
    link: "/events",
  },
  {
    key: 4,
    label: navbar.tracks,
    icon: "trail",
    activeIcon: "trail-dark",
    link: "/trails",
  },
];

export const filterTabs = [
  {
    key: "gallery",
    label: navbar.gallery,
    icon: "dashboard",
  },
  {
    key: "integrated",
    label: navbar.integrated,
    icon: "dashboard-space",
  },
  {
    key: "map",
    label: navbar.map,
    icon: "map-fold",
  },
];

const selectedTheme = { colors: { primary: "#fff" } };

export const navigationPaths = {
  [navigationKey.home]: "/business-details",
  [navigationKey.businesses]: "/business-details",
  [navigationKey.events]: "/event-details",
};

// ----------- Google map ------------------------
export const addMapTypeControl = (googleMap: google.maps.Map) => {
  const mapTypeControlDiv = document.createElement("div");
  mapTypeControlDiv.style.backgroundColor = "#fff";
  mapTypeControlDiv.style.border = "2px solid #fff";
  mapTypeControlDiv.style.borderRadius = "3px";
  mapTypeControlDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  mapTypeControlDiv.style.margin = "10px";
  mapTypeControlDiv.style.textAlign = "center";
  mapTypeControlDiv.style.display = "flex";

  const streetButton = document.createElement("button");
  streetButton.textContent = "רְחוֹב";
  streetButton.style.padding = "8px 15px";
  streetButton.style.fontSize = "16px";
  streetButton.style.border = "none";
  streetButton.style.cursor = "pointer";
  streetButton.style.backgroundColor =
    googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP
      ? selectedTheme.colors.primary
      : "#fff";
  streetButton.style.color =
    googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP
      ? "#fff"
      : "#000";
  streetButton.style.transition = "background-color 0.3s, color 0.3s";

  const satelliteButton = document.createElement("button");
  satelliteButton.textContent = "לוויין";
  satelliteButton.style.padding = "8px 15px";
  satelliteButton.style.fontSize = "16px";
  satelliteButton.style.border = "none";
  satelliteButton.style.cursor = "pointer";
  satelliteButton.style.backgroundColor =
    googleMap.getMapTypeId() === google.maps.MapTypeId.HYBRID
      ? selectedTheme.colors.primary
      : "#fff";
  satelliteButton.style.color =
    googleMap.getMapTypeId() === google.maps.MapTypeId.HYBRID ? "#fff" : "#000";
  satelliteButton.style.transition = "background-color 0.3s, color 0.3s";

  const updateButtonStyles = () => {
    const isRoadmap =
      googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP;
    streetButton.style.backgroundColor = isRoadmap
      ? selectedTheme.colors.primary
      : "#fff";
    streetButton.style.color = isRoadmap ? "#fff" : "#000";
    satelliteButton.style.backgroundColor = !isRoadmap
      ? selectedTheme.colors.primary
      : "#fff";
    satelliteButton.style.color = !isRoadmap ? "#fff" : "#000";
  };

  streetButton.addEventListener("click", (e) => {
    e.preventDefault();
    googleMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    updateButtonStyles();
  });

  satelliteButton.addEventListener("click", (e) => {
    e.preventDefault();
    googleMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
    updateButtonStyles();
  });

  googleMap.addListener("maptypeid_changed", updateButtonStyles);

  mapTypeControlDiv.appendChild(streetButton);
  mapTypeControlDiv.appendChild(satelliteButton);

  const controlPosition = google.maps.ControlPosition.LEFT_BOTTOM;
  googleMap.controls[controlPosition].push(mapTypeControlDiv);
};
