function shuffleArray(array, condition = (_ => true)) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    if (!condition(array)) return shuffleArray(array, condition);
    else return array;
}

class VariantController {
    constructor() {
        this.init = false;
        this.options = [false, false, false];
    }

    start(typeID) {
        switch(typeID) {
            case 0:
                Vue.set(this, "game", new ChessGame(8, 8, [
                    [8,9,10,11,12,10,9,8],
                    [7,7,7,7,7,7,7,7],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [1,1,1,1,1,1,1,1],
                    [2,3,4,5,6,4,3,2]
                ], null, true, controller.options));
                break;
            case 1:
                let br1 = [8,9,10,11,12,10,9,8];
                let br2 = [2,3,4,5,6,4,3,2];
                br1 = shuffleArray(br1, arr => arr.indexOf(8) < arr.indexOf(12) && arr.indexOf(12) < arr.lastIndexOf(8) && arr.indexOf(10) % 2 != arr.lastIndexOf(10));
                br2 = shuffleArray(br2, arr => arr.indexOf(2) < arr.indexOf(6) && arr.indexOf(6) < arr.lastIndexOf(2) && arr.indexOf(4) % 2 != arr.lastIndexOf(4));
                Vue.set(this, "game", new ChessGame(8, 8, [
                    br1,
                    [7,7,7,7,7,7,7,7],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [1,1,1,1,1,1,1,1],
                    br2
                ], null, false, controller.options));
                break;
            case 2:
                Vue.set(this, "game", new ChessGame(8, 8, [
                    [7,7,7,0,0,7,7,7],
                    [7,7,7,7,7,7,7,7],
                    [7,7,7,7,7,7,7,7],
                    [7,7,7,7,7,7,7,7],
                    [0,0,0,7,7,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [1,1,1,1,1,1,1,1],
                    [2,3,4,5,6,4,3,2]
                ], null, true, controller.options));
                break;
        }

        this.init = true;
    }
}

var controller = new VariantController();