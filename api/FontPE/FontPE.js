/**
 * @author Chan Lugeon <chanlugeon@protonmail.com>
 */

const Help = {};

Help.CONTEXT = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

Help.DP = android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_DIP, 2,
    Help.CONTEXT.getResources().getDisplayMetrics());

/**
 * @param {Function} callback
 */
Help.uiThread = function(callback) {
    Help.CONTEXT.runOnUiThread(new java.lang.Runnable({
        run: callback
    }));
};

/**
 * @param {String} text
 */
Help.showToast = function(text) {
    Help.uiThread(function() {
        android.widget.Toast.makeText(Help.CONTEXT, text, android.widget.Toast.LENGTH_SHORT).show();
    });
};

/**
 * @param {Error} err
 * @return {String}
 */
Help.getErrMsg = function(err) {
    return err.type + ": " + err.message + " #" + err.lineNumber;
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
        let charCode = text.charCodeAt(i), font;
        if(charCode === 32) {
            font = android.graphics.Bitmap.createBitmap(5 * Help.DP, 9 * Help.DP, android.graphics.Bitmap.Config.ARGB_8888);
        } else {
            let text_font = android.graphics.Bitmap.createBitmap(default8, (charCode % 16) * 8, Math.floor(charCode / 16) * 8, 8, 8);
            let fontWidth = this.getDefaultX(text_font);
            text_font = android.graphics.Bitmap.createBitmap(text_font, 0, 0, fontWidth, 8);
            font = android.graphics.Bitmap.createBitmap(fontWidth + 1, 9, android.graphics.Bitmap.Config.ARGB_8888);
            let canvas = new android.graphics.Canvas(font);
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
        let charCode = text.charCodeAt(i), font, hex;
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
            let glyph = FontCache[hex], text_font, blankNum = 2, isAscii = hex === "00";

            if(isAscii) {
                text_font = android.graphics.Bitmap.createBitmap(glyph, (charCode % 16) * 16,
                    Math.floor(charCode / 16) * 16, 16, 16);
            } else {
                text_font = android.graphics.Bitmap.createBitmap(glyph, (charCode % 256 % 16) * 16,
                    Math.floor(charCode % 256 / 16) * 16, 16, 16);
            }

            let startX = this.getGlyphLeftX(text_font),
            fontWidth = this.getGlyphRightX(text_font) - startX;
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

const TextureCache = {};

/**
 * TEST CODE (Example)
 */
const Debug = {};

Debug.TEXT = null;
Debug.PW = null;

Debug.createTextView = function() {
    Help.uiThread(function() {
        try {
            const text = new android.widget.TextView(Help.CONTEXT);
            text.setGravity(android.view.Gravity.CENTER);
            text.setPadding(0, -4*Help.DP, 0, 0);
            const builder = FontPE.createBuilder("TEST", "#ffffa1");
            text.setText(builder);

            const pw = new android.widget.PopupWindow(text, 80*Help.DP, 18*Help.DP, false);
            pw.setTouchable(false);
            pw.setBackgroundDrawable(android.graphics.drawable.ColorDrawable(android.graphics.Color.parseColor("#aaaaaa")));
            pw.showAtLocation(Help.CONTEXT.getWindow().getDecorView(), android.view.Gravity.TOP, 0, 30*Help.DP);

            Debug.TEXT = text;
            Debug.PW = pw;
        } catch(err) {
            Help.showToast(Help.getErrMsg(err));
        }
    });
};

const chatHook = function(str) {
    Help.uiThread(function() {
        try {
            Debug.TEXT.setText(FontPE.createBuilder(str, "#ffffa1"));
        } catch(err) {
            Help.showToast(Help.getErrMsg(err));
        }
    });
};

const newLevel = function() {
    Debug.createTextView();
};

const leaveGame = function() {
    Help.uiThread(function() {
        try {
            Debug.PW.dismiss();
        } catch(err) {}
    });
};