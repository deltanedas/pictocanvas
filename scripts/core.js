const ui = global.ui;

const core = {
	stage: "",
	image: null
};

const stile = (tile, config) => new Schematic.Stile(tile.block(),
	tile.x, tile.y, config, 0);

// canvas to use, not configurable yes
const canvas = Blocks.canvas;
const size = canvas.canvasSize;

core.export = () => {
	const pixmap = core.image;
	// image size -> highest multiple of canvases
	const width = Math.ceil(pixmap.width / size);
	const height = Math.ceil(pixmap.height / size);

	core.stage = "Building...";
	const tiles = Seq.new();
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			// get max 12x12 region of the image
			const region = pixmap.crop(x * size, y * size, size, size);
			// convert pixel data of the region
			const bytes = CanvasBlock.CanvasBuild.packPixmap(region);

			// add canvas to the schematic
			const build = canvas.newBuilding();
			build.tile = new Tile(x * 2, y * 2, Blocks.stone, Blocks.air, canvas);
			tiles.add(stile(build.tile, bytes));
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
