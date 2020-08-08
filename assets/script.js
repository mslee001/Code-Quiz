//variables to link to html DOM elements
var start = document.getElementById("start");
var test = document.getElementById("test");
var question = document.getElementById("question");
var optionA = document.getElementById("A");
var optionB = document.getElementById("B");
var optionC = document.getElementById("C");
var optionD = document.getElementById("D");
var answer = document.getElementById("answer");
var finalScore = document.getElementById("finalscore");
var highScores = document.getElementById("highscores");
var testComplete = document.getElementById("complete");
var nameInput = document.getElementById("name");
var form = document.getElementById("form");
var msgDiv = document.getElementById("msg");
var allScores = document.getElementById("all-scores");
var allSavedScores = document.getElementById("all-saved-scores");
var timer = document.getElementById("timer");

//Global variables
var testQuestions = [
    {
        question: "When a user views a page containing a JavaScript program, which machine actually executes the script?",
        answers: {
            a: "The User's machine running a Web browser",
            b: "The Web server",
            c: "A central machine deep within Netscape's corporate offices",
            d: "None of the above"
        },
        correctAnswer: "A"
    },
    {
        question: "______ JavaScript is also called client-side JavaScript",
        answers: {
            a: "Microsoft",
            b: "Navigator",
            c: "LiveWire",
            d: "Native"
        },
        correctAnswer: "B"
    },
    {
        question: "Which of the following can't be done with client-side JavaScript?",
        answers: {
            a: "Validating a form",
            b: "Sending a form's contents by email",
            c: "Storing the form's contents to a database file on the server",
            d: "None of the above"
        },
        correctAnswer: "C"
    },
    {
        question: "Which of the following is not considered a JavaScript operator?",
        answers: {
            a: "new",
            b: "this",
            c: "delete",
            d: "typeof"
        },
        correctAnswer: "B"
    },
    {
        question: "What is meant by 'this' keyword in javascript?",
        answers: {
            a: "It refers to the current object",
            b: "It refers to the previous object",
            c: "It is a variable which contains a value",
            d: "None of the above"
        },
        correctAnswer: "A"
    }
];

var lastQuestion = testQuestions.length - 1;
var currentQuestion = 0;
var score = 0;
var scoresArray = [];
var seconds = 0;
var secondsElapsed = 0;
var interval;

//function to retrieve local storage data and save to array
init();

//EVENT LISTENERS

//This will display the high scores in local storage when a user clicks on "View Highscores"
highScores.addEventListener("click", renderAllScores);

//This will reload the page to get back to the Start Test button
document.getElementById("back").addEventListener("click", function() {
    location.reload();
})

//This will remove the highscores from the array and delete local storage
document.getElementById("clear").addEventListener("click", function(){
    localStorage.clear();
    scoresArray.splice(0, scoresArray.length);
    renderAllScores();
})

//This triggers the beginning of the exam. The first question displays and the timer starts
start.addEventListener("click", function(event) {
    var element = event.target;
    if (element.matches("input")) {
        answer.style.display= "none";
        renderQuestion();
        startTimer();
    }
});

//This will save the user name and score to local storage and display a list of high scores.
form.addEventListener("submit", function(event){
    event.preventDefault();

    var saveScore = 
        {
            name: nameInput.value.trim(),
            score: score
        };

    if (saveScore.name === ""){
        displayMessage("error", "name cannot be blank");
    } 
        scoresArray.push(saveScore);
        localStorage.setItem("scoresarray", JSON.stringify(scoresArray));
        renderAllScores();
    
})

//Function to display the questions. Once an answer is selected
function renderQuestion() {
    start.style.display = "none";
    test.style.display = "block";
    
    let q = testQuestions[currentQuestion];
    
    //displays whether the user got the question right or wrong
    if (currentQuestion != 0) {
        setTimeout(function () {
            answer.style.display= "none";
            }, 500);
    }
    
    //remove the target from the buttons
    optionA.blur();
    optionB.blur();
    optionC.blur();
    optionD.blur();
    
    //displays question and answers
    question.innerHTML = q.question;
    optionA.value = q.answers.a;
    optionB.value = q.answers.b;
    optionC.value = q.answers.c;
    optionD.value = q.answers.d;
}

//Displays a message to the user if they do not enter any text in the name field when inputting their name to save their score.
function displayMessage(type, message) {
    msgDiv.textContent = message;
    msgDiv.setAttribute("class", type);
}

//Checks whether the user's selected answer is right or wrong
function checkAnswer(answer) {
    //Correct answers add 10 points to the score
    if (answer == testQuestions[currentQuestion].correctAnswer) {
        score += 10;
        correctAnswer();
        //incorrect answer subtract 10 seconds from the timer
    } else {
        seconds -= 10;
        wrongAnswer();
    }
    //questions will continue to render until it gets to the last one
    if (currentQuestion < lastQuestion) {
        currentQuestion++;
        renderQuestion();
    //If there are no more questions, the score will display
    } else {
        renderScore();
    }
}

//function to display the score, text input for user name and submit button to save score
function renderScore() {
    test.style.display = "none";
    testComplete.style.display = "block";
    finalScore.textContent = "Your score is " + score;
    stopTimer();
}

//displays when the user selected a correct answer
function correctAnswer() {
    answer.style.display= "inherit";
    answer.textContent = "Correct!";
}

//displays when the user selected an incorrect answer
function wrongAnswer() {
    answer.style.display= "inherit";
    answer.textContent = "Wrong!";
}

//displays high scores
function renderAllScores() {
    start.style.display = "none";
    test.style.display = "none";
    complete.style.display = "none";
    allScores.style.display = "block";

    //scores are sorted with highest score on top
    allSavedScores.textContent = "";
    scoresArray.sort(function (a, b) {
        return b.score - a.score;
    });

    //for each item in scoresArray, a list element will be created and displayed
    for (var i=0; i < scoresArray.length; i++) {
        var scores = scoresArray[i];

        var li = document.createElement("li");
        li.textContent = scores.name + ":    " + scores.score;
        li.setAttribute("data-index", i);

        allSavedScores.appendChild(li);

    }
}

//Gets what's in local storage and saved to array in order to properly display within the high scores list
function init() {
    var storedScores = JSON.parse(localStorage.getItem("scoresarray"));
    if (storedScores !== null) {
        scoresArray = storedScores;
    }
}

//function to set the timer
function setTime() {
    seconds = 45;
    clearInterval(interval);
}

//displays the timer
function renderTime() {
    timer.innerHTML = "Time Left: " + getFormattedSeconds();
    if (secondsElapsed >= seconds) {
        stopTimer();
        alert("Time's Up!");
        renderScore();
    }
}

//stops the timer when the user is either out of time or has completed all questions
function stopTimer() {
    secondsElapsed = 0;
    setTime();
    renderTime()
}

//starts the timer
function startTimer() {
    setTime();
    if (seconds > 0) {
        interval = setInterval(function() {
            secondsElapsed++;
            renderTime();
        }, 1000);
    }
}

//function for secoonds
function getFormattedSeconds() {
    var secondsLeft = (seconds - secondsElapsed) % 60;
    var formattedSeconds;

    if (secondsLeft < 10) {
      formattedSeconds = "0" + secondsLeft;
    } else {
      formattedSeconds = secondsLeft;
    }
  
    return formattedSeconds;
  }