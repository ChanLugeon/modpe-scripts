/**
 * @author Chan Lugeon <chanlugeon@protonmail.com>
 * @version 1.0
 */

const BlockLauncher = net.zhuoweizhang.mcpelauncher,
ScriptManager = BlockLauncher.ScriptManager;

const Help = {};

Help.CONTEXT = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

Help.DP = android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_DIP, 2,
    Help.CONTEXT.getResources().getDisplayMetrics());

Help.RESOURCE_PATH = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() +
    "/games/com.mojang/minecraftResources/";

/**
 * @param {Function} callback
 */
Help.uiThread = function(callback) {
    this.CONTEXT.runOnUiThread({
        run: callback
    });
};

/**
 * @param {String} text
 */
Help.showToast = function(text) {
    this.uiThread(function() {
        android.widget.Toast.makeText(Help.CONTEXT, text, android.widget.Toast.LENGTH_SHORT).show();
    });
};

/**
 * @param {Error} err
 * @return {String}
 */
Help.getErrMsg = function(err) {
    return err + " #" + err.lineNumber;
};

/**
 * @param {ViewGroup} layout
 * @param {View} view
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @return {RelativeLayout}
 */
Help.addView = function(layout, view, x, y, width, height) {
    const subLayout = new android.widget.RelativeLayout(Help.CONTEXT);
    if(x !== undefined && y !== undefined) {
        subLayout.setPadding(x * Help.DP, y * Help.DP, 0, 0);
    }
    if(width === undefined || height === undefined) {
        subLayout.addView(view);
    } else {
        subLayout.addView(view, width * Help.DP, height * Help.DP);
    }
    layout.addView(subLayout);

    return subLayout;
};

/**
 * @param {View} view
 * @param {Number} width
 * @param {Number} height
 * @param {Boolean} focusable
 * @param {Boolean} touchable
 * @return {PopupWindow}
 */
Help.createPw = function(view, width, height, focusable, touchable) {
    const pw = new android.widget.PopupWindow(view, width * Help.DP, height * Help.DP, focusable);
    if(focusable) {
        pw.setBackgroundDrawable(null);
    }
    pw.setTouchable(touchable);

    return pw;
};

/**
 * @param {PopupWindow} pw
 * @param {Number} gravity
 * @param {Number} x
 * @param {Number} y
 */
Help.showPw = function(pw, gravity, x, y) {
    pw.showAtLocation(Help.CONTEXT.getWindow().getDecorView(), gravity, x * Help.DP, y * Help.DP);
};

/**
 * @param {PopupWindow} pw
 */
Help.deletePw = function(pw) {
    pw.dismiss();
    pw = null;
};

/**
 * @param {String} name
 * @return {String}
 */
Help.getI18n= function(name) {
    const i18n = ModPE.getI18n(name);
    return i18n === undefined ? name : i18n;
};

const Screen = {
    WIDTH: Help.CONTEXT.getScreenWidth(),
    HEIGHT: Help.CONTEXT.getScreenHeight()
};

const FontCache = {};

const FontPE = {};

/**
 * Create minecraft font.
 * @param {String} text
 * @param {String} textColor
 * @param {Boolean} isShadow
 * @return {SpannableStringBuilder}
 */
FontPE.createBuilder = function(text, textColor, isShadow) {
    const CACHE = "builder:" + text + ":" + textColor + ":" + isShadow;
    if(TextureCache[CACHE] === undefined) {
        TextureCache[CACHE] = this.isAsciiOnly(text) ? this.getDefaultBuilder(text, textColor, isShadow) :
            this.getGlyphBuilder(text, textColor, isShadow);
    }

    return TextureCache[CACHE];
};

/**
 * @param {String} text
 * @param {String} textColor
 * @param {Boolean} isShadow
 * @return {SpannableStringBuilder}
 */
FontPE.getDefaultBuilder = function(text, textColor, isShadow) {
    if(typeof FontCache["default"] !== "object") {
        FontCache["default"] = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
            "images/font/default8.png"));
    }
    const default8 = FontCache["default"];

    const builder = android.text.SpannableStringBuilder(text);
    const textPaint = new android.graphics.Paint();
    textPaint.setColorFilter(android.graphics.PorterDuffColorFilter(android.graphics.Color.parseColor(textColor),
        android.graphics.PorterDuff.Mode.MULTIPLY)),
    shadowPaint = new android.graphics.Paint();
    shadowPaint.setColorFilter(android.graphics.PorterDuffColorFilter(android.graphics.Color.DKGRAY,
        android.graphics.PorterDuff.Mode.MULTIPLY));

    for(let i = 0, len = text.length; i < len; i++) {
        var charCode = text.charCodeAt(i), font;
        if(charCode === 32) {
            font = android.graphics.Bitmap.createBitmap(5 * Help.DP, 9 * Help.DP, android.graphics.Bitmap.Config.ARGB_8888);
        } else {
            var text_font = android.graphics.Bitmap.createBitmap(default8, (charCode % 16) * 8, Math.floor(charCode / 16) * 8, 8, 8);
            var fontWidth = this.getDefaultX(text_font);
            text_font = android.graphics.Bitmap.createBitmap(text_font, 0, 0, fontWidth, 8);
            font = android.graphics.Bitmap.createBitmap(fontWidth + 1, 9, android.graphics.Bitmap.Config.ARGB_8888);
            var canvas = new android.graphics.Canvas(font);
            if(isShadow) canvas.drawBitmap(text_font, 1, 1, shadowPaint);
            canvas.drawBitmap(text_font, 0, 0, textPaint);
            font = android.graphics.Bitmap.createScaledBitmap(font, (fontWidth + 1) * Help.DP, 9 * Help.DP, false);
        }
        builder.setSpan(android.text.style.ImageSpan(Help.CONTEXT, font), i, i + 1,
            android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    return builder;
};

/**
 * @param {Bitmap} bitmap
 * @return {Number}
 */
FontPE.getDefaultX = function(bitmap) {
    for(let x = 1, w = bitmap.getWidth(); x < w; x += 1) {
        if(bitmap.getPixel(x, 0) === 0 && bitmap.getPixel(x, 1) === 0 && bitmap.getPixel(x, 2) === 0 &&
            bitmap.getPixel(x, 3) === 0 && bitmap.getPixel(x, 4) === 0 && bitmap.getPixel(x, 5) === 0 &&
            bitmap.getPixel(x, 6) === 0 && bitmap.getPixel(x, 7) === 0) {
                return x;
        }
    }

    return 1;
};

/**
 * @param {String} text
 * @param {String} textColor
 * @param {Boolean} isShadow
 * @return {SpannableStringBuilder}
 */
FontPE.getGlyphBuilder = function(text, textColor, isShadow) {
    const builder = android.text.SpannableStringBuilder(text);
    const textPaint = new android.graphics.Paint();
    textPaint.setColorFilter(android.graphics.PorterDuffColorFilter(android.graphics.Color.parseColor(textColor),
        android.graphics.PorterDuff.Mode.MULTIPLY)),
    shadowPaint = new android.graphics.Paint();
    shadowPaint.setColorFilter(android.graphics.PorterDuffColorFilter(android.graphics.Color.DKGRAY,
        android.graphics.PorterDuff.Mode.MULTIPLY));

    for(let i = 0, len = text.length; i < len; i++) {
        var charCode = text.charCodeAt(i), font, hex;
        if(charCode === 32) {
            font = android.graphics.Bitmap.createBitmap(4 * Help.DP, 9 * Help.DP, android.graphics.Bitmap.Config.ARGB_8888);
        } else {
            hex = Math.floor(charCode / 256).toString(16);
            if(hex.length === 1) hex = "0" + hex;
            hex = hex.toUpperCase();
            if(typeof FontCache[hex] !== "object") {
                FontCache[hex] = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
                    "images/font/glyph_" + hex + ".png"));
            }
            var glyph = FontCache[hex], text_font, blankNum = 2, isAscii = hex === "00";

            if(isAscii) {
                text_font = android.graphics.Bitmap.createBitmap(glyph, (charCode % 16) * 16,
                    Math.floor(charCode / 16) * 16, 16, 16);
            } else {
                text_font = android.graphics.Bitmap.createBitmap(glyph, (charCode % 256 % 16) * 16,
                    Math.floor(charCode % 256 / 16) * 16, 16, 16);
            }

            var startX = this.getGlyphLeftX(text_font);
            var fontWidth = this.getGlyphRightX(text_font) - startX;
            if(i === len - 1) {
                blankNum = 1;
            } else if(isAscii) {
                if(fontWidth === 1 || fontWidth >= 7) blankNum++;
            } else {
                if(fontWidth >= 13 || fontWidth <= 9) blankNum ++;
            }

            text_font = android.graphics.Bitmap.createBitmap(text_font, startX, 0, fontWidth, 16);
            font = android.graphics.Bitmap.createBitmap(fontWidth + blankNum, 17, android.graphics.Bitmap.Config.ARGB_8888);
            var canvas = new android.graphics.Canvas(font);
            if(isAscii && fontWidth === 1) {
                if(isShadow) canvas.drawBitmap(text_font, 2, 1, shadowPaint);
                canvas.drawBitmap(text_font, 1, 0, textPaint);
            } else {
            if(isShadow) canvas.drawBitmap(text_font, 1, 1, shadowPaint);
            canvas.drawBitmap(text_font, 0, 0, textPaint);
            }
            font = android.graphics.Bitmap.createScaledBitmap(font, (fontWidth + blankNum) / 2 * Help.DP, 9 * Help.DP, false);
        }
        builder.setSpan(android.text.style.ImageSpan(Help.CONTEXT, font), i, i + 1,
            android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    return builder;
};

/**
 * @param {Bitmap} bitmap
 * @return {Number}
 */
FontPE.getGlyphLeftX = function(bitmap) {
    for(let x = 0; x <= 15; x++) {
        if(bitmap.getPixel(x, 0) !== 0 || bitmap.getPixel(x, 1) !== 0 || bitmap.getPixel(x, 2) !== 0 ||
            bitmap.getPixel(x, 3) !== 0 || bitmap.getPixel(x, 4) !== 0 || bitmap.getPixel(x, 5) !== 0 ||
            bitmap.getPixel(x, 6) !== 0 || bitmap.getPixel(x, 7) !== 0 || bitmap.getPixel(x, 8) !== 0 ||
            bitmap.getPixel(x, 9) !== 0 || bitmap.getPixel(x, 10) !== 0 || bitmap.getPixel(x, 11) !== 0 ||
            bitmap.getPixel(x, 12) !== 0 || bitmap.getPixel(x, 13) !== 0 || bitmap.getPixel(x, 14) !== 0 ||
            bitmap.getPixel(x, 15) !== 0) {
                return x;
        }
    }

    return 0;
};

/**
 * @param {Bitmap} bitmap
 * @return {Number}
 */
FontPE.getGlyphRightX = function(bitmap) {
    for(let x = 15; x > 0; x--) {
        if(bitmap.getPixel(x, 0) !== 0 || bitmap.getPixel(x, 1) !== 0 || bitmap.getPixel(x, 2) !== 0 ||
            bitmap.getPixel(x, 3) !== 0 || bitmap.getPixel(x, 4) !== 0 || bitmap.getPixel(x, 5) !== 0 ||
            bitmap.getPixel(x, 6) !== 0 || bitmap.getPixel(x, 7) !== 0 || bitmap.getPixel(x, 8) !== 0 ||
            bitmap.getPixel(x, 9) !== 0 || bitmap.getPixel(x, 10) !== 0 || bitmap.getPixel(x, 11) !== 0 ||
            bitmap.getPixel(x, 12) !== 0 || bitmap.getPixel(x, 13) !== 0 || bitmap.getPixel(x, 14) !== 0 ||
            bitmap.getPixel(x, 15) !== 0) {
                return x + 1;
        }
    }

    return 16;
};

/**
 * @param {String} str
 * @return {Boolean}
 */
FontPE.isAsciiOnly = function(str) {
    for(let i = 0, len = str.length; i < len; i++) {
        if(str.charCodeAt(i) > 127) {
            return false;
        }
    }

    return true;
};

const Texture = {};

/**
 * @param {Bitmap} bitmap
 * @param {Number} x
 * @param {Number} y
 * @param {Number} xx
 * @param {Number} yy
 * @param {Number} width
 * @param {Number} height
 */
Texture.scaledPatch = function(bitmap, x, y, xx, yy, width, height) {
    const bw = bitmap.getWidth(), bh = bitmap.getHeight();

    const Bitmap = android.graphics.Bitmap;

    const patchBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888),
    canvas = new android.graphics.Canvas(patchBitmap);

    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, 0, y, x, yy - y), x, height - (y + (bh - yy)), false), 0, y, null); //LEFT
    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, xx, y, bw - xx, yy - y), (bw - xx), height - (y + (bh - yy)), false), width - (bw - xx), y, null); //RIGHT
    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, x, 0, xx - x, y), width - (x + (bw - xx)), y, false), x, 0, null); //TOP
    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, x, yy, xx - x, bh - yy), width - (x + (bw - xx)), bh - yy, false), x, height - (bh - yy), null); //BOTTOM
    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, 0, 0, x, y), x, y, false), 0, 0, null); //LEFT_TOP
    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, xx, 0, bw - xx, y), bw - xx, y, false), width - (bw - xx), 0, null); //RIGHT_TOP
    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, 0, yy, x, bh - yy), x, bh - yy, false), 0, height - (bh - yy), null); //LEFT_BOTTOM
    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, xx, yy, bw - xx, bh - yy), bw - xx, bh - yy, false), width - (bw - xx), height - (bh - yy), null); //RIGHT_BOTTOM
    canvas.drawBitmap(Bitmap.createScaledBitmap(Bitmap.createBitmap(
        bitmap, x, y, xx - x, yy - y), width - (x + (bw - xx)), height - (y + (bh - yy)), false), x, y, null); //CENTER

    return Bitmap.createScaledBitmap(patchBitmap, width * Help.DP, height * Help.DP, false);
};

/** BITMAP CONSTANTS */
Texture.gui = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
    "images/gui/gui.png"));
Texture.inventory_slot = android.graphics.Bitmap.createBitmap(Texture.gui, 200, 46, 16, 16);
Texture.interact_button = android.graphics.Bitmap.createBitmap(Texture.gui, 0, 164, 118, 20);

Texture.spritesheet = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
    "images/gui/spritesheet.png"));
Texture.button = android.graphics.Bitmap.createBitmap(Texture.spritesheet, 8, 32, 8, 8);
Texture.button_pushed = android.graphics.Bitmap.createBitmap(Texture.spritesheet, 0, 32, 8, 8);
Texture.image_button = android.graphics.Bitmap.createBitmap(Texture.spritesheet, 112, 0, 8, 67);
Texture.image_button_pushed = android.graphics.Bitmap.createBitmap(Texture.spritesheet, 120, 0, 8, 67);
Texture.close = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.spritesheet, 60, 0, 18, 18), 19 * Help.DP, 19 * Help.DP, false);
Texture.close_pushed = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.spritesheet, 78, 0, 18, 18), 19 * Help.DP, 19 * Help.DP, false);
Texture.window = android.graphics.Bitmap.createBitmap(Texture.spritesheet, 34, 43, 14, 14);
Texture.b_window = android.graphics.Bitmap.createBitmap(Texture.spritesheet, 0, 0, 16, 16);

Texture.touchgui = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
    "images/gui/touchgui.png"));
Texture.slider_handle = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.touchgui, 225, 125, 11, 17), 11 * Help.DP * (Help.DP / 2), 17 * Help.DP * (Help.DP / 2), false); //WH * 3
Texture.switch = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.touchgui, 160, 206, 38, 19), 38 * Help.DP, 19 * Help.DP, false);
Texture.switch_on = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.touchgui, 198, 206, 38, 19), 38 * Help.DP, 19 * Help.DP, false);
{ //CREATE HEADER BITMAP
    let header_bitmap = android.graphics.Bitmap.createBitmap(12, 28, android.graphics.Bitmap.Config.ARGB_8888);
    let canvas = new android.graphics.Canvas(header_bitmap);
    canvas.drawBitmap(android.graphics.Bitmap.createBitmap(Texture.touchgui, 150, 26, 2, 24), 0, 0, null); //left
    canvas.drawBitmap(android.graphics.Bitmap.createBitmap(Texture.touchgui, 153, 26, 8, 24), 2, 0, null); //center
    canvas.drawBitmap(android.graphics.Bitmap.createBitmap(Texture.touchgui, 162, 26, 2, 24), 10, 0, null); //right
    canvas.drawBitmap(android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
        Texture.touchgui, 153, 52, 8, 3), 12, 3, false), 0, 24, null); //bottom

    Texture.header = header_bitmap;
};

Texture.bg32 = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
    "images/gui/bg32.png"));

Texture.items = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack
    ("images/items-opaque.png"));
Texture.terrain = BlockLauncher.texture.tga.TGALoader.load(ModPE.openInputStreamFromTexturePack
    ("images/terrain-atlas.tga"), false);

{ //CREATE META OBJECT
    let items_meta = JSON.parse(new java.lang.String(ModPE.getBytesFromTexturePack("images/items.meta")));
    for(let i = 0, len = items_meta.length; i < len; i++) {
        Texture["i" + items_meta[i].name] = items_meta[i].uvs;
    }
    let terrain_meta = JSON.parse(new java.lang.String(ModPE.getBytesFromTexturePack("images/terrain.meta")));
    for(let i = 0, len = terrain_meta.length; i < len; i++) {
        Texture["t" + terrain_meta[i].name] = terrain_meta[i].uvs;
    }
}

/**
 * @param {String} iconName
 * @param {Number} num
 * @return {Bitmap}
 */
Texture.getItem = function(iconName, num) {
    let data = Texture["i" + iconName];
    return android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap
        (Texture.items, data[num][0], data[num][1], data[num][2] - data[num][0],
        data[num][3] - data[num][1]),16 * Help.DP, 16 * Help.DP, false);
};

/**
 * @param {String} iconName
 * @param {Number} num
 * @return {Bitmap}
 */
Texture.getTerrain = function(iconName, num) {
    let data = Texture["t" + iconName];
    return android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap
        (Texture.terrain, data[num][0], data[num][1], data[num][2] - data[num][0],
        data[num][3] - data[num][1]),16 * Help.DP, 16 * Help.DP, false);
};

const TextureCache = {}; //FOR FAST LOAD

const ViewPE = {};

/**
 * @param {String} text
 * @param {String} color
 * @param {Boolean} isShadow
 * @return {TextView}
 */
ViewPE.createText = function(text, color, isShadow) {
    const view = new android.widget.TextView(Help.CONTEXT);
    view.setText(FontPE.createBuilder(text, color, isShadow));

    return view;
};

/**
 * INCOMPLETE FUNCTION
 * @param {String} text
 * @param {String} hintText
 * @param {Number} width
 * @param {Function} callback
 * @return {EditText}
 */
ViewPE.createInputBox = function(text, hintText, width, callback) {
    const view = new android.widget.EditText(Help.CONTEXT);
    const background = new android.graphics.drawable.GradientDrawable();
    background.setColor(android.graphics.Color.parseColor("#393939"));
    background.setStroke(Help.DP, android.graphics.Color.parseColor("#717171"));
    view.setBackgroundDrawable(background);
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width * Help.DP, 15 * Help.DP));

    return view;
};

/**
 * @param {String} text
 * @param {String} color
 * @param {Number} width
 * @param {Number} height
 * @param {Function} callback
 * @return {Button}
 */
ViewPE.createButton = function(text, color, width, height, callback) {
    const builder = FontPE.createBuilder(text, color, true),
    builder_pushed = FontPE.createBuilder(text, "#ffffa1", true),
    CACHE = "button:" + width + ":" + height;
    var button, button_pushed;
    if(TextureCache[CACHE] === undefined) {
        button = android.graphics.drawable.BitmapDrawable(Texture.scaledPatch(
            Texture.button, 1, 1, 7, 7, width, height)),
        button_pushed = android.graphics.drawable.BitmapDrawable(Texture.scaledPatch(
            Texture.button_pushed, 1, 1, 7, 7, width, height));
        TextureCache[CACHE] = [button, button_pushed];
    } else {
        button = TextureCache[CACHE][0],
        button_pushed = TextureCache[CACHE][1];
    }

    const view = new android.widget.Button(Help.CONTEXT);
    view.setBackgroundDrawable(button);
    view.setText(builder);
    view.setPadding(0, Help.DP, 0, 0);

    width *= Help.DP, height *= Help.DP;
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            switch(event.getAction()) {
                case android.view.MotionEvent.ACTION_DOWN:
                    view.setBackgroundDrawable(button_pushed);
                    view.setText(builder_pushed);
                    view.setPadding(0, 3 * Help.DP, 0, 0);
                    break;

                case android.view.MotionEvent.ACTION_UP:
                    if(!(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height)) {
                        view.setBackgroundDrawable(button);
                        view.setText(builder);
                        view.setPadding(0, Help.DP, 0, 0);
                        SoundPE.playClick();
                        callback();
                    }
                    break;

                case android.view.MotionEvent.ACTION_MOVE:
                    if(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height) {
                        view.setBackgroundDrawable(button);
                        view.setText(builder);
                        view.setPadding(0, Help.DP, 0, 0);
                    } else {
                        view.setBackgroundDrawable(button_pushed);
                        view.setText(builder_pushed);
                        view.setPadding(0, 3 * Help.DP, 0, 0);
                    }
                    break;
            }
            return true;
        }
    }));

    return view;
};

/**
 * @param {String} text
 * @param {String} color
 * @param {Number} width
 * @param {Number} height
 * @param {Boolean} isCheck
 * @param {Function} callback
 * @return {ToggleButton}
 */
ViewPE.createToggleButton = function(text, color, width, height, isCheck, callback) {
    const builder = FontPE.createBuilder(text, color, true),
    builder_pushed = FontPE.createBuilder(text, "#ffffa1", true),
    CACHE = "button:" + width + ":" + height;
    var button, button_pushed;
    if(TextureCache[CACHE] === undefined) {
        button = android.graphics.drawable.BitmapDrawable(Texture.scaledPatch(
            Texture.button, 1, 1, 7, 7, width, height)),
        button_pushed = android.graphics.drawable.BitmapDrawable(Texture.scaledPatch(
            Texture.button_pushed, 1, 1, 7, 7, width, height));
        TextureCache[CACHE] = [button, button_pushed];
    } else {
        button = TextureCache[CACHE][0],
        button_pushed = TextureCache[CACHE][1];
    }

    const view = new android.widget.ToggleButton(Help.CONTEXT);
    view.setTextOn(builder_pushed);
    view.setTextOff(builder);
    view.setChecked(isCheck);
    if(isCheck) {
        view.setBackgroundDrawable(button_pushed);
        view.setPadding(0, 3 * Help.DP, 0, 0);
    } else {
        view.setBackgroundDrawable(button);
        view.setPadding(0, Help.DP, 0, 0);
    }

    width *= Help.DP, height *= Help.DP;
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            switch(event.getAction()) {
                case android.view.MotionEvent.ACTION_DOWN:
                    const checked = !view.isChecked();
                    view.setChecked(checked);
                    if(checked) {
                        view.setBackgroundDrawable(button_pushed);
                        view.setPadding(0, 3 * Help.DP, 0, 0);
                    } else {
                        view.setBackgroundDrawable(button);
                        view.setPadding(0, Help.DP, 0, 0);
                    }
                    callback(checked);
                    break;

                case android.view.MotionEvent.ACTION_UP:
                    if(!(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height)) {
                        SoundPE.playClick();
                    }
                    break;
            }
            return true;
        }
    }));

    return view;
};

/**
 * @param {Bitmap} image
 * @param {Number} width
 * @param {Number} height
 * @param {Function} callback
 * @return {ImageButton}
 */
ViewPE.createImageButton = function(image, width, height, callback) {
    const image_pushed = android.graphics.Bitmap.createScaledBitmap(
        image, image.getWidth() - Help.DP / 2, image.getHeight() - Help.DP / 2, false),
    CACHE = "img_btn:" + width + ":" + height;
    var button, button_pushed;
    if(TextureCache[CACHE] === undefined) {
        button = android.graphics.drawable.BitmapDrawable(Texture.scaledPatch(
        Texture.image_button, 2, 2, 6, 65, width, height)),
        button_pushed = android.graphics.drawable.BitmapDrawable(Texture.scaledPatch(
        Texture.image_button_pushed, 2, 2, 6, 65, width, height));
        TextureCache[CACHE] = [button, button_pushed];
    } else {
        button = TextureCache[CACHE][0],
        button_pushed = TextureCache[CACHE][1];
    }

    const view = new android.widget.ImageButton(Help.CONTEXT);
    view.setBackgroundDrawable(button);
    view.setImageBitmap(image);

    width *= Help.DP, height *= Help.DP;
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            switch(event.getAction()) {
                case android.view.MotionEvent.ACTION_DOWN:
                    view.setBackgroundDrawable(button_pushed);
                    view.setImageBitmap(image_pushed);
                    break;

                case android.view.MotionEvent.ACTION_UP:
                    if(!(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height)) {
                        view.setBackgroundDrawable(button);
                        view.setImageBitmap(image);
                        SoundPE.playClick();
                        callback();
                    }
                    break;

                case android.view.MotionEvent.ACTION_MOVE:
                    if(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height) {
                        view.setBackgroundDrawable(button);
                        view.setImageBitmap(image);
                    } else {
                        view.setBackgroundDrawable(button_pushed);
                        view.setImageBitmap(image_pushed);
                    }
                    break;
            }
            return true;
        }
    }));

    return view;
};

/**
 * @param {Boolean} isCheck
 * @param {Function} callback
 * @return {ToggleButton}
 */
ViewPE.createSwitch = function(isCheck, callback) {
    const width = 38 * Help.DP, height = 19 * Help.DP;

    const view = new android.widget.ToggleButton(Help.CONTEXT);
    view.setText("");
    view.setTextOn("");
    view.setTextOff("");
    view.setChecked(isCheck);
    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(isCheck ?
        Texture.switch_on : Texture.switch));
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            if(event.getAction() === android.view.MotionEvent.ACTION_DOWN) {
                const checked = !view.isChecked();
                view.setChecked(checked);
                view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(checked ?
                    Texture.switch_on : Texture.switch));
                callback(checked);
            }
            return true;
        }
    }));

    return view;
};

/**
 * @param {Number} width
 * @param {Number} maxValue
 * @param {Number} setValue
 * @param {String} color
 * @return {ProgressBar}
 */
ViewPE.createProgressBar = function(width, maxValue, setValue, color) {
    const view = new android.widget.ProgressBar(Help.CONTEXT, null,
        android.R.attr.progressBarStyleHorizontal);
    view.getProgressDrawable().setDrawableByLayerId(android.R.id.progress,
        new android.graphics.drawable.ClipDrawable(android.graphics.drawable.ColorDrawable(
        android.graphics.Color.parseColor(color)), android.view.Gravity.LEFT,
        android.graphics.drawable.ClipDrawable.HORIZONTAL));
    view.getProgressDrawable().setDrawableByLayerId(android.R.id.background,
        android.graphics.drawable.ColorDrawable(android.graphics.Color.parseColor("#565855")));
    view.setMax(maxValue);
    view.setProgress(setValue);
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width * Help.DP, 2 * Help.DP));

    return view;
};

/**
 * @param {Number} width
 * @param {Number} maxValue
 * @param {Number} setValue
 * @param {Function} callback
 * @return {SeekBar}
 */
ViewPE.createSlider = function(width, maxValue, setValue, callback) {
    const softValue = width;
    width *= Help.DP;
    const height = 17 * Help.DP,
    CACHE = "slider:" + width + ":" + maxValue >= 10 ? -1 : maxValue;

    const view = new android.widget.SeekBar(Help.CONTEXT);
    view.setThumb(android.graphics.drawable.BitmapDrawable(Texture.slider_handle));
    view.setProgressDrawable(null);

    var bitmap;
    if(TextureCache[CACHE] === undefined) {
        bitmap = android.graphics.Bitmap.createBitmap(width, height,
            android.graphics.Bitmap.Config.ARGB_8888);
        let canvas = new android.graphics.Canvas(bitmap),
        paint = new android.graphics.Paint();
        paint.setColor(android.graphics.Color.parseColor("#717171"));
        canvas.drawRect(7 * Help.DP, 7 * Help.DP, width - 7 * Help.DP, 10 * Help.DP, paint);
        if(maxValue < 10) { //isDot
            let dotPaint = new android.graphics.Paint();
            dotPaint.setColor(android.graphics.Color.parseColor("#929292"));
            for(var i = 0; i <= maxValue; i++) {
                let x = 7 * Help.DP + i * (width - 18 * Help.DP) / maxValue;
                canvas.drawRect(x, 5 * Help.DP, x + 4 * Help.DP, 12 * Help.DP, dotPaint); //DRAW DOT
            }
        }
        TextureCache[CACHE] = bitmap;
    } else {
        bitmap = TextureCache[CACHE];
    }

    if(maxValue < 10) { //FOR SOFT SLIDE
        view.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({
            onStopTrackingTouch: function(view) {
                const value = view.getProgress();
                const gap = softValue / maxValue;
                var setValue = 0;
                for(var i = 0; i <= maxValue; i++) {
                    if(value < gap * (i + 0.5)) {
                        setValue = i;
                        break;
                    }
                }
                view.setProgress(softValue / maxValue * setValue);
                callback(setValue);
            }
        }));
        view.setMax(softValue);
        view.setProgress(softValue / maxValue * setValue);
    } else {
        view.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({
            onStopTrackingTouch: function(view) {
                callback(view.getProgress());
            }
        }));
        view.setMax(maxValue);
        view.setProgress(setValue);
    }

    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(bitmap));
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    return view;
};

const ArrowType = {
    DOWN: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 3,
    JUMP: 4
};

const BackgroundType = {
    DARK: 0,
    DIRT: 1,
    WINDOW: 2
};

const ViewUtil = {};

/**
 * INCOMPLETE FUNCTION
 * @param {Number} arrowType
 * @param {Number} width
 * @param {Number} height
 * @param {Boolean} isTouching
 * @return {Button}
 */
ViewUtil.createArrowButton = function(type, width, height, isTouching) {
    width *= Help.DP, height *= Help.DP;

    const view = new android.widget.Button(Help.CONTEXT);
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    const CACHE = "arrow:" + type + ":" + width + ":" + height;
    if(TextureCache[CACHE] === undefined) {
        switch(type) {
            case ArrowType.DOWN:
                TextureCache[CACHE] = android.graphics.Bitmap.createBitmap(Texture.gui, 54, 109, 22, 22);
                break;
            case ArrowType.LEFT:
                TextureCache[CACHE] = android.graphics.Bitmap.createBitmap(Texture.gui, 28, 109, 22, 22);
                break;
            case ArrowType.RIGHT:
                TextureCache[CACHE] = android.graphics.Bitmap.createBitmap(Texture.gui, 80, 109, 22, 22);
                break;
            case ArrowType.UP:
                TextureCache[CACHE] = android.graphics.Bitmap.createBitmap(Texture.gui, 2, 109, 22, 22);
                break;
            case ArrowType.JUMP:
                TextureCache[CACHE] = android.graphics.Bitmap.createBitmap(Texture.gui, 108, 111, 18, 18);
                break;
        }
        TextureCache[CACHE] = android.graphics.Bitmap.createScaledBitmap(TextureCache[CACHE], width, height, false);
    }
    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(TextureCache[CACHE]));

    return view;
};

/**
 * @param {Function} callback
 * @return {Button}
 */
ViewUtil.createCloseButton = function(callback) {
    const width = 19 * Help.DP, height = 19 * Help.DP;

    const close = android.graphics.drawable.BitmapDrawable(Texture.close),
    close_pushed = android.graphics.drawable.BitmapDrawable(Texture.close_pushed);

    const view = new android.widget.Button(Help.CONTEXT);
    view.setBackgroundDrawable(close);
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            switch(event.getAction()) {
                case android.view.MotionEvent.ACTION_DOWN:
                    view.setBackgroundDrawable(close_pushed);
                    break;

                case android.view.MotionEvent.ACTION_UP:
                    if(!(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height)) {
                        view.setBackgroundDrawable(close);
                        SoundPE.playClick();
                        callback();
                    }
                    break;

                case android.view.MotionEvent.ACTION_MOVE:
                    if(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height) {
                        view.setBackgroundDrawable(close);
                    } else {
                        view.setBackgroundDrawable(close_pushed);
                    }
                    break;
            }
            return true;
        }
    }));

    return view;
};

/**
 * @param {String} text
 * @param {Number} width
 * @param {Number} height
 * @param {Boolean} isTranslucent
 * @param {Function} callback
 * @return {Button}
 */
ViewUtil.createInteractButton = function(text, width, height, isTranslucent, callback) {
    width *= Help.DP, height *= Help.DP;
    const CACHE = "inter" + width + ":" + height + ":" + isTranslucent;

    var button = Texture.interact_button;
    if(isTranslucent) {
        let alpha_bitmap = android.graphics.Bitmap.createBitmap(118, 20,
            android.graphics.Bitmap.Config.ARGB_8888),
        paint = new android.graphics.Paint();
        paint.setAlpha(162);
        new android.graphics.Canvas(alpha_bitmap)
            .drawBitmap(button, 0, 0, paint);
        button = alpha_bitmap;
    }

    const view = new android.widget.Button(Help.CONTEXT);
    if(TextureCache[CACHE] === undefined) {
        TextureCache[CACHE] = android.graphics.Bitmap.createScaledBitmap(button, width, height, false);
    }
    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(TextureCache[CACHE]));
    view.setText(FontPE.createBuilder(text, "#e1e1e1", false));
    view.setPadding(0, Help.DP, 0, 0);

    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            if(event.getAction() === android.view.MotionEvent.ACTION_DOWN) {
                callback();
            }
            return true;
        }
    }));

    return view;
};

/**
 * @param {String} text
 * @param {Number} width
 * @return {Button}
 */
ViewUtil.createHeader = function(text, width) {
    const height = 28,
    CACHE = "header:" + width;

    const view = new android.widget.Button(Help.CONTEXT);
    if(TextureCache[CACHE] === undefined) {
        TextureCache[CACHE] = Texture.scaledPatch(Texture.header, 2, 2, 10, 23, width, height);
    }
    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(TextureCache[CACHE]));
    view.setText(FontPE.createBuilder(text, "#e1e1e1", true));
    view.setPadding(0, -2 * Help.DP, 0, 0);
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width * Help.DP, height * Help.DP));

    return view;
};

/**
 * @param {Bitmap} image
 * @param {Number} width
 * @param {Number} height
 * @param {Function} callback
 * @return {ImageButton}
 */
ViewUtil.createInventorySlot = function(image, width, height, callback) {
    width *= Help.DP, height *= Help.DP;

    const image_pushed = android.graphics.Bitmap.createScaledBitmap(
        image, image.getWidth() - (Help.DP / 2), image.getHeight() - (Help.DP / 2), false),
    CACHE = "inv_slot:" + width + ":" + height;
    
    if(TextureCache[CACHE] === undefined) {
        TextureCache[CACHE] = android.graphics.Bitmap.createScaledBitmap(
        Texture.inventory_slot, width, height, false);
    }
    const view = new android.widget.ImageButton(Help.CONTEXT);
    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(TextureCache[CACHE]));
    view.setImageBitmap(image);
    view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(width, height));

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            switch(event.getAction()) {
                case android.view.MotionEvent.ACTION_DOWN:
                    view.setImageBitmap(image_pushed);
                    break;

                case android.view.MotionEvent.ACTION_UP:
                    if(!(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height)) {
                        view.setImageBitmap(image);
                        SoundPE.playClick();
                        callback();
                    }
                    break;

                case android.view.MotionEvent.ACTION_MOVE:
                    if(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height) {
                        view.setImageBitmap(image);
                    } else {
                        view.setImageBitmap(image_pushed);
                    }
                    break;
            }
            return true;
        }
    }));

    return view;
};

/**
 * @param {Number} type
 * @param {Number} width
 * @param {Number} height
 * @return {Bitmap}
 */
ViewUtil.createBgBitmap = function(type, width, height) {
    const CACHE = "bg_img:" + type + ":" + width + ":" + height;

    if(TextureCache[CACHE] === undefined) {
        switch(type) {
            case BackgroundType.DARK: {
                let bitmap = android.graphics.Bitmap.createBitmap(width * Help.DP, height * Help.DP,
                    android.graphics.Bitmap.Config.ARGB_8888);
                new android.graphics.Canvas(bitmap)
                    .drawColor(android.graphics.Color.parseColor("#80000000"));
                TextureCache[CACHE]  = bitmap;
                break;
            }

            case BackgroundType.DIRT: {
                let bitmap = android.graphics.Bitmap.createBitmap(width, height,
                    android.graphics.Bitmap.Config.ARGB_8888),
                canvas = new android.graphics.Canvas(bitmap);
                if(width < width - width % 32) width += 32;
                if(height < height - height % 32) height += 32;
                for(let w = 0; w <= width; w += 32) {
                    for(let h = 0; h <= height; h += 32) {
                        canvas.drawBitmap(Texture.bg32, w, h, null);
                    }
                }
                TextureCache[CACHE] = android.graphics.Bitmap.createScaledBitmap(bitmap, width * Help.DP, height * Help.DP, false);
                break;
            }

            case BackgroundType.WINDOW:
                TextureCache[CACHE] = Texture.scaledPatch(Texture.window, 2, 2, 11, 11, width, height);
                break;

            case BackgroundType.B_WINDOW:
                TextureCache[CACHE] = Texture.scaledPatch(Texture.b_window, 4, 4, 12, 12, width, height);
                break;

            default:
                return null;
        }
    }

    return TextureCache[CACHE];
};

const SoundPE = {};

SoundPE.SoundPool = android.media.SoundPool(5, android.media.AudioManager.STREAM_SYSTEM, 0);
SoundPE.DOWNLOAD_LINK = "url";
SoundPE.click = null;

/**
 * If have not sound file, create download window.
 */
SoundPE.downloadResource = function() {
    if(java.io.File(Help.RESOURCE_PATH + "click.m4a").exists()) {
        this.click = this.SoundPool.load(Help.RESOURCE_PATH + "click.m4a", 1);
    } else {
        Help.uiThread(function() {
            try {
                const isKr = ModPE.getLanguage() === "ko_KR";
                const width = Screen.WIDTH / Help.DP,
                    height = Screen.HEIGHT / Help.DP;

                const layout = new android.widget.RelativeLayout(Help.CONTEXT);
                Help.addView(layout, ViewPE.createText("ViewPE Library made by Chan", "#ffffff"), 1, 1);

                const text = ViewPE.createText(isKr ? "효과음 파일이 필요합니다." : "Sound file is needed.",
                    "#e1e1e1");
                text.setGravity(android.view.Gravity.CENTER);
                Help.addView(layout, text, width / 4, height / 2.5, width / 2, 17);

                var pw, buttonLayout;

                const button = ViewPE.createButton(isKr ? "다운로드" : "Download", "#e1e1e1", 100, 30, function() {
                    pw.dismiss();
                    java.io.File(Help.RESOURCE_PATH).mkdirs();
                    java.io.File(Help.RESOURCE_PATH + ".nomedia").createNewFile();
                    const request = new android.app.DownloadManager.Request(new android.net.Uri.parse(
                        SoundPE.DOWNLOAD_LINK));
                    request.setTitle("click.m4a");
                    request.setDestinationInExternalPublicDir("/games/com.mojang/minecraftResources/", "click.m4a");
                    Help.CONTEXT.getSystemService(android.content.Context.DOWNLOAD_SERVICE).enqueue(request);
                    SoundPE.finishCall(isKr);
                });
                buttonLayout = Help.addView(layout, button, (width - 100) / 2, height / 1.75, 100, 30);

                pw = Help.createPw(layout, width, height, true, true);
                pw.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(
                    ViewUtil.createBgBitmap(BackgroundType.DARK, width, height)));
                Help.showPw(pw, android.view.Gravity.CENTER, 0, 0);
            } catch(err) {
                Help.showToast(Help.getErrMsg(err));
            }
        });
    }
};

/**
 * @param {Boolean} isKr
 */ 
SoundPE.finishCall = function(isKr) {
    if(java.io.File(Help.RESOURCE_PATH + "click.m4a").exists()) {
        Help.showToast(isKr ? "다운로드 완료" : "Download Finish");
        this.click = this.SoundPool.load(Help.RESOURCE_PATH + "click.m4a", 1);
    } else {
        java.lang.Thread(1000);
        SoundPE.finishCall(isKr);
    }
};

/**
 * Play sound "click.m4a"
 */
SoundPE.playClick = function() {
    if(this.click !== null) {
        this.SoundPool.play(this.click, 0.1, 0.1, 0, 0, 1);
    }
};



////////////////////////////////

const Spawn = {};

Spawn.VERSION = "1.0";
Spawn.DEBUG = false;
Spawn.TEST_ID = 15;
Spawn.SPAWNER_ID = 52;
Spawn.EGG_ID = 383;
Spawn.ENTITY_NAME_CODE = [["entity.Bat.name", 19], []];
//META NUM, ENTITY CODE
Spawn.EGG_DAM = [[15, 15], [1, 10], [2, 11], [3, 12], [4, 13], [5, 14], [17, 22], [6, 16], [19, 19], [25, 18], [7, 33], [8, 38], [9, 39], [10, 34], [11, 37],
    [12, 35], [13, 32], [14, 36], [16, 17], [23, 40], [18, 45], [21, 42], [20, 41], [22, 43]];
Spawn.BTN = [["entity.IronGolem.name", 20], ["entity.SnowMan.name", 21], ["entity.ZombieVillager.name", 44]];

Spawn.createScreen = function(x, y, z) {
    Help.uiThread(function() {
        try {
            const mainLayout = new android.widget.RelativeLayout(Help.CONTEXT);

            const header = ViewUtil.createHeader(ScriptManager.nativeGetItemName(Spawn.SPAWNER_ID, 0, false) + "", Screen.WIDTH / Help.DP);
            mainLayout.addView(header);
            const goBlog = ViewPE.createButton("Website", "#e1e1e1", 46, 18, function() {
                Help.CONTEXT.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(
                    "url")));
            });
            Help.addView(mainLayout, goBlog, 4, 4);

            var pw;

            const closeButton = ViewUtil.createCloseButton(function() {
                Help.deletePw(pw);
            });
            Help.addView(mainLayout, closeButton, Screen.WIDTH / Help.DP - 19, 1);

            const buttonLayout = new android.widget.GridLayout(Help.CONTEXT);
            buttonLayout.setColumnCount(11);

            const scroll = new android.widget.ScrollView(Help.CONTEXT);
            scroll.setVerticalScrollBarEnabled(false);
            //scroll.addView(buttonLayout);
            const textLayout = new android.widget.LinearLayout(Help.CONTEXT);
            textLayout.setOrientation(android.widget.LinearLayout.VERTICAL);
            scroll.addView(textLayout);
            textLayout.addView(buttonLayout);
            Help.addView(mainLayout, scroll, 8, 28, Screen.WIDTH / Help.DP - 16, Screen.HEIGHT / Help.DP - 34);

            var entButton = [], entLayout = [], pad = 2 * Help.DP;
            for(let i = 0, len = Spawn.EGG_DAM.length; i < len; i++) {
                entLayout[i] = new android.widget.RelativeLayout(Help.CONTEXT);
                buttonLayout.addView(entLayout[i]);
                (function(ii, _, __, ___) {
                entButton[ii] = ViewUtil.createInventorySlot(Texture.getItem("spawn_egg", Spawn.EGG_DAM[ii][0]),
                    26, 26,
                    function() {
                        Help.deletePw(pw);
                        ScriptManager.nativeSpawnerSetEntityType(_, __, ___, Spawn.EGG_DAM[ii][1]);
                        ScriptManager.nativeShowTipMessage("\n\n" + ScriptManager.nativeGetItemName(Spawn.EGG_ID, Spawn.EGG_DAM[ii][1], false));
                    });
                })(i, x, y, z);
                //entLayout[i].setPadding(pad, pad, pad, pad);
                entLayout[i].addView(entButton[i]);
            }

            const snowLayout = new android.widget.LinearLayout(Help.CONTEXT);
            textLayout.addView(snowLayout);
            //Help.addView(textLayout, snowLayout, 0, pad);
            var snowBtn = [], snowGroup = [];
            for(let i = 0, len = Spawn.BTN.length; i < len; i++) {
                snowGroup[i] = new android.widget.RelativeLayout(Help.CONTEXT);
                snowLayout.addView(snowGroup[i]);
                (function(ii, _, __, ___) {
                snowBtn[ii] = ViewPE.createButton(Help.getI18n(Spawn.BTN[ii][0]), "#e1e1e1",
                    82, 26,
                    function() {
                        Help.deletePw(pw);
                        ScriptManager.nativeSpawnerSetEntityType(_, __, ___, Spawn.BTN[ii][1]);
                        ScriptManager.nativeShowTipMessage("\n\n" + Help.getI18n(Spawn.BTN[ii][0]));
                    });
                })(i, x, y, z);
                snowGroup[i].setPadding(0, pad * 2, pad * 2, 0);
                snowGroup[i].addView(snowBtn[i]);
            }

            const whoCreated = ViewPE.createText("Created by Chan", "#e1e1e1", true);
            whoCreated.setPadding(pad, 8 * Help.DP, 0, pad);
            textLayout.addView(whoCreated);
            const versionText = ViewPE.createText("v" + Spawn.VERSION, "#ffffa1", true);
            versionText.setPadding(pad, pad, pad, pad);
            textLayout.addView(versionText);

            pw = Help.createPw(mainLayout, Screen.WIDTH / Help.DP, Screen.HEIGHT / Help.DP, true, true);
            pw.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(
                ViewUtil.createBgBitmap(BackgroundType.B_WINDOW, Screen.WIDTH / Help.DP, Screen.HEIGHT / Help.DP)));
            Help.showPw(pw, android.view.Gravity.LEFT | android.view.Gravity.TOP, 0, 0);
        } catch(err) {
            Help.showToast(Help.getErrMsg(err));
        }
    });
};

const useItem = function(x, y, z, itemId, blockId) {
    if(blockId === Spawn.SPAWNER_ID) {
        ScriptManager.nativePreventDefault();
        Spawn.createScreen(x, y, z);
    }

    if(Spawn.DEBUG)
        ScriptManager.nativeSpawnerSetEntityType(x, y, z, Spawn.TEST_ID);
};

const chatHook = function(str) {
    if(Spawn.DEBUG) {
        Spawn.TEST_ID = str - 0;
    }
};

SoundPE.downloadResource();