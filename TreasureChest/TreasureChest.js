/**
 * @author Chan Lugeon <chanlugeon@protonmail.com>
 * @version 2.0
 */

Box = {};

//constants
Box.DEBUG = false;
Box.ID = 54;

//variables
Box.NEXT = false;

Box.debugPrint = function(str) {
    if(Box.DEBUG) {
        print(str);
    }
};

Box.isDay = function() {
    return Level.getTime() % 19200 < 12000;
};

Box.getDataDir = function(str) {
    return Level.getWorldDir() + "/" + str;
};

Box.random = function(num) {
    return Math.floor(Math.random() * (num + 1)); //0 ~ num
}

Box.spawnChest = function() {
    var x = Box.random(64);
    const y = 127;
    var z = Box.random(64);

    switch(Box.random(3)) {
        case 0:
            x = -x;
            break;

        case 1:
            z = -z;
            break;

        case 2:
            x = -x;
            z = -z;
            break;
        //case 3: x = x, y = y
    }

    x += Player.getX();
    z += Player.getZ();
    //Box.debugPrint(x + " " + y + " " + z);

    //Level.setTile(x, y, z, Box.ID);
    Box.gravityChest(x, y, z);
};

Box.gravityChest = function(x, y, z) {
    const yy = y - 1;
    const tile = Level.getTile(x, yy, z);

    if(tile === 0 || tile >= 8 && tile <= 11) { //AIR || WATER || LAVA
        //Level.setTile(x, y, z, 0);
        //Level.setTile(x, yy, z, Box.ID);
        Box.gravityChest(x, yy, z);
    } else { //Create item in chest.
        Level.setTile(x, y, z, Box.ID);
        Box.createItem(x, y, z);
    }
};

Box.getRandomItem = function() {
    /**
    * ITEM LINE
    * 256 ~ 258 3
    * 267 ~ 279 13
    * 283 ~ 286 4
    * 290 ~ 294 5
    * 298 ~ 317 20
    * Item Total: 45
    */
    var random = Box.random(39) + 1;

    if(random <= 2) {
        random = Box.random(2) + 256;
    } else if(random <= 14) {
        random = Box.random(12) + 267;
    } else if(random <= 17) {
        random = Box.random(3) + 283;
    } else if(random <= 21) {
        random = Box.random(4) + 290;
    } else { //<= 40
        random = Box.random(19) + 298;
    }

    return random;
};

Box.createItem = function(x, y, z) {
    switch(Box.random(2)) { //count
        case 0: //one
            Level.setChestSlot(x, y, z, Box.random(26), Box.getRandomItem(), 0, 1);
            break;

        case 1: //two
            Level.setChestSlot(x, y, z, Box.random(26), Box.getRandomItem(), 0, 1);
            Level.setChestSlot(x, y, z, Box.random(26), Box.getRandomItem(), 0, 1);
            break;

        default: //case 3: three
            Level.setChestSlot(x, y, z, Box.random(26), Box.getRandomItem(), 0, 1);
            Level.setChestSlot(x, y, z, Box.random(26), Box.getRandomItem(), 0, 1);
            Level.setChestSlot(x, y, z, Box.random(26), Box.getRandomItem(), 0, 1);
            break;
    }
};

const newLevel = function() {
    const DATA = ModPE.readData(Box.getDataDir("NEXT"));
    if(DATA !== "") {
        Box.NEXT = eval(DATA); //LOAD DATA
        Box.debugPrint("DATA: " + Box.NEXT);
    }
};

const leaveGame = function() {
    //save & reset
    ModPE.saveData(Box.getDataDir("NEXT"), Box.NEXT + "");
    Box.NEXT = false;
};

const modTick = function() {
    if(!Box.NEXT) {
        if(!Box.isDay()) {
            Box.NEXT = true;
            Box.debugPrint("Night");
            Box.spawnChest();
            ModPE.saveData(Box.getDataDir("NEXT"), Box.NEXT + "");
        }
    } else {
        if(Box.isDay()) {
            Box.NEXT = false;
            Box.debugPrint("Day");
            ModPE.saveData(Box.getDataDir("NEXT"), Box.NEXT + "");
        }
    }
};

/** FOR TEST */
const useItem = function(x, y, z, itemId) {
    if(Box.DEBUG && itemId === 0) {
        Box.spawnChest();
        Box.debugPrint("Spawn Chest");
    }
};