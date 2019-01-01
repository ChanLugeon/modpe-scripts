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
    this.CONTEXT.runOnUiThread(new java.lang.Runnable({
        run: callback
    }));
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

//ChatColor Plus
ChatColor.BOLD = ChatColor.BEGIN + "l";
ChatColor.STRIKETHROUGH = ChatColor.BEGIN + "m";
ChatColor.UNDERLINE = ChatColor.BEGIN + "n";
ChatColor.ITALIC = ChatColor.BEGIN + "o";
ChatColor.NORMAL = ChatColor.BEGIN + "r";

const Colorful = {};

Colorful[ChatColor.BLACK] = "#000000";
Colorful[ChatColor.DARK_BLUE] = "#0000aa";
Colorful[ChatColor.DARK_GREEN] = "#00aa00";
Colorful[ChatColor.DARK_AQUA] = "#00aaaa";
Colorful[ChatColor.DARK_RED] = "#aa0000";
Colorful[ChatColor.DARK_PURPLE] = "#aa00aa";
Colorful[ChatColor.GOLD] = "#ffaa00";
Colorful[ChatColor.GRAY] = "#aaaaaa";
Colorful[ChatColor.DARK_GRAY] = "#555555";
Colorful[ChatColor.BLUE] = "#5555ff";
Colorful[ChatColor.GREEN] = "#55ff55";
Colorful[ChatColor.AQUA] = "#55ffff";
Colorful[ChatColor.RED] = "#ff5555";
Colorful[ChatColor.LIGHT_PURPLE] = "#ff55ff";
Colorful[ChatColor.YELLOW] = "#ffff55";
Colorful[ChatColor.WHITE] = "#ffffff";

Colorful[ChatColor.BOLD] = android.text.style.StyleSpan(android.graphics.Typeface.BOLD);
Colorful[ChatColor.STRIKETHROUGH] = new android.text.style.StrikethroughSpan();
Colorful[ChatColor.UNDERLINE] = android.text.style.UnderlineSpan();
Colorful[ChatColor.ITALIC] = android.text.style.StyleSpan(android.graphics.Typeface.ITALIC);

/**
 * Create a colorful text(string builder).
 * @param {String} text
 * @return {SpannableStringBuilder}
 */
Colorful.createBuilder= function(text) {
    const builder = android.text.SpannableStringBuilder(text);
    this.setSpan(builder, text, text.length, 0);

    return builder;
};

/**
 * @param {SpannableStringBuilder} builder
 * @param {String} text
 * @param {Number} length
 * @param {Number} oldIndex
 */
Colorful.setSpan = function(builder, text, length, oldIndex) {
    const index = text.indexOf(ChatColor.BEGIN);
    if(index !== -1) {
        const color = Colorful[text.substring(index, index + 2)], startIndex = oldIndex + index;
        var len = text.indexOf(ChatColor.NORMAL) + oldIndex;
        if(len < oldIndex) len = length;
        switch(typeof color) {
            case "string":
                builder.setSpan(android.text.style.ForegroundColorSpan(android.graphics.Color.parseColor(color)),
                    startIndex, len, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                break;

            case "object":
                builder.setSpan(color, startIndex, len, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                break;
        }
        builder.setSpan(android.text.style.AbsoluteSizeSpan(1), startIndex, startIndex + 2,
            android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        this.setSpan(builder, text.substring(index + 2, text.length), length, startIndex + 2);
        return;
    }
};



/**
 * Example
 */
const Debug = {};

Debug.TEXT = null;
Debug.PW = null;

Debug.createTextView = function() {
    Help.uiThread(function() {
        try {
            const text = new android.widget.TextView(Help.CONTEXT);
            text.setGravity(android.view.Gravity.CENTER);
            text.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, 14 * Help.DP);
            text.setShadowLayer(0.00001, Help.DP, Help.DP, android.graphics.Color.WHITE);
            text.setTextColor(android.graphics.Color.parseColor("#ffffa1"));
            const builder = Colorful.createBuilder("§§n§2C§ao§llor§o§4M§r§aa§mtic");
            text.setText(builder);

            const pw = new android.widget.PopupWindow(text, 140*Help.DP, 36*Help.DP, false);
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
            const builder = Colorful.createBuilder(str, "#e1e1e1");
            Debug.TEXT.setText(builder);
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