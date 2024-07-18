// script.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const questionContainer = document.getElementById('questionContainer');
    const submitAnswersButton = document.getElementById('submitAnswers');
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    let currentUser = null;
    let questions = [];

    // Function to handle user registration
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            saveUser(username, password);
            alert('User registered successfully!');
            window.location.href = 'index.html';
        });
    }

    // Function to handle user login
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            //getting credentials from fields
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const authResult = authenticateUser(username, password);
            if (authResult === 'success') {
                currentUser = username;
                alert('Login successful!');
                sessionStorage.setItem('currentUser', currentUser); // Store current user in sessionStorage
                window.location.href = 'quiz.html';
            } else if (authResult === 'not_registered') {
                alert('Username not registered');
            } else if (authResult === 'wrong_password') {
                alert('Incorrect password');
            }
        });
    }

    // Fetch questions from the API. This is the networking request
    async function fetchQuestions() {
        const response = await fetch('https://opentdb.com/api.php?amount=5&category=21&difficulty=medium&type=multiple');
        const data = await response.json();
        questions = data.results;
        loadQuiz();
    }

    // Save user data to localStorage
    function saveUser(username, password) {
        let users = JSON.parse(localStorage.getItem('users')) || []; 
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Authenticate user from localStorage
    function authenticateUser(username, password) {
        //Usinfg this meethod you will have to search the entire array 
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.username === username);
        if (!user) {
            return 'not_registered';
        } else if (user.password !== password) {
            return 'wrong_password';
        } else {
            return 'success';
        }
    }

    // Load quiz questions

    function loadQuiz() {
        questionContainer.innerHTML = '';
        questions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'question';
            // @ ${[question.correct_answer, ...question..... we mix both the correct answer and the incorrect in one array and sort them to make the choices random.
            questionElement.innerHTML = `
                <p>${index + 1}. ${question.question}</p>
                ${[question.correct_answer, ...question.incorrect_answers].sort().map(answer => `
                    <label>
                        <input type="radio" name="question${index}" value="${answer}">
                        ${answer}
                    </label>
                `).join('')}
            `;
            questionContainer.appendChild(questionElement);
        });
        submitAnswersButton.style.display = 'block';
    }

    // Save answers and calculate score
    function saveAnswers() {
        const answers = {};
        questions.forEach((question, index) => {
            const answer = document.querySelector(`input[name="question${index}"]:checked`);
            if (answer) {
                answers[`question${index}`] = answer.value;
            }
        });
        const score = calculateScore(answers);
        saveScore(currentUser, score);
        alert(`Answers submitted successfully! Your score is ${score}`);
        window.location.href = 'leaderboard.html';
    }

    // Calculate score based on correct answers. This passes the entire array to confirm if it is correct or not
    function calculateScore(answers) {
        let score = 0;
        questions.forEach((question, index) => {
            if (answers[`question${index}`] === question.correct_answer) {
                score++;
            }
        });
        return score;
    }

    // Save score to localStorage
    function saveScore(username, score) {
        let scores = JSON.parse(localStorage.getItem('scores')) || []; //geting our array
        scores.push({ username, score });  // adding to our array {username , score}
        localStorage.setItem('scores', JSON.stringify(scores)); // persisting/ storing to our localstorage
    }

    // Load leaderboard
    function loadLeaderboard() {
        let scores = JSON.parse(localStorage.getItem('scores')) || []; //retrieving scores 
        scores.sort((a, b) => b.score - a.score); // sorts scores by > 
        leaderboardContainer.innerHTML = scores.map(score => `
            <p>${score.username}: ${score.score}</p>
        `).join('');
    }

    // Fetch questions if on quiz page
    // flow control. You have to be logged in shows alert
    if (window.location.pathname.endsWith('quiz.html')) {
        currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            alert('You must be logged in to access the quiz.');
            window.location.href = 'index.html';
        } else {
            fetchQuestions();
            submitAnswersButton.addEventListener('click', saveAnswers);
        }
    }

    // Load leaderboard if on leaderboard page
    if (window.location.pathname.endsWith('leaderboard.html')) {
        loadLeaderboard();
    }
});