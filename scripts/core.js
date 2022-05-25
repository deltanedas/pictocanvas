const ui = global.ui;
const indexer = require("pictocanvas/indexer");

const core = {
	// TODO: settings dialog again yes
	canvas: Blocks.canvas,
	size: Blocks.canvas.canvasSize,
	hsv: false,

	stage: "",
	image: null
};

core.export = () => {
	const pixmap = core.image;
	const canvas = core.canvas;
	const size = core.size;
	// image size -> highest multiple of canvases
	const width = Math.ceil(pixmap.width / size);
	const height = Math.ceil(pixmap.height / size);

	core.stage = "Indexing...";
	indexer(core, pixmap);

	core.stage = "Building...";
	const tiles = new Seq();
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			// add canvas to the schematic
			let build = canvas.newBuilding();
			// get max 12x12 region of the image
			let region = pixmap.crop(x * size, y * size, size, size);
			// convert pixel data of the region
			let bytes = build.packPixmap(region);
			let stile = new Schematic.Stile(canvas, x * 2, y * 2, bytes, 0);
			tiles.add(stile);
		}
	}

	core.stage = "Saving...";
	// Create a schematic
	const tags = new StringMap();
	tags.put("name", "!!name me");
	const schem = new Schematic(tiles, tags, width, height);
	// Import it
	Vars.schematics.add(schem);
	// Select it
	Vars.ui.schematics.hide();
	Vars.control.input.useSchematic(schem);

	core.stage = "";
};

module.exports = core;
