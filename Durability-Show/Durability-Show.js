/**
 * @author Chan Lugeon <chanlugeon@protonmail.com>
 * @version 2.1
 */

const SM = net.zhuoweizhang.mcpelauncher.ScriptManager;

Help = {};

Help.CONTEXT = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

Help.DP = android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_DIP, 2, Help.CONTEXT.getResources().getDisplayMetrics());

Help.DIR = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + "/games/com.mojang/minecraftResources/";

Help.uiThread = function(callback) {
    Help.CONTEXT.runOnUiThread(new java.lang.Runnable({
        run: function() {
            callback();
        }
    }));
};

Help.makeToast = function(text) {
    Help.uiThread(function() {
        android.widget.Toast.makeText(Help.CONTEXT, "Durability Show: " + text, android.widget.Toast.LENGTH_LONG).show();
    });
};

Help.addView = function(layout, view, x, y, width, height) {
    const LAYOUT = new android.widget.RelativeLayout(Help.CONTEXT);
    LAYOUT.setPadding(x * Help.DP, y * Help.DP, 0, 0);
    LAYOUT.addView(view, width * Help.DP, height * Help.DP);
    layout.addView(LAYOUT);
};

Help.download = function(url, path, name) {
    Help.uiThread(function() {
        try {
            const URI = new android.net.Uri.parse(url);
            const REQUEST = new android.app.DownloadManager.Request(URI);
            REQUEST.setTitle(name);
            REQUEST.setDestinationInExternalPublicDir(path, name);
            Help.CONTEXT.getSystemService(android.content.Context.DOWNLOAD_SERVICE).enqueue(REQUEST);
        } catch(err) {
            Help.makeToast("Download ERROR");
        }
    });
};

Texture = {};

eval("Texture.ITEMS_META = " + new java.lang.String(ModPE.getBytesFromTexturePack("images/items.meta")) + ";");

Texture.ITEMS = android.graphics.BitmapFactory.decodeStream(ModPE.openInputStreamFromTexturePack("images/items-opaque.png"));

Texture.NONE = android.graphics.Bitmap.createBitmap(1, 1, android.graphics.Bitmap.Config.ARGB_8888);

Texture.getItemBitmap = function(item, num) {
    var bmp = null; 
    Texture.ITEMS_META.forEach(function(data) {
        if(data.name === item && data.uvs[num] !== null) {
            var loc = [];
            loc[0] = data.uvs[num][0] * data.uvs[0][4];
            loc[1] = data.uvs[num][1] * data.uvs[0][5];
            loc[2] = data.uvs[num][2] * data.uvs[0][4];
            loc[3] = data.uvs[num][3] * data.uvs[0][5];
            bmp = new android.graphics.Bitmap.createBitmap(Texture.ITEMS, loc[0], loc[1], Math.round(loc[2] - loc[0]), Math.round(loc[3] - loc[1]));
        }
    });
    return android.graphics.Bitmap.createScaledBitmap(bmp, 16 * Help.DP, 16 * Help.DP, false);
};

//leather, chain, iron, gold, diamond
const ArmorInfo = {
    ID: [[298, 302, 306, 314, 310], [299, 303, 307, 315, 311], [300, 304, 308, 316, 312], [301, 305, 309, 317, 313]],
    DAM: [[55, 165, 165, 77, 363], [80, 240, 240, 112, 528], [75, 225, 225, 105, 495], [65, 195, 195, 91, 429]],
    NAME: ["helmet", "chestplate", "leggings", "boots"]
};

//wood, stone, iron, gold, diamond
const ToolInfo = {
    ID: [[268, 272, 267, 283, 276], [ 269,273, 256, 284, 277], [270, 274, 257, 285, 278], [271, 275, 258, 286, 279], [290, 291, 292, 294, 293], [261, 259, 359, 346, 9999]],
    DAM: [59, 131, 250, 32, 1561, [384, 64, 238, 384]],
    NAME: ["sword", "shovel", "pickaxe", "axe", "hoe", ["bow_standby", "flint_and_steel", "shears", "fishing_rod"]]
};

Display = {};

Display.SCAN_DELAY = 0;
Display.RESET_DELAY = [-1, -1, -1, -1, -1, -1];

/**
 * 0, 1, 2, 3: armor
 * 4, 5: tool
 */
Display.IMAGE = [];
Display.TEXT = [];

Display.createWindow = function() {
    Help.uiThread(function() {
        try {
        
            const LAYOUT = new android.widget.RelativeLayout(Help.CONTEXT);
            for(var i = 0; i <= 5; i ++) {
                Display.IMAGE[i] = new android.widget.ImageView(Help.CONTEXT);
                LAYOUT.addView(Display.IMAGE[i]);
                Display.TEXT[i] = new android.widget.TextView(Help.CONTEXT);
                Display.TEXT[i].setTypeface(android.graphics.Typeface.createFromFile(Help.DIR + "minecraft.ttf"));
                Display.TEXT[i].setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, 8 * Help.DP);
                Display.TEXT[i].setTextColor(android.graphics.Color.WHITE);
                Display.TEXT[i].setShadowLayer(0.000001, Help.DP, Help.DP, android.graphics.Color.DKGRAY);
                Display.TEXT[i].setGravity(android.view.Gravity.TOP | android.view.Gravity.CENTER);
            }
            for(var i = 0; i <= 3; i ++) {
                Display.IMAGE[i].setPadding(1 * Help.DP, 16 * Help.DP * i, 0, 0);
                Help.addView(LAYOUT, Display.TEXT[i], 0, i * 16 + 9.5, 25, 12);
            }
            for(var i = 4; i <= 5; i ++) {
                Display.IMAGE[i].setPadding(25 * Help.DP, 16 * Help.DP * (i-4), 0, 0);
                Help.addView(LAYOUT, Display.TEXT[i], 24, (i-4) * 16 + 9.5, 25, 12);
            }
            
            const PW = new android.widget.PopupWindow(LAYOUT, 318 * Help.DP, 72 * Help.DP, false);
            PW.setTouchable(false);
            PW.showAtLocation(Help.CONTEXT.getWindow().getDecorView(), android.view.Gravity.LEFT | android.view.Gravity.TOP, Help.DP, 22 * Help.DP);
        } catch(err) {
            Help.makeToast("Screen ERROR");
        }
    });
};

Display.resetView = function(n) {
    Help.uiThread(function() {
        Display.IMAGE[n].setImageBitmap(Texture.NONE);
        Display.TEXT[n].setText("");
    });
};

Player.getInvItemCount = function(id) {
    var count = 0;
    for(i = 9; i <= 44; i ++) {
        if(SM.nativeGetSlotInventory(i, 0) === id) {
            count += SM.nativeGetSlotInventory(i, 2);
        }
    }
    return count;
};

const newLevel = function() {
    if(Display.PW === null) {
        Display.createWindow();
    }
};

const leaveGame = function() {
    for(var i = 0; i <= 5; i ++) {
        Display.resetView(i);
    }
};

const modTick = function() {
    if(SM.nativeGetGameType() === 0) {
        Display.SCAN_DELAY ++;
    }
    if(Display.SCAN_DELAY === 15) {
        Display.SCAN_DELAY = 0;
        Help.uiThread(function() {
            //armor scan
            var armor = [];
            for(var i = 0; i <= 3; i ++) {
                //armor[i] = SM.nativeGetSlotArmor(i, 0);
                armor[i] = Player.getArmorSlot(i);
                for(var n = 0; n <= 4; n ++) {
                    if(armor[i] === ArmorInfo.ID[i][n]) {
                    Display.IMAGE[i].setImageBitmap(Texture.getItemBitmap(ArmorInfo.NAME[i], n));
                        Display.TEXT[i].setText(ArmorInfo.DAM[i][n] - Player.getArmorSlotDamage(i) + "");
                        Display.RESET_DELAY[i] = 20;
                        break;
                    }
                }
            }
            
            //tool scan
            const ITEM = SM.nativeGetCarriedItem(0);
            for(var n = 0; n <= 4; n ++) {
                for(var i = 0; i <= 5; i ++) {
                    if(ITEM === ToolInfo.ID[i][n]) {
                        if(i === 5) { //special tool
                            Display.IMAGE[5].setImageBitmap(Texture.getItemBitmap(ToolInfo.NAME[5][n], 0));
                            Display.TEXT[5].setText(ToolInfo.DAM[5][n] - SM.nativeGetCarriedItem(1) + "");
                            if(n === 0) { //is bow
                                Display.IMAGE[4].setImageBitmap(Texture.getItemBitmap("arrow", 0));
                                Display.TEXT[4].setText(Player.getInvItemCount(262) + "");
                                Display.RESET_DELAY[4] = 20;
                            }
                        } else {
                            Display.IMAGE[5].setImageBitmap(Texture.getItemBitmap(ToolInfo.NAME[i], n));
                            Display.TEXT[5].setText(ToolInfo.DAM[n] - SM.nativeGetCarriedItem(1) + "");
                        }
                        Display.RESET_DELAY[5] = 20;
                        break;
                    }
                }
            }
        });
    }
    
    //reset view
    for(var n = 0; n <= 5; n ++) {
        if(Display.RESET_DELAY[n] > 0) {
            Display.RESET_DELAY[n] --;
        } else if(Display.RESET_DELAY[n] === 0) {
            Display.RESET_DELAY[n] = -1;
            Display.resetView(n);
        }
    }
};

if(java.io.File(Help.DIR + "minecraft.ttf").exists()) {
    Display.createWindow();
} else {
    //resource download
    java.io.File(Help.DIR).mkdirs();
    Help.download("fontUrl", "/games/com.mojang/minecraftResources/", "minecraft.ttf"); // TODO modify fontUrl
    Help.makeToast("Downloading Font...");
    Help.makeToast("Created by Chan. (gml1580.blog.me)");
}