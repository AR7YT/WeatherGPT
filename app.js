// DOM Elements
const views = {
    upload: document.getElementById('upload-view'),
    loading: document.getElementById('loading-view'),
    quiz: document.getElementById('quiz-view'),
    results: document.getElementById('results-view')
};

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const loadingText = document.getElementById('loading-text');

// Quiz State
let currentQuestions = [];
let currentIndex = 0;
let score = 0;

// ==========================================
// File Upload & Drag-and-Drop Handling
// ==========================================

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
});

dropZone.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFileSelect, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    if (e.target.files.length) {
        processFile(e.target.files[0]);
    }
}

async function processFile(file) {
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
        alert('Please upload a PDF or text file.');
        return;
    }

    showView('loading');
    
    try {
        let extractedText = '';
        
        if (file.type === 'application/pdf') {
            loadingText.innerText = 'Extracting text from PDF...';
            extractedText = await extractTextFromPDF(file);
        } else {
            extractedText = await file.text();
        }

        loadingText.innerText = 'AI is writing your quiz...';
        
        // Pass text to our pseudo AI service
        currentQuestions = await generateMCQsFromText(extractedText);
        
        // Start quiz
        currentIndex = 0;
        score = 0;
        showView('quiz');
        renderQuestion();
        
    } catch (error) {
        console.error(error);
        alert('An error occurred during processing: ' + error.message);
        showView('upload');
    }
}

// ==========================================
// PDF Parsing
// ==========================================

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
    let fullText = '';
    
    // Extract text from the first 5 pages to keep processing light
    const maxPages = Math.min(pdf.numPages, 5);
    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    
    return fullText;
}

// ==========================================
// Mock AI Service Integration
// ==========================================

// In a real application, this would send `text` to an API endpoint
// that uses OpenAI, Claude, or Gemini to return a structured JSON response.
async function generateMCQsFromText(text) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // We mock the AI response here. 
            // The prompt we would usually use: "Based on the provided text, generate 40 multiple choice questions in JSON format..."
            const mockAIResponse = [];
            
            // Generating 40 dummy questions to demonstrate the scale
            for (let i = 1; i <= 40; i++) {
                // Randomize the correct answer index for the dummy data
                const correctIndex = Math.floor(Math.random() * 4);
                mockAIResponse.push({
                    question: `Dummy Question ${i}: Based on your uploaded document, what is the primary purpose of the core components?`,
                    options: [
                        "To establish network protocols",
                        "To manage internal state and render UI",
                        "To style the database schema",
                        "To increase latency"
                    ],
                    correctIndex: correctIndex
                });
            }
            
            resolve(mockAIResponse);
        }, 2500); // simulate 2.5s network AI delay
    });
}


// ==========================================
// Quiz UI Logic
// ==========================================

function renderQuestion() {
    if (currentIndex >= currentQuestions.length) {
        finishQuiz();
        return;
    }

    const q = currentQuestions[currentIndex];
    
    document.getElementById('current-q-num').innerText = currentIndex + 1;
    document.getElementById('total-q-num').innerText = currentQuestions.length;
    document.getElementById('score-val').innerText = score;
    
    document.getElementById('question-text').innerText = q.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // Next btn state
    const nextBtn = document.getElementById('next-btn');
    nextBtn.disabled = true;
    nextBtn.onclick = () => {
        currentIndex++;
        renderQuestion();
    };

    q.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        
        // Add a nice visual prefix letter
        const letter = String.fromCharCode(65 + index);
        btn.innerHTML = `<span style="margin-right:15px; font-weight:bold; color:var(--primary-color)">${letter}.</span> ${optText}`;
        
        btn.onclick = () => handleOptionSelect(btn, index, q.correctIndex);
        optionsContainer.appendChild(btn);
    });
}

function handleOptionSelect(selectedBtn, selectedIndex, correctIndex) {
    const optionsContainer = document.getElementById('options-container');
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIndex) {
            btn.classList.add('correct');
        } else if (idx === selectedIndex && selectedIndex !== correctIndex) {
            btn.classList.add('wrong');
        }
    });

    if (selectedIndex === correctIndex) {
        score++;
        document.getElementById('score-val').innerText = score;
    }

    document.getElementById('next-btn').disabled = false;
}

function finishQuiz() {
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-total').innerText = currentQuestions.length;
    showView('results');
}

// ==========================================
// Navigation Helper
// ==========================================

function showView(viewName) {
    Object.values(views).forEach(v => {
        v.classList.add('hidden');
        v.style.display = 'none';
    });
    
    const activeView = views[viewName];
    if (activeView) {
        activeView.classList.remove('hidden');
        if (viewName === 'upload' || viewName === 'loading' || viewName === 'quiz' || viewName === 'results') {
            activeView.style.display = 'block';
        }
    }
}
