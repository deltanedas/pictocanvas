function diff(a, b) {
	// hue is more important than others
	const dh = Math.abs(a[0] - b[0]) * 2,
		ds = Math.abs(a[1] - b[1]),
		dv = Math.abs(a[2] - b[2]);
	return dh + ds + dv;
}

// Thread-local Tmp.c1
const tmp = new Color();
module.exports = (core, pixmap) => {
	const palette = [];
	const rgbPalette = core.canvas.palette;
	// convert palette to hsv
	for (var i in rgbPalette) {
		let raw = rgbPalette[i];
		tmp.set(raw);
		palette[i] = [raw, Color.RGBtoHSV(tmp)];
	}

	const percent = pixmap.width / 100;
	for (var x = 0; x < pixmap.width; x++) {
		core.stage = "HSV Indexing: " + Math.floor(x / percent) + "%";
		for (var y = 0; y < pixmap.height; y++) {
			var raw = pixmap.get(x, y);
			var pixel = tmp.set(raw);
			pixel = Color.RGBtoHSV(pixel);

			var closest = null, egg = 10000;
			for (var other of palette) {
				let h = diff(pixel, other[1]);
				if (h < egg) {
					closest = other[0];
				}
			}

			pixmap.set(x, y, closest);
		}
	}
};
