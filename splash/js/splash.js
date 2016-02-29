


/**
 * Conway's Game of Life.
 *
 * A simple Javascript implementation by ankr.
 *
 * @author http://ankr.dk
 */
$(document).ready(function() {
var board = document.getElementById('c').getContext('2d'),
    cells = [];
    
    function getStyleRuleValue(style, selector, sheet) {
    var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
    for (var i = 0, l = sheets.length; i < l; i++) {
        var sheet = sheets[i];
        if( !sheet.cssRules ) { continue; }
        for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
            var rule = sheet.cssRules[j];
            if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {/*if (rule.selectorText.split(',').indexOf(selector) !== -1) { */
                return rule.style[style];
            }
        }
    }
    return null;
}
    
    function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}
    
board.strokeStyle = '#e1e1e1'; /*GRID color */
/*board.fillStyle = '#ff7a00'; /*space color */

try {
var testing=document.getElementById("c");
var ctx=testing.getContext("2d");
var img=document.getElementById("life-board-alive");
var pat=board.createPattern(img,"repeat");

board.fillStyle=pat;

/*var aliveimg = document.getElementById("aliveimg"); */
/*var pat = board.createPattern("../image/bg.png","repeat");*/ /*createPattern(aliveimg, "no-repeat"); */    
}
catch (err) {
    console.log("hmm pat is ", pat);
    var trest = getStyleRuleValue('color', '.life-board-alive');   /*document.styleSheets[9]); */
    console.log("Errr wss ", trest, rgb2hex(trest));
    /*pat = rgb2hex(trest); */
    console.log("failed to get image from url for alive cell");
}
board.fillStyle=pat;


init();

/**
 * Initialize game.
 *
 * Will place a Gosper glider gun in the world and start simulation.
 */
function init() {
    for (var i=0; i<17; i++) {
        cells[i] = [];
        for (var j=0; j<17; j++) {
            cells[i][j] = 0;
        }
    }
    
    // Prefilled cells
    [
        // Gosper glider gun
     //   [1, 5],[1, 6],[2, 5],[2, 6],[11, 5],[11, 6],[11, 7],[12, 4],[12, 8],[13, 3],[13, 9],[14, 3],[14, 9],[15, 6],[16, 4],[16, 8],[17, 5],[17, 6],[17, 7],[18, 6],[21, 3],[21, 4],[21, 5],[22, 3],[22, 4],[22, 5],[23, 2],[23, 6],[25, 1],[25, 2],[25, 6],[25, 7],[35, 3],[35, 4],[36, 3],[36, 4],
     //ALL ON (DEV)
    [1, 1],[1, 2],[1, 3],[1, 4],[1, 5],[1, 6],[1, 7],[1, 8],[1, 9],[1, 10],[1, 11],[1, 12],[1, 13],[1, 14],[1, 15],[1, 16],
    [2, 1],[2, 2],[2, 3],[2, 4],[2, 5],[2, 6],[2, 7],[2, 8],[2, 9],[2, 10],[2, 11],[2, 12],[2, 13],[2, 14],[2, 15],[2, 16],
    [3, 1],[3, 2],[3, 3],[3, 4],[3, 5],[3, 6],[3, 7],[3, 8],[3, 9],[3, 10],[3, 11],[3, 12],[3, 13],[3, 14],[3, 15],[3, 16],
    [4, 1],[4, 2],[4, 3],[4, 4],[4, 5],[4, 6],[4, 7],[4, 8],[4, 9],[4, 10],[4, 11],[4, 12],[4, 13],[4, 14],[4, 15],[4, 16],
    [5, 1],[5, 2],[5, 3],[5, 4],[5, 5],[5, 6],[5, 7],[5, 8],[5, 9],[5, 10],[5, 11],[5, 12],[5, 13],[5, 14],[5, 15],[5, 16],
        // Random cells
        // If you wait enough time these will eventually take part
        // in destroying the glider gun, and the simulation will be in a "static" state.
        //[60, 47],[61,47],[62,47],
        //[60, 48],[61,48],[62,48],
        //[60, 49],[61,49],[62,49],
        //[60, 51],[61,51],[62,51],
    ]
    .forEach(function(point) {
        cells[point[0]][point[1]] = 1;
    });
    
    update();
}

/**
 * Check which cells are still alive.
 */
function update() {
    
    var result = [];
    
    /**
     * Return amount of alive neighbours for a cell
     */
    function _countNeighbours(x, y) {
        var amount = 0;
        
        function _isFilled(x, y) {
            return cells[x] && cells[x][y];
        }
        
        if (_isFilled(x-1, y-1)) amount++;
        if (_isFilled(x,   y-1)) amount++;
        if (_isFilled(x+1, y-1)) amount++;
        if (_isFilled(x-1, y  )) amount++;
        if (_isFilled(x+1, y  )) amount++;
        if (_isFilled(x-1, y+1)) amount++;
        if (_isFilled(x,   y+1)) amount++;
        if (_isFilled(x+1, y+1)) amount++;
        
        return amount;
    }
    
    cells.forEach(function(row, x) {
        result[x] = [];
        row.forEach(function(cell, y) {
            var alive = 0,
                count = _countNeighbours(x, y);
            
            if (cell > 0) {
                alive = count === 2 || count === 3 ? 1 : 0;
            } else {
                alive = count === 3 ? 1 : 0;
            }
            
            result[x][y] = alive;
        });
    });
    
    cells = result;
    
    draw();
}

/**
 * Draw cells on canvas
 */
function draw() {
    board.clearRect(0, 0, 1512, 1512);
    cells.forEach(function(row, x) {
        row.forEach(function(cell, y) {
            board.beginPath();
            //here is the board size as in actual size not number of alive/dead
            board.rect(x*24, y*24, 24, 24);
            if (cell) {
                board.fill();
            } else {
                board.stroke();
            }
        });
    });
    setTimeout(function() {update();}, 70);
    //window.requestAnimationFrame(update); // Too fast!
}
});