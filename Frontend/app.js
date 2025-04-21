    let currentRepo = '';

    function createRepo() {
        const repoNameContainer = document.createElement('div');
        const inputBox = document.createElement('input');
        inputBox.type = 'text';
        inputBox.placeholder = 'Enter the title for the new QA repository';

        const createButton = document.createElement('button');
        createButton.textContent = 'Create Repo';
        createButton.onclick = () => {
            const repoName = inputBox.value.trim();
            if (!repoName) return alert('Repository name cannot be empty');

            fetch('http://localhost:5000/create-repo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: repoName })
            })
            .then(() => {
                alert('Repository created successfully!');
                repoNameContainer.remove();
            })
            .catch(error => console.error('Error:', error));
        };

        repoNameContainer.appendChild(inputBox);
        repoNameContainer.appendChild(createButton);
        document.body.appendChild(repoNameContainer);
    }

    function loadRepo() {
        const repoName = prompt("Enter the title of the QA repository to load:");
        if (!repoName) return;

        currentRepo = repoName;

        fetch(`http://localhost:5000/load-repo?repoName=${repoName}`)
            .then(response => response.json())
            .then(data => {
                if (data.qa) {
                    document.getElementById('repoContainer').style.display = 'flex';
                    displayQuestions(data.qa.questions);
                    document.getElementById('qaFormContainer').classList.add('hidden');
                    document.getElementById('repoSetupSection').style.display = 'none';
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function displayQuestions(questions) {
        const listContainer = document.getElementById('questionList');
        listContainer.innerHTML = '<h2>Existing Questions</h2>';

        questions.forEach(q => {
            const card = document.createElement('div');
            card.classList.add('question-card');

            const questionContent = document.createElement('div');
            questionContent.innerHTML = `<strong>${q.question}</strong>`;
            card.appendChild(questionContent);

            const details = document.createElement('div');
            details.style.display = 'none';

            if (q.type === 'mcq') {
                const optionsList = document.createElement('ul');
                let correctAnswers = [];

                q.options.forEach(option => {
                    const li = document.createElement('li');
                    li.textContent = option.option;
                    if (option.isCorrect) {
                        li.style.color = 'green';
                        li.style.fontWeight = 'bold';
                        correctAnswers.push(option.option);
                    }
                    optionsList.appendChild(li);
                });

                details.appendChild(optionsList);

                const correctDiv = document.createElement('div');
                correctDiv.innerHTML = `<em>Correct Answer${correctAnswers.length > 1 ? 's' : ''}: ${correctAnswers.join(', ')}</em>`;
                correctDiv.style.marginTop = '8px';
                details.appendChild(correctDiv);
            } else {
                const correctDiv = document.createElement('div');
                correctDiv.innerHTML = `<em>Correct Answer: ${q.correctAnswer}</em>`;
                correctDiv.style.marginTop = '8px';
                details.appendChild(correctDiv);
            }

            card.appendChild(details);
            card.addEventListener('click', () => {
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });

            listContainer.appendChild(card);
        });
    }

    function showAddQAForm() {
        document.getElementById('qaFormContainer').classList.remove('hidden');
    }

    function toggleOptions() {
        const questionType = document.getElementById('questionType').value;
        document.getElementById('mcqOptions').classList.toggle('hidden', questionType !== 'mcq');
    }

    function updateMCQOptions() {
        const mcqType = document.getElementById('mcqType').value;
        const mcqFieldsContainer = document.getElementById('mcqFields');
        mcqFieldsContainer.innerHTML = '';

        const numFields = (mcqType === '1/5' || mcqType === 'n/5') ? 5 : 4;

        for (let i = 1; i <= numFields; i++) {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('mcq-option');

            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.name = `option${i}`;
            inputField.placeholder = `Option ${i}`;

            optionDiv.appendChild(inputField);
            mcqFieldsContainer.appendChild(optionDiv);
        }
    }

    function resetQAForm() {
        // Reset text input fields
        document.getElementById('question').value = '';
        document.getElementById('mcqCorrectAnswer').value = '';
    
        // Reset question type dropdown
        document.getElementById('questionType').value = 'text'; // default to text question type
    
        document.getElementById('mcqType').value = 'none'; 
        // Reset MCQ specific fields
        const mcqFieldsContainer = document.getElementById('mcqFields');
        mcqFieldsContainer.innerHTML = ''; // Remove any dynamically created MCQ options
    
        // Reset other fields if necessary
        toggleOptions(); // Hide MCQ options if not selected
    }

    function submitQA() {
        const question = document.getElementById('question').value.trim();
        const questionType = document.getElementById('questionType').value;
        const mcqType = document.getElementById('mcqType').value;
        const mcqCorrectAnswer = document.getElementById('mcqCorrectAnswer').value.trim();
    
        if (!question) return alert('Question cannot be empty');
    
        let options = [];
        let correctAnswer = '';
    
        if (questionType === 'mcq') {
            const optionElements = document.querySelectorAll('.mcq-option input[type="text"]');
            const correctAnswers = mcqCorrectAnswer.split(',').map(a => a.trim());
    
            optionElements.forEach(input => {
                const optionText = input.value.trim();
                if (optionText) {
                    options.push({
                        option: optionText,
                        isCorrect: correctAnswers.includes(optionText)
                    });
                }
            });
    
            correctAnswer = mcqCorrectAnswer;
        }
    
        fetch('http://localhost:5000/add-qna', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                repoTitle: currentRepo,
                question,
                questionType,
                options,
                correctAnswer
            })
        })
        .then(() => {
            loadRepo();
            resetQAForm(); // Reset form after successful submission
        })
        .catch(error => console.error('Error:', error));
    }


