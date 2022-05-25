// Default indexer, is colourblind but clean
const rgb = require("pictocanvas/indexer_rgb");
// Proper indexer, respects colour hue but FIXME adds grey noise for some reason
const hsv = require("pictocanvas/indexer_hsv");

module.exports = (core, pixmap) => {
	(core.hsv ? hsv : rgb)(core, pixmap);
};
