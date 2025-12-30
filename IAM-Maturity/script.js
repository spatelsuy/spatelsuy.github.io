// script.js - Complete and Working Version

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, fetching questions...');
    
    // Load questions from JSON file
    fetch('questions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Questions loaded successfully:', data);
            generateQuestionsHTML(data.domains);
            updateCalculateFunction(data.domains);
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            document.getElementById('output').innerHTML = 
                '<p style="color: red;">Error loading questions. Please check if questions.json exists and is valid JSON.</p>';
        });
});

function generateQuestionsHTML(domains) {
    console.log('Generating HTML for domains:', domains);
    
    // Get the container where questions should go
    const questionsContainer = document.getElementById('questions-container');
    
    if (!questionsContainer) {
        console.error('Cannot find questions-container element!');
        return;
    }
    
    // Clear any existing content
    questionsContainer.innerHTML = '';
    
    // Create the main header for this section
    const header = document.createElement('h2');
    header.textContent = 'Interactive IAM Maturity Scoring';
    questionsContainer.appendChild(header);
    
    // Create a container for all domains
    const allDomainsContainer = document.createElement('div');
    allDomainsContainer.className = 'all-domains-container';
    
    // Generate HTML for each domain
    domains.forEach(domain => {
        const domainSection = createDomainSection(domain);
        allDomainsContainer.appendChild(domainSection);
    });
    
    questionsContainer.appendChild(allDomainsContainer);
    console.log('Questions HTML generated successfully');
}

function createDomainSection(domain) {
    const section = document.createElement('div');
    section.className = 'domain-section';
    section.id = `domain-${domain.id}`;
    
    // Domain header
    const header = document.createElement('h3');
    header.innerHTML = `${domain.id}. ${domain.name}`;
    
    // Domain description
    const description = document.createElement('p');
    description.textContent = domain.description;
    
    // Create table
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th style="width:35%">Question</th>
                <th>Maturity Description (Select One)</th>
            </tr>
        </thead>
        <tbody id="${domain.id}-questions">
            <!-- Questions will be inserted here -->
        </tbody>
    `;
    
    section.appendChild(header);
    section.appendChild(description);
    section.appendChild(table);
    
    // Generate questions for this domain
    const tbody = table.querySelector(`#${domain.id}-questions`);
    if (tbody) {
        domain.questions.forEach(question => {
            const questionRow = createQuestionRow(question, domain.id);
            tbody.appendChild(questionRow);
        });
    }
    
    return section;
}

function createQuestionRow(question, domainId) {
    const row = document.createElement('tr');
    
    // Create the first 3 options (Levels 1-3)
    const optionsRow1 = question.options.slice(0, 3).map(option => `
        <label class="tile-radio">
            <input type="radio" name="${question.id}" value="${option.value}" 
                   data-question-id="${question.id}" data-domain="${domainId.toLowerCase()}">
            <span>${option.text}</span>
        </label>
    `).join('');
    
    // Create the last 2 options (Levels 4-5)
    const optionsRow2 = question.options.slice(3).map(option => `
        <label class="tile-radio">
            <input type="radio" name="${question.id}" value="${option.value}"
                   data-question-id="${question.id}" data-domain="${domainId.toLowerCase()}">
            <span>${option.text}</span>
        </label>
    `).join('');
    
    row.innerHTML = `
        <td colspan="2" class="question-block" data-question-id="${question.id}" data-weight="${question.weight}">
            <!-- Line 1: Question -->
            <div class="question-text">
                <strong>${question.text}</strong>
            </div>

            <!-- Line 2: Radio Tiles (Levels 1–3) -->
            <div class="tile-row">
                ${optionsRow1}
            </div>

            <!-- Line 3: Radio Tiles (Levels 4–5) -->
            <div class="tile-row">
                ${optionsRow2}
            </div>

            <!-- Line 4: Additional Context -->
            <label><strong>Additional Clarification (Optional)</strong></label>
            <div class="input-row inline-row">
                <textarea rows="3" class="additional-context"
                          data-question-id="${question.id}"
                          placeholder="Provide clarifications, scope, or known gaps..."></textarea>
            </div>

            <!-- Line 5: Control ID + Control Details -->
            <div class="input-row inline-row">
                <input type="text" class="control-id"
                       data-question-id="${question.id}"
                       placeholder="Control ID (e.g., CTRL-001)">
                <textarea rows="1" class="control-description"
                          data-question-id="${question.id}"
                          placeholder="Control description"></textarea>
            </div>

            <!-- Line 6: Metrics ID + Metrics Details -->
            <div class="input-row inline-row">
                <input type="text" class="metrics-id"
                       data-question-id="${question.id}"
                       placeholder="Metrics ID (e.g., MET-01)">
                <textarea rows="1" class="metrics-description"
                          data-question-id="${question.id}"
                          placeholder="Metrics details"></textarea>
            </div>
        </td>
    `;
    
    return row;
}

function updateCalculateFunction(domains) {
    // Override the calculate function to work with radio buttons
    window.calculate = function() {
        console.log('Calculating scores...');
        
        const scores = {};
        const weights = {};
        
        // Initialize domain scores
        domains.forEach(domain => {
            scores[domain.id.toLowerCase()] = { 
                sum: 0, 
                count: 0, 
                weightSum: 0,
                name: domain.name 
            };
        });
        
        // Collect all radio buttons
        const radioButtons = document.querySelectorAll('input[type="radio"]:checked');
        console.log('Selected radio buttons:', radioButtons.length);
        
        radioButtons.forEach(radio => {
            const questionId = radio.getAttribute('data-question-id');
            const domainId = radio.getAttribute('data-domain');
            const value = parseInt(radio.value);
            
            // Find the question weight
            const questionBlock = document.querySelector(`[data-question-id="${questionId}"]`);
            const weight = questionBlock ? parseInt(questionBlock.getAttribute('data-weight')) || 1 : 1;
            
            if (domainId && scores[domainId]) {
                scores[domainId].sum += value * weight;
                scores[domainId].weightSum += weight;
                scores[domainId].count++;
            }
        });
        
        // Calculate domain scores
        let domainOutput = '';
        let overallSum = 0;
        let overallWeightSum = 0;
        let domainCount = 0;
        
        domains.forEach(domain => {
            const domainId = domain.id.toLowerCase();
            const domainScore = scores[domainId];
            if (domainScore.count > 0) {
                const weightedAvg = domainScore.sum / domainScore.weightSum;
                domainOutput += `
                    <p><strong>${domainScore.name}:</strong> ${weightedAvg.toFixed(2)} (${level(weightedAvg)})</p>
                `;
                overallSum += domainScore.sum;
                overallWeightSum += domainScore.weightSum;
                domainCount++;
            }
        });
        
        // Calculate overall score
        let overall = 0;
        if (overallWeightSum > 0) {
            overall = overallSum / overallWeightSum;
        }
        
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = `
            <div style="background-color: #f7f9fc; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3>IAM Maturity Assessment Results</h3>
                <p><strong>Overall IAM Maturity Score:</strong> ${overall.toFixed(2)}</p>
                <p><strong>Maturity Level:</strong> ${level(overall)}</p>
                <hr>
                <h4>Domain Scores:</h4>
                ${domainOutput || '<p>No scores selected yet. Please answer some questions.</p>'}
                ${domainCount > 0 ? `<p><em>Based on ${domainCount} domain(s) with answers</em></p>` : ''}
            </div>
        `;
        
        console.log('Calculation complete. Overall score:', overall);
    };
}

// Keep the existing level function
function level(score) {
    if (score < 2) return "Level 1 – Initial";
    if (score < 3) return "Level 2 – Repeatable";
    if (score < 4) return "Level 3 – Defined";
    if (score < 4.6) return "Level 4 – Managed";
    return "Level 5 – Optimized";
}
