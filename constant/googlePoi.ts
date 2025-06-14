
export const googlePointOfInterest = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.attraction",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.place_of_worship",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

export const customMapStyle = `
 .gm-style-iw {
  background-color: #fff !important;
  padding: 0 !important;
  box-shadow: none !important;
  min-width: 100px !important; /* Minimum width to ensure readability */
  max-width: 500px !important; /* Maximum width to prevent excessive stretching */
  width: auto !important; /* Allow width to adjust based on content */
}
.gm-style-iw .gm-style-iw-d {
  overflow: hidden !important;
  max-width: 100% !important; /* Ensure content doesn't exceed max-width */
}

 .gm-style-iw .gm-style-iw-ch {
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
    flex-grow: 1;
    -webkit-flex-shrink: 1;
    flex-shrink: 1;
    padding-top: 10px;
    overflow: hidden;
}
.gm-style-iw + div {
  display: none !important; /* Hide close button */
}
.custom-popup {
  margin: 0;
  color: #fff;
  position: relative;
  white-space: nowrap; /* Prevent text wrapping to calculate width based on content */
}
.custom-popup h2 {
  margin: 0;
  padding: 10px 20px;
  margin-top: -10px;
  font-size: 14px;
  white-space: nowrap; /* Ensure text stays on one line */
}
.gm-ui-hover-effect {
  display: none !important; /* Hide hover effect */
}
`;
