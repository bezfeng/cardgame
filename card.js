/**
 * g = guard
 * c = courtier
 * d = diplomat
 * s = shugenja
 * h = hatamoto
 * m = manipulator
 * s = sensei
 * p = princess
 */
function Card(shortCode) {
  this.shortCode = shortCode;
  this.name = "";
  this.value = 0;
  
  switch (shortCode) {
    case "g":
      this.name = "Guard"
      this.value = 1;
      break;
    case "c":
      this.name = "Courtier"
      this.value = 2;
      break;
    case "d":
      this.name = "Diplomat"
      this.value = 3;
      break;
    case "sh":
      this.name = "Shugenja"
      this.value = 4;
      break;
    case "h":
      this.name = "Hatamoto"
      this.value = 5;
      break;
    case "m":
      this.name = "Manipulator"
      this.value = 6;
      break;
    case "s":
      this.name = "Sensei"
      this.value = 7;
      break;
    case "p":
      this.name = "Princess"
      this.value = 8;
      break;
  }
}

Card.countInDeck = function(cardValue) {
  if (cardValue === 1) {
    return 5;
  } else if (cardValue > 1 && cardValue <= 5) {
    return 2;
  } else {
    return 1;
  }
}

Card.types = function() {
  var array = ["g", "c", "d", "sh", "h", "m", "s", "p"];
  return array;
}

module.exports = Card;