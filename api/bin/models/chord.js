const  Chord = require('chord-expressions').Chord;
console.log(Chord);
module.exports = {
    getChordFromNotation: function(chordNotation){
    return Chord.chordFromNotation(chordNotation);
}

};
