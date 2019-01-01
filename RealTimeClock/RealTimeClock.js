/**
 * @author Chan Lugeon <chanlugeon@protonmail.com>
 * @version 1.0
 */

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

Help.print = function(text) {
    Help.uiThread(function() {
        android.widget.Toast.makeText(Help.CONTEXT, "Real Time Clock: " + text, android.widget.Toast.LENGTH_LONG).show();
    });
};

Help.download = function(url, path, name) {
    Help.uiThread(function() {
        try {
            var uri = new android.net.Uri.parse(url);
            var request = new android.app.DownloadManager.Request(uri);
            request.setTitle(name);
            request.setDestinationInExternalPublicDir(path, name);
            Help.CONTEXT.getSystemService(android.content.Context.DOWNLOAD_SERVICE).enqueue(request);
        } catch(err) {
            Help.print("Download ERROR");
        }
    });
};

Clock = {};

Clock.TEXT = null;

Clock.screen = function() {
    Help.uiThread(function() {
        try {
            Clock.TEXT = new android.widget.TextView(Help.CONTEXT);
            Clock.TEXT.setTypeface(android.graphics.Typeface.createFromFile(Help.DIR + "minecraft.ttf"));
            Clock.TEXT.setTextSize(android.util.TypedValue.COMPLEX_UNIT_DIP, 16);
            Clock.TEXT.setTextColor(android.graphics.Color.parseColor("#aeb0ad"));
            Clock.TEXT.setShadowLayer(0.000001, Help.DP, Help.DP, android.graphics.Color.parseColor("#393939"));
            Clock.TEXT.setGravity(android.view.Gravity.LEFT | android.view.Gravity.BOTTOM);
            Clock.TEXT.setPadding(2 * Help.DP, 2 * Help.DP, 2 * Help.DP, 2 * Help.DP);
            const PW = new android.widget.PopupWindow(Clock.TEXT, 30 * Help.DP, 15 * Help.DP, false);
            PW.setTouchable(false);
            PW.showAtLocation(Help.CONTEXT.getWindow().getDecorView(), android.view.Gravity.LEFT | android.view.Gravity.BOTTOM, 0, 0);
        } catch(err) {
            Help.print("Screen ERROR");
        }
    });
};

/** Resource Download */
if(java.io.File(Help.DIR + "minecraft.ttf").exists()) {
    Clock.screen();
    new  java.lang.Thread(new java.lang.Runnable({
        run: function() {
            try {
                while(true) {
                    var time = new Date();
                    Help.uiThread(function() {
                        Clock.TEXT.setText(time.getHours() + " : " + time.getMinutes());
                    });
                    java.lang.Thread.sleep(500);
                }
            } catch(err) {
                Help.print("Date ERROR");
            }
        }
    })).start();
} else {
    java.io.File(Help.DIR).mkdirs();
    Help.download("url", "/games/com.mojang/minecraftResources/", "minecraft.ttf");
    Help.print("Downloading Resource...");
    Help.print("Created by Chan. (gml1580.blog.me)");
}

/** Date() TEST */
const modTick = function() {
    if(false) {
        const DATE = new Date();
        ModPE.showTipMessage(DATE.getHours() + " : " + DATE.getMinutes());
    }
};