// Javascript file functioning as the core of the memory game
// this file is written by Gijs Entius

// game running boolean
var running = false;
// used to store the colours in when a new game is started
var colourOpen;
var colourClosed;
var colourFound;
var closedCardText;
// time the game is running in seconds
var time;
var timeIntervalID = null;
var timeLeft; // modified by the game difficulty
var timeLeftModifiedWidth;
var timeLeftIntervalID = null;
//variables that hold all data regarding game objects 
var openCardOne = null;
var openCardTwo = null;
var cardsValues = [];
var foundCards = [];
// highscores per quantity of cards
var highScores = [
	[], //difficulty A
	[], // difficulty B
	[], // difficulty C
];
// game difficulty
var size;
var difficulty;

//source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
var currentIndex = array.length, temporaryValue, randomIndex;
// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

function isEqualCard(card1, card2) {
	return card1.attr('id') === card2.attr('id');
}

function isInArray(array, card) {
	for(var i=0;i<array.length;i++) {
		if(isEqualCard(card, array[i])) return true;
	}
	return false;
}

function showHighscores() {
	var highscoresLocal;
	if(difficulty !== null) {
		highscoresLocal = highScores[difficulty];
	} else {
		// show standard highscores because apparently size is not set
		highscoresLocal = highScores[2]; // size 6 highscores
	}
	// show highscores
}

function getNumberOfPairsFound() {
	return foundCards.length / 2;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// not all browsers support indexOf (*kuch* IE)
function removeElementFromArray(array, element) {
	var index = array.indexOf(element);
	if (index > -1) { // -1 is returned when the element is not in the array
		array.splice(index, 1);
	}
}

// indicates if the current game is finished
function isFinished() {
	return cardsValues.length === foundCards.length; // returns true if all cardsValues have been found
}

function handleFinishedGame() {
	stopTimers();
	running = false;
	// do stuff with highscores etc.

}

function stopTimers() {
	stopTimer(timeIntervalID);
	// stopTimer(timeLeftIntervalID);

	function stopTimer(intervalID) {
		if (intervalID !== null) { // always stop the previous game timer
			clearInterval(intervalID);
			intervalID = null;
		}
	}
}

function startGameTimer() {
	stopTimers();
	timeIntervalID = setInterval(function () {
		time += 1;
		timeLeft -= 1;
		if(timeLeft === 0) {
			handleFinishedGame();
		}
		$('#timeLeft').css('width', (timeLeft*timeLeftModifiedWidth) + 'px');
		$('#tijd').text(time);
	}, 1000);
}

function initVariables() {
	timeLeft = (difficulty * 30) + 10; // adjust the time here
	timeLeftModifiedWidth = 185/timeLeft; // 185 is width of the button
	foundCards = [];
	openCardOne = null;
	openCardTwo = null;
	time = 0;
	$('#tijd').text(time);
	startGameTimer();
	initColours();
	initCardText();
}

function initColours() {
	colourClosed = $('#valueinactive').val();
	colourOpen = $('#valueactive').val();
	colourFound = $('#valuefound').val();
}

function initCardText() {
	closedCardText = $('#character').val();
}

function cardClicked(card) {
	if(isInArray(foundCards, card) || !running) return;
	if(openCardOne !== null) {
		if (openCardOne !== null && openCardTwo !== null) return;
		if (isEqualCard(openCardOne, card)) return;
		openCardTwo = openCard(card);
		if(openCardOne.text() === openCardTwo.text()) {
			foundCardDuo(openCardOne, openCardTwo);
			if (isFinished()) {
				// game is finished stop timer and display something
				handleFinishedGame();
			}
		} else {
			setTimeout(closeCards, 1000);
		}
	} else {
		openCardOne = openCard(card);
	}
}

function openCard(card) {
	card.css('background-color', '#' + colourOpen).text(cardsValues[card.attr('id')]);
	return card;
}

function closeCards() {
	openCardOne = null;
	openCardTwo = null;
	$('.card').css('background-color', '#' + colourClosed).text(closedCardText);
}

// TODO fix the removing of cards that are found
function foundCardDuo(card1, card2) { 
	// change class so the cards will not flip back
	foundCards.push(card1.attr('class', 'foundCard'));
	foundCards.push(card2.attr('class', 'foundCard'));
	card1.css('background-color', '#' + colourFound);
	card2.css('background-color', '#' + colourFound);
	openCardOne = null;
	openCardTwo = null;
	$('#gevonden').text(getNumberOfPairsFound()); // update the text on the screen
}

function makeCardsClickable() {
	$('.card').click(function () {
		cardClicked($(this));
	});
}

function makeFoundCardsNotClickable() {
	$('.foundCard').click(false);
}

function generateCards(fieldSize) {
	var possibleCards = [];
	for(var i=0; i<(fieldSize*fieldSize)/2;i++) {
		possibleCards.push(String.fromCharCode(97+i));
		possibleCards.push(String.fromCharCode(97+i));
	}
	cardsValues = shuffle(possibleCards);
	console.log(cardsValues); // for debugging purposes
}

function buildCards(fieldSize) {
	var table = $("#speelVeld");
	var speelVeld = '';
	for (var row = 0; row < fieldSize; row++) {
		speelVeld += '<tr>'; // open table row
			for (var col = 0; col < fieldSize; col++) {
					speelVeld += `<td id="${row * fieldSize + col}" class="card" style="background-color: #${colourClosed}">${closedCardText}</td>`;
			}
			speelVeld += '</tr>';
	}
	table.html(speelVeld);
}

function initCards(fieldSize) {
	generateCards(fieldSize);
	buildCards(fieldSize);
	makeCardsClickable();
}

// fix the issue when the game ends variables are not reset
function initGame(fieldSize) {
	initVariables();
	initCards(fieldSize);
	running = true;
}

$('#size').on('change', showHighscores);

$(document).ready(function () {
	$('#opnieuw').click(function () {
		size = $('#size').val();
		difficulty = (size / 2) - 1 // 2, 4, 6 --> 0, 1, 2 for array indexing 
		initGame(size);
	});
});