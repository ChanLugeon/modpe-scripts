/**
 * @author Chan Lugeon <chanlugeon@protonmail.com>
 * @version 3.0
 */

const VERSION = "3.0";

const SM = net.zhuoweizhang.mcpelauncher.ScriptManager;

Help = {};

Help.CONTEXT = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

Help.DP = android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_DIP, 2, Help.CONTEXT.getResources().getDisplayMetrics());

Help.DIR = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + "/games/com.mojang/minecraftResources/";

Help.uiThread = function(callback) {
    Help.CONTEXT.runOnUiThread(new java.lang.Runnable({
        run: callback
    }));
};

Help.makeToast = function(text) {
    Help.uiThread(function() {
        android.widget.Toast.makeText(Help.CONTEXT, text, android.widget.Toast.LENGTH_LONG).show();
    });
};

Help.getErrMsg = function(err) {
    return err.type + ": " + err.message + " #" + err.lineNumber;
};

Help.addView = function(layout, view, x, y, width, height) {
    const LAYOUT = new android.widget.RelativeLayout(Help.CONTEXT);
    LAYOUT.setPadding(x * Help.DP, y * Help.DP, 0, 0);
    LAYOUT.addView(view, width * Help.DP, height * Help.DP);
    layout.addView(LAYOUT);
};

FontPE = {};

FontPE.cache = {};

FontPE.getFontImage = function(text, color) {
    if(text === "") return null;

    if(FontPE.isAsciiOnly(text)) {
        return FontPE.getDefaultImage(text, color);
    } else {
        return FontPE.getGlyphImage(text, color);
    }
};

FontPE.getDefaultImage = function(str, color) {
    const LEN = str.length;
    var default8;
    if(typeof FontPE.cache["default"] !== "object") {
        default8 = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
            "images/font/default8.png"));
        FontPE.cache["default"] = default8;
    } else {
        default8 = FontPE.cache["default"];
    }

    const BITMAP = android.graphics.Bitmap.createBitmap(9*LEN, 9, android.graphics.Bitmap.Config.ARGB_8888);
    const CANVAS = new android.graphics.Canvas(BITMAP);
    const COLOR = new android.graphics.Paint();
    COLOR.setColorFilter(android.graphics.PorterDuffColorFilter(android.graphics.Color.parseColor(color),
        android.graphics.PorterDuff.Mode.MULTIPLY));
    const SHADOW = new android.graphics.Paint();
    SHADOW.setColorFilter(android.graphics.PorterDuffColorFilter(android.graphics.Color.DKGRAY,
        android.graphics.PorterDuff.Mode.MULTIPLY));
    const SPACE = new android.graphics.Paint();
    SPACE.setColor(android.graphics.Color.parseColor("#01000000"));

    var char, font, x = 0;
    for(var i = 0; i < LEN; i ++) {
        char = str.charCodeAt(i);
        if(char === 32) { //space
            CANVAS.drawRect(x+4, 0, 1, 1, SPACE);
        } else {
            font = android.graphics.Bitmap.createBitmap(default8, (char%16)*8, Math.floor(char/16)*8, 8, 8);
            CANVAS.drawBitmap(font, x+1, 1, SHADOW);
            CANVAS.drawBitmap(font, x, 0, COLOR);
        }
        x = FontPE.getDefaultDrawX(BITMAP, x);
    }
    return android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
        BITMAP, 0, 0, x, 9), x*Help.DP, 9*Help.DP, false);
};

FontPE.getGlyphImage = function(str, color) {
    const LEN = str.length;

    const BITMAP = android.graphics.Bitmap.createBitmap(18*LEN, 17, android.graphics.Bitmap.Config.ARGB_8888);
    const CANVAS = new android.graphics.Canvas(BITMAP);
    const COLOR = new android.graphics.Paint();
    COLOR.setColorFilter(android.graphics.PorterDuffColorFilter(android.graphics.Color.parseColor(color),
        android.graphics.PorterDuff.Mode.MULTIPLY));
    const SHADOW = new android.graphics.Paint();
    SHADOW.setColorFilter(android.graphics.PorterDuffColorFilter(android.graphics.Color.DKGRAY,
        android.graphics.PorterDuff.Mode.MULTIPLY));

    var char, font, x = 0, glyph, hex, fontX;
    for(var i = 0; i < LEN; i ++) {
        char = str.charCodeAt(i);
        if(char === 32) { //space
            x += 9;
        } else {
            hex = Math.floor(char/256).toString(16);
            if(hex.length === 1) hex = "0" + hex;
            hex = hex.toUpperCase();
            if(typeof FontPE.cache[hex] !== "object") {
                glyph = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
                    "images/font/glyph_"+hex+".png"));
                FontPE.cache[hex] = glyph;
            } else {
                glyph = FontPE.cache[hex];
            }

            if(char > 256) {
                font = android.graphics.Bitmap.createBitmap(glyph, (char%256%16)*16, Math.floor(char%256/16)*16, 16, 16);
            } else {
                font = android.graphics.Bitmap.createBitmap(glyph, (char%16)*16, Math.floor(char/16)*16, 16, 16);

                fontX = FontPE.getGlyphFontX(font);
                if(fontX !== 0) {
                    font = android.graphics.Bitmap.createBitmap(font, fontX, 0, 16-fontX, 16);
                }
            }

            CANVAS.drawBitmap(font, x+1, 1, SHADOW);
            CANVAS.drawBitmap(font, x, 0, COLOR);
            x = FontPE.getGlyphDrawX(BITMAP, x, hex === "00", i === LEN - 1);
        }
    }

    return android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
        BITMAP, 0, 0, x, 17), (x*Help.DP)/2, (17*Help.DP)/2, false);
};

FontPE.blankPatch = function(bitmap, gravity, plusX, plusY, width, height) {
    const WIDTH = width * Help.DP;
    const HEIGHT = height * Help.DP;

    const BITMAP = android.graphics.Bitmap.createBitmap(WIDTH, HEIGHT, android.graphics.Bitmap.Config.ARGB_8888);
    const CANVAS = new android.graphics.Canvas(BITMAP);

    var x = 0, y = 0;
    switch(gravity) {
        case android.view.Gravity.LEFT:
            x = 0;
            y = (HEIGHT-bitmap.getHeight()) / 2;
            break;

        case android.view.Gravity.RIGHT:
            x = WIDTH - bitmap.getWidth();
            y = (HEIGHT-bitmap.getHeight()) / 2;
            break;

        case android.view.Gravity.CENTER:
            x = (WIDTH-bitmap.getWidth()) / 2;
            y = (HEIGHT-bitmap.getHeight()) / 2;
            break;

        case android.view.Gravity.TOP:
            x = (WIDTH-bitmap.getWidth()) / 2;
            y = 0;
            break;

        case android.view.Gravity.BOTTOM:
            x = (WIDTH-bitmap.getWidth()) / 2;
            y = HEIGHT - bitmap.getHeight();
            break;
    }

        CANVAS.drawBitmap(bitmap, x+plusX*Help.DP, y+plusY*Help.DP, null);
    return BITMAP;
};

FontPE.isAsciiOnly = function(str) {
    for(var i = 0, len = str.length; i < len; i ++)
        if(str.charCodeAt(i) > 127)
            return false;

    return true;
};

FontPE.getDefaultDrawX = function(bitmap, startX) {
    for(var x = startX+2, w = bitmap.getWidth(); x < w; x ++)
        if(bitmap.getPixel(x, 0) === 0 && bitmap.getPixel(x, 1) === 0 && bitmap.getPixel(x, 2) === 0 &&
            bitmap.getPixel(x, 3) === 0 && bitmap.getPixel(x, 4) === 0 && bitmap.getPixel(x, 5) === 0 &&
            bitmap.getPixel(x, 6) === 0 && bitmap.getPixel(x, 7) === 0 && bitmap.getPixel(x, 8) === 0)
            return x;

    return 0;
};

FontPE.getGlyphDrawX = function(bitmap, startX, isAscii, isLast) {
    for(var x = startX+(isAscii ? 4 : 11), w = bitmap.getWidth(); x < w; x ++)
        if(bitmap.getPixel(x, 0) === 0 && bitmap.getPixel(x, 2) === 0 && bitmap.getPixel(x, 4) === 0 &&
            bitmap.getPixel(x, 6) === 0 && bitmap.getPixel(x, 8) === 0 && bitmap.getPixel(x, 10) === 0 &&
            bitmap.getPixel(x, 12) === 0 && bitmap.getPixel(x, 14) === 0 && bitmap.getPixel(x, 16) === 0 &&
            bitmap.getPixel(x+1, 0) === 0 && bitmap.getPixel(x+1, 2) === 0 && bitmap.getPixel(x+1, 4) === 0 &&
            bitmap.getPixel(x+1, 6) === 0 && bitmap.getPixel(x+1, 8) === 0 && bitmap.getPixel(x+1, 10) === 0 &&
            bitmap.getPixel(x+1, 12) === 0 && bitmap.getPixel(x+1, 14) === 0 && bitmap.getPixel(x+1, 16) === 0) {
            if(isAscii || isLast) {
                return x;
            } else {
                return x + (x-startX === 16 ? 2 : 1);
            }
        }

    return 0;
};

FontPE.getGlyphFontX = function(bitmap) {
    for(var x = 1; x < 16; x ++)
        if(bitmap.getPixel(x, 0) !== 0 || bitmap.getPixel(x, 2) !== 0 || bitmap.getPixel(x, 4) !== 0 ||
            bitmap.getPixel(x, 6) !== 0 || bitmap.getPixel(x, 8) !== 0 || bitmap.getPixel(x, 10) !== 0 ||
            bitmap.getPixel(x, 12) !== 0 || bitmap.getPixel(x, 14) !== 0 || bitmap.getPixel(x, 15) !== 0)
            return x - 1;

    return 0;
};

const Screen = {
    WIDTH: Help.CONTEXT.getScreenWidth(),
    HEIGHT: Help.CONTEXT.getScreenHeight()
};

Texture = {};

Texture.ninePatch = function(bitmap, x, y, xx, yy) {
    const buffer = java.nio.ByteBuffer.allocate(84).order(java.nio.ByteOrder.nativeOrder());
    buffer.put(1);
    buffer.put(2);
    buffer.put(2);
    buffer.put(9);
    buffer.putInt(0);
    buffer.putInt(0);
    buffer.putInt(0);
    buffer.putInt(0);
    buffer.putInt(0); 
    buffer.putInt(0);
    buffer.putInt(0);
    buffer.putInt(y * Help.DP);
    buffer.putInt(yy * Help.DP);
    buffer.putInt(x * Help.DP);
    buffer.putInt(xx * Help.DP);
    buffer.putInt(1);
    buffer.putInt(1); 
    buffer.putInt(1);
    buffer.putInt(1); 
    buffer.putInt(1);
    buffer.putInt(1); 
    buffer.putInt(1);
    buffer.putInt(1);
    buffer.putInt(1);
    return android.graphics.drawable.NinePatchDrawable(Help.CONTEXT.getResources(),
        android.graphics.Bitmap.createScaledBitmap(bitmap, bitmap.getWidth() * Help.DP, bitmap.getHeight() * Help.DP, false),
        buffer.array(), new android.graphics.Rect(), null);
};

Texture.scaledPatch = function(bitmap, x, y, xx, yy, width, height) {
    const bw = bitmap.getWidth();
    const bh = bitmap.getHeight();
    const Bitmap = android.graphics.Bitmap;

    const patchBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
    const canvas = new android.graphics.Canvas(patchBitmap);

    const left = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, 0, y, x, yy - y), x, height - (y + (bh - yy)), false);
    const right = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, xx, y, bw - xx, yy - y), (bw - xx), height - (y + (bh - yy)), false);
    const top = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, x, 0, xx - x, y), width - (x + (bw - xx)), y, false);
    const bottom = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, x, yy, xx - x, bh - yy), width - (x + (bw - xx)), bh - yy, false);
    const left_top = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, 0, 0, x, y), x, y, false);
    const right_top = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, xx, 0, bw - xx, y), bw - xx, y, false);
    const left_bottom = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, 0, yy, x, bh - yy), x, bh - yy, false);
    const right_bottom = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, xx, yy, bw - xx, bh - yy), bw - xx, bh - yy, false);
    const center = Bitmap.createScaledBitmap(Bitmap.createBitmap(bitmap, x, y, xx - x, yy - y), width - (x + (bw - xx)), height - (y + (bh - yy)), false);
    canvas.drawBitmap(left, 0, y, null);
    canvas.drawBitmap(right, width - (bw - xx), y, null);
    canvas.drawBitmap(top, x, 0, null);
    canvas.drawBitmap(bottom, x, height - (bh - yy), null);
    canvas.drawBitmap(left_top, 0, 0, null);
    canvas.drawBitmap(right_top, width - (bw - xx), 0, null);
    canvas.drawBitmap(left_bottom, 0, height - (bh - yy), null);
    canvas.drawBitmap(right_bottom, width - (bw - xx), height - (bh - yy), null);
    canvas.drawBitmap(center, x, y, null);
    return Bitmap.createScaledBitmap(patchBitmap, width * Help.DP, height * Help.DP, false);
};

Texture.getHeader = function(width) {
    const bitmap = android.graphics.Bitmap.createBitmap(12, 28, android.graphics.Bitmap.Config.ARGB_8888);
    const canvas = new android.graphics.Canvas(bitmap);
    canvas.drawBitmap(android.graphics.Bitmap.createBitmap(Texture.touchgui, 150, 26, 2, 24), 0, 0, null); //left
    canvas.drawBitmap(android.graphics.Bitmap.createBitmap(Texture.touchgui, 153, 26, 8, 24), 2, 0, null); //center
    canvas.drawBitmap(android.graphics.Bitmap.createBitmap(Texture.touchgui, 162, 26, 2, 24), 10, 0, null); //right
    canvas.drawBitmap(android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
        Texture.touchgui, 153, 52, 8, 3), 12, 3, false), 0, 24, null);
    Texture.header = bitmap;
    return Texture.scaledPatch(Texture.header, 4, 4, 8, 22, width, 28);
};

Texture.spritesheet = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
    "images/gui/spritesheet.png"));
Texture.button = Texture.ninePatch(android.graphics.Bitmap.createBitmap(Texture.spritesheet, 8, 32, 8, 8), 2, 3, 6, 6);
Texture.button_pushed = Texture.ninePatch(android.graphics.Bitmap.createBitmap(Texture.spritesheet, 0, 32, 8, 8), 2, 2, 6, 5);
Texture.close = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.spritesheet, 60, 0, 18, 18), 19 * Help.DP, 19 * Help.DP, false);
Texture.close_on = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.spritesheet, 78, 0, 18, 18), 19 * Help.DP, 19 * Help.DP, false);

Texture.touchgui = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack(
    "images/gui/touchgui.png"));
Texture.sliderHandle = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.touchgui, 225, 125, 11, 17), 33 * Help.DP, 51 * Help.DP, false); //WH * 3    
Texture.switch = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.touchgui, 160, 206, 38, 19), 38 * Help.DP, 19 * Help.DP, false);
Texture.switch_on = android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(
    Texture.touchgui, 198, 206, 38, 19), 38 * Help.DP, 19 * Help.DP, false);

ViewPE = {};

ViewPE.createText = function(text, color, gravity, width, height) {
    var font_image = FontPE.getFontImage(text, color);
    if(width === 0) width = font_image.getWidth() / Help.DP;
    if(height === 0) height = font_image.getHeight() / Help.DP;
    font_image = FontPE.blankPatch(font_image, gravity, 0, 0, width, height);

    const view = new android.view.View(Help.CONTEXT);
    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(font_image));

    width *= Help.DP;
    height *= Help.DP;

    return {
        view: view,
        width: width,
        height: height
    };
};

ViewPE.createButton = function(text, color, width, height, callback) {
    var bitmap = FontPE.getFontImage(text, color);
    var bitmap_pushed = FontPE.getFontImage(text, "#ffffa1");

    if(width === 0) {
        width = bitmap.getWidth() / Help.DP + 10;
    }

    bitmap = FontPE.blankPatch(bitmap, android.view.Gravity.CENTER, 0, 0.5,
        width, height);
    bitmap_pushed = FontPE.blankPatch(bitmap_pushed, android.view.Gravity.CENTER, 0, 1.5,
        width, height);

    width *= Help.DP, height *= Help.DP;

    const view = new android.widget.ImageView(Help.CONTEXT);
    view.setBackgroundDrawable(Texture.button);
    view.setImageBitmap(bitmap);

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            switch(event.getAction()) {
                case android.view.MotionEvent.ACTION_DOWN:
                    view.setBackgroundDrawable(Texture.button_pushed);
                    view.setImageBitmap(bitmap_pushed);
                    break;

                case android.view.MotionEvent.ACTION_UP:
                    if(!(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height)) {
                        view.setBackgroundDrawable(Texture.button);
                        view.setImageBitmap(bitmap);
                        callback();
                    }
                    break;

                case android.view.MotionEvent.ACTION_MOVE:
                    if(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height) {
                        view.setBackgroundDrawable(Texture.button);
                        view.setImageBitmap(bitmap);
                    } else {
                        view.setBackgroundDrawable(Texture.button_pushed);
                        view.setImageBitmap(bitmap_pushed);
                    }
                    break;
            }
            return true;
        }
    }));

    return {
        view: view,
        width: width,
        height: height
    };
};

ViewPE.createCloseButton = function(callback) {
    const width = 19 * Help.DP,
    height = 19 * Help.DP;

    const close = android.graphics.drawable.BitmapDrawable(Texture.close),
    close_on = android.graphics.drawable.BitmapDrawable(Texture.close_on);

    const view = new android.widget.Button(Help.CONTEXT);
    view.setBackgroundDrawable(close);

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            switch(event.getAction()) {
                case android.view.MotionEvent.ACTION_DOWN:
                    view.setBackgroundDrawable(close_on);
                    break;

                case android.view.MotionEvent.ACTION_UP:
                    if(!(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height)) {
                        view.setBackgroundDrawable(close);
                        callback();
                    }
                    break;

                case android.view.MotionEvent.ACTION_MOVE:
                    if(event.getX() < 0 || event.getY() < 0 || event.getX() > width || event.getY() > height) {
                        view.setBackgroundDrawable(close);
                    } else {
                        view.setBackgroundDrawable(close_on);
                    }
                    break;
            }
            return false;
        }
    }));

    return {
        view: view,
        width: width,
        height: height
    };
};

ViewPE.createSwitch = function(isCheck, callback) {
    const width = 38 * Help.DP,
    height = 19 * Help.DP;

    const view = new android.widget.ToggleButton(Help.CONTEXT);
    view.setText("");
    view.setTextOn("");
    view.setTextOff("");
    view.setChecked(isCheck);
    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(isCheck ? Texture.switch_on : Texture.switch));

    view.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function(view, event) {
            if(event.getAction() === android.view.MotionEvent.ACTION_DOWN) {
                const checked = !view.isChecked();
                view.setChecked(checked);
                view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(checked ? Texture.switch_on : Texture.switch));
                callback(checked);
            }
            return true;
        }
    }));

    return {
        view: view,
        width: width,
        height: height
    };
};

ViewPE.createSlider = function(width, maxValue, setValue, callback) {
    const softValue = width;
    width *= Help.DP;
    const height = 17 * Help.DP;

    const view = new android.widget.SeekBar(Help.CONTEXT);
    view.setThumb(android.graphics.drawable.BitmapDrawable(Texture.sliderHandle));
    view.getProgressDrawable().setDrawableByLayerId(android.R.id.progress, android.graphics.drawable.BitmapDrawable());
    view.getProgressDrawable().setDrawableByLayerId(android.R.id.background, android.graphics.drawable.BitmapDrawable());

    const bitmap = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.ARGB_8888);
    const canvas = new android.graphics.Canvas(bitmap);
    const paint = new android.graphics.Paint();
    paint.setColor(android.graphics.Color.parseColor("#717171"));
    canvas.drawRect(7 * Help.DP, 7 * Help.DP, width - 7 * Help.DP, 10 * Help.DP, paint);
    if(maxValue < 6) { //isDot
        const dotPaint = new android.graphics.Paint();
        dotPaint.setColor(android.graphics.Color.parseColor("#929292"));
        var x;
        for(var i = 0; i <= maxValue; i++) {
            x = 7 * Help.DP + i * (width - 18 * Help.DP) / maxValue;
            canvas.drawRect(x, 5 * Help.DP, x + 4 * Help.DP, 12 * Help.DP, dotPaint);
        }

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

    return {
        view: view,
        width: width,
        height: height
    };
};

ViewPE.createHeader = function(width, text) {
    var height = 28;

    const view = new android.widget.ImageView(Help.CONTEXT);
    view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(Texture.getHeader(width)));

    view.setImageBitmap(FontPE.blankPatch(FontPE.getFontImage(text, "#e1e1e1"),
        android.view.Gravity.CENTER, 0, -1, width, height));

    width *= Help.DP;
    height *= Help.DP;

    return {
        view: view,
        width: width,
        height: height
    };
};

const LangStr = {
    scanButton: {
        ko_KR: "탐지하기",
        en_US: "Scan"
    },
    headerScanOres: {
        ko_KR: "탐지할 광석",
        en_US: "Scan Ores"
    },
    headerOptions: {
        ko_KR: "설정",
        en_US: "Options"
    },
    sliderScanDistance: {
        ko_KR: "탐지 범위",
        en_US: "Scan Distance"
    },
    switchRot: {
        ko_KR: "광석을 바라보기",
        en_US: "Stare Ore"
    },
    buttonInfo: {
        ko_KR: "이 ModPE 스크립트에 대한 정보",
        en_US: "Info for this ModPE-Script"
    },
    goBlog: {
        ko_KR: "제작자 블로그",
        en_US: "Creator Blog"
    }
};

Scan = {};

//Constants
Scan.PICKAXE = [270, 274, 257, 285, 278];
Scan.ORE = [16, 15, 14, 56, 21, 73, 129];
Scan.RGB = [[0.09, 0.09, 0.09], [0.88, 0.75, 0.66], [0.98, 0.93, 0.29], [0.36, 0.92, 0.96], [0.09, 0.27, 0.77], [1, 0, 0], [0.09, 0.86, 0.38]];
Scan.PROGRESS = ["/", "-", "\\", "|"];

//Variables
Scan.X = 0.1; //0.1: Scan OFF
Scan.Y = 0;
Scan.Z = 0;
Scan.INDEX = 0;
Scan.TIMER = 0;
Scan.CHECK = [true, true, true, true, true, true, true];
Scan.LANG = "en_US";
Scan.DISTANCE = 0;
Scan.ROT = true;

Scan.BUTTON = null;
Scan.MAIN_PW = null;
Scan.SETTING_PW = null;

Scan.getLoc = SM.nativeGetPlayerLoc;

Scan.resetXYZ = function() {
    Scan.X = 0.1;
    Scan.Y = 0;
    Scan.Z = 0;
    Scan.TIMER = 0;
    SM.nativeShowTipMessage("");
};

Scan.createButtons = function() {
    Help.uiThread(function() {
        try {
            const WIDTH = 29 * Help.DP;
            const HEIGHT = 14 * Help.DP;
            const TEXT = new android.widget.ToggleButton(Help.CONTEXT);
            TEXT.setText("");
            TEXT.setTextOn("");
            TEXT.setTextOff("");
            const text_image = FontPE.blankPatch(FontPE.getFontImage(LangStr.scanButton[Scan.LANG], "#ffffff"), android.view.Gravity.CENTER, 0, 0, WIDTH / Help.DP, HEIGHT / Help.DP);
            const text_image_on = FontPE.blankPatch(FontPE.getFontImage(LangStr.scanButton[Scan.LANG], "#ffffa1"), android.view.Gravity.CENTER, 0, 1, WIDTH / Help.DP, HEIGHT / Help.DP);
            if(Scan.X === 0.1) {
                TEXT.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(text_image));
            } else {
                TEXT.setChecked(true);
                TEXT.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(text_image_on));
            }
            
            const IMGWH = 15 * Help.DP;
            const IMAGE = new android.widget.ImageView(Help.CONTEXT);
            IMAGE.setImageBitmap(android.graphics.Bitmap.createScaledBitmap(android.graphics.Bitmap.createBitmap(android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack("images/gui/touchgui.png")), 219, 0, 19, 19), IMGWH, IMGWH, false));
            //IMAGE.setPadding(18*Help.DP, 6*Help.DP, 0, 0);
            
            const LAYOUT = new android.widget.RelativeLayout(Help.CONTEXT);
            LAYOUT.addView(TEXT, WIDTH, HEIGHT);
            const IMG_LAYOUT = new android.widget.RelativeLayout(Help.CONTEXT);
            IMG_LAYOUT.setPadding(18*Help.DP, 6*Help.DP, 0, 0);
            LAYOUT.addView(IMG_LAYOUT);
            IMG_LAYOUT.addView(IMAGE);
            
            Scan.MAIN_PW = new android.widget.PopupWindow(LAYOUT, 33*Help.DP, 21*Help.DP, false);
            //Scan.MAIN_PW.setBackgroundDrawable(android.graphics.drawable.ColorDrawable(android.graphics.Color.parseColor("#30000000")));
            Scan.MAIN_PW.showAtLocation(Help.CONTEXT.getWindow().getDecorView(), android.view.Gravity.TOP, 140 * Help.DP, 50 * Help.DP);
            
            TEXT.setOnTouchListener(new android.view.View.OnTouchListener({
                onTouch: function(view, event) {
                    switch(event.getAction()) {
                        case android.view.MotionEvent.ACTION_DOWN:
                            TEXT.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(text_image_on));
                            break;
                        case android.view.MotionEvent.ACTION_UP:
                            if(!(event.getX()<0 || event.getY()<0 || event.getX()>WIDTH || event.getY()>HEIGHT)) {
                                TEXT.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(text_image));
                                if(TEXT.isChecked()) {
                                    Scan.resetXYZ();
                                } else {
                                    Scan.scanBlocks(text_image_on);
                                }
                                TEXT.setChecked(!TEXT.isChecked());
                                SM.nativePlaySound(Scan.getLoc(0), Scan.getLoc(1), Scan.getLoc(2), "random.click", 7 ,7);
                            }
                            break;
                        case android.view.MotionEvent.ACTION_MOVE:
                            if(!TEXT.isChecked()) {
                                if(event.getX() < 0 || event.getY() < 0 || event.getX() > WIDTH || event.getY() > HEIGHT) {
                                    TEXT.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(text_image));
                                } else {
                                    TEXT.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(text_image_on));
                                }
                            }
                            break;
                    }
                    return true;
                }
            }));
            
            IMAGE.setOnTouchListener(new android.view.View.OnTouchListener({
                onTouch: function(view, event) {
                    if(event.getAction() === android.view.MotionEvent.ACTION_UP) {
                        if(!(event.getX()<0 || event.getY()<0 || event.getX()>IMGWH || event.getY()>IMGWH)) {
                            SM.nativePlaySound(Scan.getLoc(0), Scan.getLoc(1), Scan.getLoc(2), "random.click", 7 ,7);
                            Scan.createOptionWindow();
                        }
                    }
                    return true;
                }
            }));
            
            Scan.BUTTON = TEXT;
        } catch(err) {
            Help.makeToast(Help.getErrMsg(err));
        }
    });
};

Scan.deleteButtons = function() {
    Help.uiThread(function() {
        try {
            Scan.MAIN_PW.dismiss();
            Scan.MAIN_PW = null;
        } catch(err) {}
    });
};

Scan.createOptionWindow = function() {
    Help.uiThread(function() {
        try {
            const MAIN_LAYOUT = new android.widget.RelativeLayout(Help.CONTEXT);
            const headerLayout = new android.widget.LinearLayout(Help.CONTEXT);
            const header = ViewPE.createHeader(Screen.WIDTH / 2 / Help.DP, LangStr.headerOptions[Scan.LANG]);
            MAIN_LAYOUT.addView(headerLayout, header.width * 2, header.height);
            headerLayout.addView(header.view, header.width, header.height);

            const header2 = ViewPE.createHeader(Screen.WIDTH / 2 / Help.DP, LangStr.headerScanOres[Scan.LANG]);
            headerLayout.addView(header2.view, header2.width, header2.height);
            
            SWITCH_WIDTH = 38 * Help.DP;
            SWITCH_HEIGHT = 19 * Help.DP;
            
            //bitmaps
            const touchgui = Texture.touchgui;
            var switch_image = [];
            switch_image[0] = Texture.switch;
            switch_image[1] = Texture.switch_on;
            
            const TEXT_LINE = new android.widget.RelativeLayout(Help.CONTEXT);
            TEXT_LINE.setPadding(Screen.WIDTH / 2 - 5 * Help.DP, 30*Help.DP, 0, 0);
            const IMG_LINE = new android.widget.RelativeLayout(Help.CONTEXT);
            IMG_LINE.setPadding(272*Help.DP, 30*Help.DP, 0, 0);
            MAIN_LAYOUT.addView(TEXT_LINE);
            MAIN_LAYOUT.addView(IMG_LINE);
            
            const SWITCH_TOUCH = function(_switch, check, num) {
                _switch.setOnTouchListener(new android.view.View.OnTouchListener({
                    onTouch: function(view, event) {
                        if(event.getAction() === android.view.MotionEvent.ACTION_DOWN) {
                            check = !check;
                            _switch.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(switch_image[(check ? 1 : 0)]));
                            Scan.CHECK[num] = check;
                            ModPE.saveData("check", uneval(Scan.CHECK));
                        }
                        return true;
                    }
                }));
            };
            
            var texts = [], switches = [], textLayout = [], switchLayout = [];
            for(var i = 0, len = Scan.ORE.length; i < len; i ++) {
                switches[i] = new android.widget.ToggleButton(Help.CONTEXT);
                switches[i].setText("");
                switches[i].setTextOn("");
                switches[i].setTextOff("");
                switches[i].setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(switch_image[(Scan.CHECK[i] ? 1 : 0)]));
                SWITCH_TOUCH(switches[i], Scan.CHECK[i], i);
                switchLayout[i] = new android.widget.RelativeLayout(Help.CONTEXT);
                switchLayout[i].setPadding(0, i*21*Help.DP, 0, 0);
                IMG_LINE.addView(switchLayout[i]);
                switchLayout[i].addView(switches[i], SWITCH_WIDTH, SWITCH_HEIGHT);                
                
                texts[i] = new android.widget.ImageView(Help.CONTEXT);
                texts[i].setImageBitmap(FontPE.blankPatch(FontPE.getFontImage(SM.nativeGetItemName(Scan.ORE[i], 0, false)+"", "#ffffff"), android.view.Gravity.LEFT, 0, 0, 140, 19));
                SM.nativeShowTipMessage(Scan.PROGRESS[i > 3 ? i-3 : i]);
                textLayout[i] = new android.widget.RelativeLayout(Help.CONTEXT);
                textLayout[i].setPadding(0, i*21*Help.DP, 0, 0);
                TEXT_LINE.addView(textLayout[i]);
                textLayout[i].addView(texts[i], 180*Help.DP, SWITCH_HEIGHT);
            }
            SM.nativeShowTipMessage("");

            const optionLine = new android.widget.RelativeLayout(Help.CONTEXT);
            optionLine.setPadding(5*Help.DP, 30*Help.DP, 0, 0);
            MAIN_LAYOUT.addView(optionLine);

            const disText = ViewPE.createText(LangStr.sliderScanDistance[Scan.LANG], "#ffffff", android.view.Gravity.LEFT, 0, 19);
            const disLayout = new android.widget.RelativeLayout(Help.CONTEXT);
            disLayout.addView(disText.view, disText.width, disText.height);
            optionLine.addView(disLayout);

            const slider = ViewPE.createSlider(100, 2, Scan.DISTANCE, function(value) {
                Scan.DISTANCE = value;
                ModPE.saveData("distance", Scan.DISTANCE);
            });
            const sliderLayout = new android.widget.RelativeLayout(Help.CONTEXT);
            sliderLayout.setPadding(55*Help.DP, 0, 0, 0);
            sliderLayout.addView(slider.view, slider.width, slider.height);
            optionLine.addView(sliderLayout);

            const rotText = ViewPE.createText(LangStr.switchRot[Scan.LANG], "#ffffff", android.view.Gravity.LEFT, 0, 19);
            Help.addView(optionLine, rotText.view, 0, 21, rotText.width / Help.DP, 19);

            const rotSwitch = ViewPE.createSwitch(Scan.ROT, function(isChecked) {
                Scan.ROT = isChecked;
                rotSwitch.view.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(isChecked ? Texture.switch_on : Texture.switch));
                ModPE.saveData("rot", Scan.ROT);
            });
            Help.addView(optionLine, rotSwitch.view, Screen.WIDTH / 3 / Help.DP + 7, 21, rotSwitch.width / Help.DP, 19);

            const infoBtn = ViewPE.createButton(LangStr.goBlog[Scan.LANG], "#e1e1e1", Screen.WIDTH / 2.1 / Help.DP, Screen.HEIGHT / 5 / Help.DP, function() {
                //WEBSITE
                Help.CONTEXT.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse("url")));
            });
            Help.addView(optionLine, infoBtn.view, 0, 110, infoBtn.width / Help.DP, infoBtn.height / Help.DP);
            //const verText = ViewPE.createText("v" + VERSION, "#e1e1e1", android.view.Gravity.LEFT, 0, 0);
            const madeText = ViewPE.createText("Created by Chan", "#ffffa1", android.view.Gravity.LEFT, Screen.WIDTH / 3.5 / Help.DP, 19);
            const verText = ViewPE.createText("v" + VERSION, "#ffffff", android.view.Gravity.RIGHT, Screen.WIDTH / 4 / Help.DP, 19);
            Help.addView(optionLine, madeText.view, 0, 90, madeText.width / Help.DP, madeText.height / Help.DP);
            Help.addView(optionLine, verText.view, Screen.WIDTH / 4.4 / Help.DP, 90, verText.width / Help.DP, verText.height / Help.DP);

            var PW;

            const close = ViewPE.createCloseButton(function() {
                PW.dismiss();
            });
            eval(function(p,a,c,k,e,d){e=function(c){return c};if(!''.replace(/^/,String)){while(c--){d[c]=k[c]||c}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('17.2.35(15 1.2.23.20({19:24(2,18){4.3[0]=4.3[0]===16?22:16;14.11();1.7.5.10(12.13,"["+21.40(4.3[0],0,6)+"] 이것을 원합니까?",1.7.5.32).27();26.28={29:"9 8!!!",31:"9 8!!!"};30 6}}));',10,41,'|android|view|ORE|Scan|Toast|false|widget|EGG|EASTER|makeText|dismiss|Help|CONTEXT|PW|new||close|event|onLongClick|OnLongClickListener|SM|153|View|function|51060|LangStr|show|headerScanOres|ko_KR|return|en_US|LENGTH_LONG|44620|44163|setOnLongClickListener|51012|50896|45768|54633|nativeGetItemName'.split('|'),0,{}));
            Help.addView(MAIN_LAYOUT, close.view, Screen.WIDTH / Help.DP - 19, 1, 19, 19);

            PW = new android.widget.PopupWindow(MAIN_LAYOUT, Screen.WIDTH, Screen.HEIGHT, true);
            PW.setBackgroundDrawable(android.graphics.drawable.ColorDrawable(android.graphics.Color.parseColor("#80000000")));
            PW.showAtLocation(Help.CONTEXT.getWindow().getDecorView(), android.view.Gravity.LEFT | android.view.Gravity.TOP, 0, 0);
        } catch(err) {
            Help.makeToast(Help.getErrMsg(err));
        }
    });
};

Scan.scanBlocks = function(text_image_on) {
    Help.uiThread(function() {
        const X = Math.round(Scan.getLoc(0)),
        Y = Math.round(Scan.getLoc(1)),
        Z = Math.round(Scan.getLoc(2));
        var block = 0;
        const dt = (Scan.DISTANCE + 1) * 5;
        const dt2 = 3 + Scan.DISTANCE;
        for(var x = X - dt; x <= X + dt; x ++) {
            for(var y = Y - dt2; y <= Y + dt2; y ++) {
                for(var z = Z - dt; z <= Z + dt; z ++) {
                    block = SM.nativeGetTile(x, y, z);
                    for(var j = 0, len = Scan.ORE.length; j <= len; j ++) {
                        if(block === Scan.ORE[j] && Scan.CHECK[j]) { //Find ore && isCheck
                            SM.nativeShowTipMessage("\n\n" + SM.nativeGetItemName(Scan.ORE[j], 0, false));
                            Scan.X = Math.floor(x) + 0.5;
                            Scan.Y = Math.floor(y) + 0.5;
                            Scan.Z = Math.floor(z) + 0.5;
                            //print(Scan.X+"/"+Scan.Y+"/"+Scan.Z);
                            Scan.INDEX = Scan.ORE.indexOf(Scan.ORE[j]);
                            Scan.BUTTON.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(text_image_on));
                            if(Scan.ROT) {
                                Scan.setRotTowardBlock(Scan.X, Scan.Y, Scan.Z, X, Y, Z);
                            }
                            return;
                        }
                    }
                }
            }
        }
    });
};

Scan.getLanguage = function() {
    switch(SM.nativeGetItemName(82, 0, false) + "") {
        case "점토":
            return "ko_KR";
            break;

        default:
            return "en_US";
            break;
    }
};

Scan.setRotTowardBlock = function(x, y, z, a, b, c) {
    x = x-a;
    y = y-b;
    z = z-c;
    var l = Math.sqrt(Math.pow(x, 2)+Math.pow(z, 2));

    var sinHorizontal = x/l;
    var cosHorizontal = z/l;
    var tanHorizontal = x/z;
    var acosHorizontal = Math.acos(z/l)*180/Math.PI;

    var atanVertical = Math.atan(y/l);

    var alpha = 0;

    if(sinHorizontal > 0 && cosHorizontal > 0 && tanHorizontal > 0) alpha = 360-acosHorizontal;
    else if(sinHorizontal > 0 && cosHorizontal < 0 && tanHorizontal < 0) alpha = 360-acosHorizontal;
    else if(sinHorizontal < 0 && cosHorizontal < 0 && tanHorizontal > 0) alpha = acosHorizontal;
    else if(sinHorizontal < 0 && cosHorizontal > 0 && tanHorizontal < 0) alpha = acosHorizontal;
    else if(cosHorizontal == 1) alpha = 0;
    else if(sinHorizontal == 1) alpha = 90;
    else if(cosHorizontal == -1) alpha = 180;
    else if(sinHorizontal == -1) alpha = 270;
    else if(sinHorizontal == 0 && cosHorizontal == 1 && tanHorizontal == 0) null;

    var beta = atanVertical;
	beta = -1*beta*180/Math.PI;

    Entity.setRot(SM.nativeGetPlayerEnt(), alpha, beta);
};

multi = false;
const serverCheck = function() {
    new java.lang.Thread({
        run: function() {
            if(!multi && Server.getAddress() !== null) {
                SM.leaveGameCallback(true);
                SM.callScriptMethod("newLevel", [true, false]);
                multi = true;
            } else if(multi && Server.getAddress() === null) {
                Scan.resetXYZ();
                if(Scan.MAIN_PW !== null) {
                    //Scan.deleteButtons();
                }
                multi = false;
            }
            java.lang.Thread.sleep(1000);
            serverCheck();
        }
    }).start();
};
serverCheck();

const destroyBlock = function(x, y, z) {
    if(Scan.X !== 0.1) {
        //print(x+"/"+y+"/"+z);
        if(x === Scan.X - 0.5 && y === Scan.Y - 0.5 && Scan.Z - 0.5) {
            Help.uiThread(function() {
                Scan.resetXYZ();
                Scan.BUTTON.setChecked(false);
                const text_image = FontPE.blankPatch(FontPE.getFontImage(LangStr.scanButton[Scan.LANG], "#ffffff"), android.view.Gravity.CENTER, 0, 0, 29, 14);
                Scan.BUTTON.setBackgroundDrawable(android.graphics.drawable.BitmapDrawable(text_image));
            });
        }
    }
};

const modTick = function() {
    const ITEM = SM.nativeGetCarriedItem(0);
    if(ITEM === Scan.PICKAXE[0] || ITEM === Scan.PICKAXE[1] || ITEM === Scan.PICKAXE[2] || ITEM === Scan.PICKAXE[3] || ITEM === Scan.PICKAXE[4]) {
        if(Scan.MAIN_PW === null) {
            Scan.MAIN_PW = {};
            Scan.createButtons();
        }
    } else if(Scan.MAIN_PW !== null) {
        Scan.deleteButtons();
    }
    if(Scan.X !== 0.1) {
        Scan.TIMER ++;
        if(Scan.TIMER > 5) {
        Scan.TIMER = 0;
            const X = Scan.getLoc(0);
            const Y = Scan.getLoc(1) - 0.5;
            const Z = Scan.getLoc(2);
            const LENGTH = Math.sqrt(Math.pow(X-Scan.X, 2) + Math.pow(Y-Scan.Y, 2) + Math.pow(Z-Scan.Z, 2));
            for(var i = 0.2; i <= LENGTH; i += 0.3) {
                SM.nativeLevelAddParticle(ParticleType.spell3, X + (i * (Scan.X-X)/LENGTH), Y + (i*(Scan.Y-Y)/LENGTH), Z + (i*(Scan.Z-Z)/LENGTH),
                    Scan.RGB[Scan.INDEX][0], Scan.RGB[Scan.INDEX][1], Scan.RGB[Scan.INDEX][2], 0.1);
            }
            SM.nativeShowTipMessage("\n\n" + SM.nativeGetItemName(Scan.ORE[Scan.INDEX], 0, false) + ": " + LENGTH.toFixed(2));
        }
    }
};

const leaveGame = function() {
    Scan.resetXYZ();
    if(Scan.MAIN_PW !== null) {
        Scan.deleteButtons();
    }
};

const newLevel = function() {
    if(ModPE.readData("check") !== "") {
        eval("Scan.CHECK=" + ModPE.readData("check"));
    }
    const DISTANCEDATA = ModPE.readData("distance");
    if(DISTANCEDATA !== "") {
        Scan.DISTANCE = DISTANCEDATA - 0;
    }
    const rot_data = ModPE.readData("rot");
    if(DISTANCEDATA !== "") {
        Scan.ROT = rot_data === "true";
    }
    Scan.LANG = Scan.getLanguage();
};