import { category, navbar } from "@/constant/hebrew";
import { CtgAttractionIcon, CtgCultureIcon, CtgEatIcon, CtgLocalIcon, CtgLodgeIcon, CtgTourIcon } from "@/components/ui/icons";

export const categoryGradientClasses: any = {
  eat: 'from-ctg-eat-dim via-ctg-eat-light to-ctg-eat-dim',
  local: 'from-ctg-local-dim via-ctg-local-light to-ctg-local-dim',
  lodge: 'from-ctg-lodge-dim via-ctg-lodge-light to-ctg-lodge-dim',
  culture: 'from-ctg-culture-dim via-ctg-culture-light to-ctg-culture-dim',
  attraction: 'from-ctg-attract-dim via-ctg-attract-light to-ctg-attract-dim',
  tour: 'from-ctg-tour-dim via-ctg-tour-light to-ctg-tour-dim',
};

export const categoryBgClasses: any = {
  eat: 'bg-ctg-eat-dark',
  local: 'bg-ctg-local-dark',
  lodge: 'bg-ctg-lodge-dark',
  culture: 'bg-ctg-culture-dark',
  attraction: 'bg-ctg-attract-dark',
  tour: 'bg-ctg-tour-dark',
};

export const categories = [
  {
    key: "tour",
    icon: CtgTourIcon,
    label: category.tours,
    bg: "bg-ctg-tour-dark"
  },
  {
    key: "attraction",
    icon: CtgAttractionIcon,
    label: category.attractions,
    bg: "bg-ctg-attract-dark"
  },
  {
    key: "eat",
    icon: CtgEatIcon,
    label: category.eater,
    bg: "bg-ctg-eat-dark"
  },
  {
    key: "culture",
    icon: CtgCultureIcon,
    label: category.culture,
    bg: "bg-ctg-culture-dark"
  },
  {
    key: "lodge",
    icon: CtgLodgeIcon,
    label: category.lodge,
    bg: "bg-ctg-lodge-dark"
  },
  {
    key: "local",
    icon: CtgLocalIcon,
    label: category.local,
    bg: "bg-ctg-local-dark"
  }
]

export const features = [
  {
    key: 1,
    label: navbar.funDays,
    icon: 'kite',
  },
  {
    key: 2,
    label: navbar.toGroups,
    icon: 'user-group',
  },
  {
    key: 3,
    label: navbar.events,
    icon: 'events'
  },
  {
    key: 4,
    label: navbar.tracks,
    icon: 'trail'
  }
]

export const filterTabs = [
  {
    key: "gallery",
    label: navbar.gallery,
    icon: "dashboard"
  },
  {
    key: "integrated",
    label: navbar.integrated,
    icon: "dashboard-space"
  },
  {
    key: "map",
    label: navbar.map,
    icon: "map-fold"
  },
]

export const foodSubCategories = [
  { id: 1, label: "מסעדות" },        // Restaurants  
  { id: 2, label: "בתי קפה" },       // Cafés  
  { id: 3, label: "מאפיות" },        // Bakeries  
  { id: 4, label: "דוכני רחוב" },    // Street Food  
  { id: 5, label: "גלידריות" },       // Ice Cream Shops  
  { id: 6, label: "מסעדות טבעוניות" }, // Vegan Restaurants  
  { id: 7, label: "מסעדות כשרות" },  // Kosher Restaurants  
  { id: 8, label: "ברים ופאבים" },    // Bars & Pubs  
  { id: 9, label: "מסעדות אסיאתיות" }, // Asian Restaurants  
  { id: 10, label: "פוד טראקס" }     // Food Trucks
];



const selectedTheme = { colors: { primary: "#fff" } }

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
