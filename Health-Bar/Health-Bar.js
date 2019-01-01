/**
 * @author Chan Lugeon <chanlugeon@protonmail.com>
 * @version 1.0
 */

const SM = net.zhuoweizhang.mcpelauncher.ScriptManager;

const Help = {};

Help.CONTEXT = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

Help.DP = android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_DIP, 2,
    Help.CONTEXT.getResources().getDisplayMetrics());

Help.uiThread = function(callback) {
    this.CONTEXT.runOnUiThread(new java.lang.Runnable({
        run: callback
    }));
};

Help.showToast = function(text) {
    this.uiThread(function() {
        android.widget.Toast.makeText(Help.CONTEXT, text, android.widget.Toast.LENGTH_SHORT).show();
    });
};

Help.getErrMsg = function(err) {
    return err.type + ": " + err.message + " #" + err.lineNumber;
};

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

Help.createPw = function(view, width, height, focusable, touchable) {
    const pw = new android.widget.PopupWindow(view, width * Help.DP, height * Help.DP, focusable);
    if(focusable) {
        pw.setBackgroundDrawable(null);
    }
    pw.setTouchable(touchable);

    return pw;
};

Help.showPw = function(pw, gravity, x, y) {
    pw.showAtLocation(Help.CONTEXT.getWindow().getDecorView(), gravity, x * Help.DP, y * Help.DP);
};

const Screen = {
    WIDTH: Help.CONTEXT.getScreenWidth(),
    HEIGHT: Help.CONTEXT.getScreenHeight()
};

const Health = {};

Health.MOB_TYPE_ID = 
    [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

Health.ENTITY = -1;
Health.DELAY = 0;

/**
 * Create the transparent helath window.
 */ 
(function() {
    Help.uiThread(function() {
        try {
            const width = Screen.WIDTH / Help.DP / 3.2,
            height = Screen.HEIGHT / Help.DP / 11.2;

            const progress = new android.widget.ProgressBar(Help.CONTEXT, null,
                android.R.attr.progressBarStyleHorizontal);
            progress.getProgressDrawable().setDrawableByLayerId(android.R.id.progress,
                new android.graphics.drawable.ClipDrawable(android.graphics.drawable.ColorDrawable(
                android.graphics.Color.parseColor("#ff5050")), android.view.Gravity.LEFT,
                android.graphics.drawable.ClipDrawable.HORIZONTAL));
            progress.getProgressDrawable().setDrawableByLayerId(android.R.id.background,
                android.graphics.drawable.ColorDrawable(android.graphics.Color.parseColor("#80000000")));

            const text = new android.widget.TextView(Help.CONTEXT);
            text.setTextColor(android.graphics.Color.WHITE);
            text.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, 8 * Help.DP);
            text.setGravity(android.view.Gravity.CENTER);

            const layout = new android.widget.RelativeLayout(Help.CONTEXT);
            Help.addView(layout, progress, 0, 0, width, height);
            Help.addView(layout, text, 0, 0, width / 2, height);
            layout.setAlpha(0);

            Help.showPw(Help.createPw(layout, width, height, false, false),
                android.view.Gravity.LEFT | android.view.Gravity.TOP,
                Screen.WIDTH / Help.DP / 10, Screen.HEIGHT / Help.DP / 4.5);

            Health.PROGRESS = progress;
            Health.TEXT = text;
            Health.LAYOUT = layout;
        } catch(err) {
            Help.showToast(Help.getErrMsg(err));
        }
    });
})();

Health.delayHide = function() {
    if(Health.DELAY > 0) {
        Health.DELAY--;
        if(Health.DELAY === 0) { //HIDE (OFF)
            Health.ENTITY = -1;
            Help.uiThread(function() {
                try {
                    Health.LAYOUT.setAlpha(0);
                } catch(err) {
                    Help.showToast(Help.getErrMsg(err));
                }
            });
        }
    }
};

const modTick = function() {
    const ent = SM.nativePlayerGetPointedEntity(),
    entId = SM.nativeGetEntityTypeId(ent);

    if(Health.ENTITY !== -1) { //UPDATE
        Help.uiThread(function() {
            try {
                const entHealth = SM.nativeGetMobHealth(Health.ENTITY);
                const maxHealth = SM.nativeGetMobMaxHealth(Health.ENTITY);
                if(maxHealth === -1) {
                    if(Health.DELAY > 5) Health.DELAY = 5;
                } else {
                    Health.PROGRESS.setProgress(entHealth);
                    Health.TEXT.setText(entHealth + " / " + maxHealth);
                }
            } catch(err) {
                Help.showToast(Help.getErrMsg(err));
            }
        });
    }

    if(Health.MOB_TYPE_ID.indexOf(entId) === -1) {
        Health.delayHide();
        return;
    }

    var entHealth = SM.nativeGetMobHealth(ent);
    if(SM.nativeGetMobHealth(ent) < 0) {
        entHealth = 0;
    }

    if(ent !== -1) {
        if(Health.ENTITY !== ent) { //SETTING (ON)
            Health.ENTITY = ent;
            Health.DELAY = 40;
            Help.uiThread(function() {
                try {
                    const maxHealth = SM.nativeGetMobMaxHealth(ent);
                    Health.PROGRESS.setMax(maxHealth);
                    Health.PROGRESS.setProgress(entHealth);
                    Health.TEXT.setText(entHealth + " / " + maxHealth);
                    Health.LAYOUT.setAlpha(1);
                } catch(err) {
                    Help.showToast(Help.getErrMsg(err));
                }
            });
        }
    } else {
        Health.delayHide();
    }
};

const leaveGame = function() {
    Health.ENTITY = -1;
    Health.DELAY = 0;
    Help.uiThread(function() {
        try {
            Health.LAYOUT.setAlpha(0);
        } catch(err) {
            Help.showToast(Help.getErrMsg(err));
        }
    });
};