// script.js - Enhanced Version with YAML Generation

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
            // Initialize YAML buttons after questions are generated
            initializeYAMLButtons();
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

    // Create tooltip element
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';

    // Create the tooltip text/content
    const tooltipText = document.createElement('span');
    tooltipText.className = 'tooltiptext';
    tooltipText.innerHTML = `
      <strong>How to Answer This Question:</strong><br>
      • Consider whether controls are enforced or optional<br>
      • Check if HR is the authoritative source<br>
      • Verify audit evidence and metrics availability<br>
      • Think about regulatory expectations (SOX, GLBA, FFIEC)`;

    // Append tooltip text to tooltip container
    tooltip.appendChild(tooltipText);

    // Append tooltip to header
    header.appendChild(tooltip);
    
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
            const questionRow = createQuestionRow(question, domain);
            tbody.appendChild(questionRow);
        });
    }
    
    return section;
}

function createQuestionRow(question, domain) {
    const row = document.createElement('tr');
    
    // Create the first 3 options (Levels 1-3)
    const optionsRow1 = question.options.slice(0, 3).map(option => `
        <label class="tile-radio">
            <input type="radio" name="${question.id}" value="${option.value}" 
                   data-question-id="${question.id}" data-domain="${domain.id}">
            <span>${option.description}</span>
        </label>
    `).join('');
    
    // Create the last 2 options (Levels 4-5)
    const optionsRow2 = question.options.slice(3).map(option => `
        <label class="tile-radio">
            <input type="radio" name="${question.id}" value="${option.value}"
                   data-question-id="${question.id}" data-domain="${domain.id}">
            <span>${option.description}</span>
        </label>
    `).join('');
    
    row.innerHTML = `
        <td colspan="2" class="question-block" data-question-id="${question.id}" data-weight="${question.weight}" data-domain-name="${domain.name}">
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

            <!-- Line 7: Generate YAML Button -->
            <div class="yaml-button-row">
                <button type="button" class="generate-yaml-btn" data-question-id="${question.id}">
                    Generate YAML
                </button>
                <span class="copy-status" id="copy-status-${question.id}"></span>
            </div>
        </td>
    `;
    
    return row;
}

// Initialize YAML buttons after DOM is loaded
function initializeYAMLButtons() {
    // Add event listeners to all YAML buttons
    const yamlButtons = document.querySelectorAll('.generate-yaml-btn');
    yamlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const questionId = this.getAttribute('data-question-id');
            generateYAMLForQuestion(questionId);
        });
    });
    
    // Add styles for the YAML section
    const style = document.createElement('style');
    style.textContent = `
        .yaml-button-row {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px dashed #ccc;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .generate-yaml-btn {
            background-color: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        
        .generate-yaml-btn:hover {
            background-color: #218838;
        }
        
        .copy-status {
            font-size: 12px;
            color: #666;
            margin-left: 10px;
        }
        
        .yaml-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        
        .yaml-modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 900px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .yaml-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .yaml-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        
        .close-yaml {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
        }
        
        .close-yaml:hover {
            color: #333;
        }
        
        .yaml-actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .copy-yaml-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .copy-yaml-btn:hover {
            background-color: #0056b3;
        }
        
        .yaml-content {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #dee2e6;
        }
    `;
    document.head.appendChild(style);
}

function generateYAMLForQuestion(questionId) {
    // Find the question block
    const questionBlock = document.querySelector(`[data-question-id="${questionId}"]`);
    if (!questionBlock) return;
    
    // Get question data
    const domainName = questionBlock.getAttribute('data-domain-name');
    const weight = questionBlock.getAttribute('data-weight');
    const questionText = questionBlock.querySelector('.question-text strong').textContent;
    
    // Get selected radio button value
    const selectedRadio = questionBlock.querySelector(`input[name="${questionId}"]:checked`);
    const selectedValue = selectedRadio ? selectedRadio.value : 'Not selected';
    const selectedText = selectedRadio ? selectedRadio.parentElement.querySelector('span').textContent : 'Not selected';
    
    // Get additional context
    const additionalContext = questionBlock.querySelector('.additional-context').value || 'No additional context provided';
    
    // Get control ID and description
    const controlId = questionBlock.querySelector('.control-id').value || 'Not provided';
    const controlDescription = questionBlock.querySelector('.control-description').value || 'No additional context provided';
    
    // Get metrics ID and description
    const metricsId = questionBlock.querySelector('.metrics-id').value || 'Not provided';
    const metricsDescription = questionBlock.querySelector('.metrics-description').value || 'No additional context provided';
    
    // Get organizational context from the form
    const industry = document.getElementById('industry') ? document.getElementById('industry').value : 'Banking';
    const geography = Array.from(document.querySelectorAll('input[name="geography"]:checked')).map(cb => cb.value);
    const regulatory = Array.from(document.querySelectorAll('input[name="regulatory"]:checked')).map(cb => cb.value);
    
    // Default values if not selected
    const effectiveIndustry = industry || 'Banking';
    const effectiveRegulatory = regulatory.length > 0 ? regulatory : ['SOX', 'GLBA'];
    const effectiveGeography = geography.length > 0 ? geography : ['US', 'EU'];
    
    // Generate YAML
    const yamlContent = `execution:
  input:
    domain: ${domainName}
    question_id: ${questionId}
    question_text: ${questionText}
    selected_description: ${selectedText}
    baseline_score: ${selectedValue}
    question_weight: ${weight}
    organization_context:
      industry: ${effectiveIndustry}
      regulatory_scope: [${effectiveRegulatory.join(', ')}]
      geography: [${effectiveGeography.join(', ')}]
    iam_context:
      iam_architecture: Hybrid
      identity_sources: [HR System]
      user_types: [Employees, Contractors]
      cloud_presence: true
    frameworks_referenced: [NIST CSF PR.AA, ISO/IEC 27001 Annex A.9, CRI Identity Risk]
    evidence_provided: false
    additional_context:
      user_text: ${additionalContext}
      controls_id: ${controlId}
      controls_description: ${controlDescription}
      metrics_id: ${metricsId}
      metrics_description: ${metricsDescription}`;
    
    // Display YAML in modal
    showYAMLModal(yamlContent, questionId);
}

function showYAMLModal(yamlContent, questionId) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.yaml-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'yaml-modal';
    modal.innerHTML = `
        <div class="yaml-modal-content">
            <div class="yaml-header">
                <div class="yaml-title">YAML Output - ${questionId}</div>
                <button class="close-yaml">&times;</button>
            </div>
            <div class="yaml-content">${yamlContent}</div>
            <div class="yaml-actions">
                <button class="copy-yaml-btn" data-yaml="${encodeURIComponent(yamlContent)}" data-question-id="${questionId}">
                    Copy to Clipboard
                </button>
                <button class="close-yaml-btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Add event listeners
    const closeButtons = modal.querySelectorAll('.close-yaml, .close-yaml-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });
    
    // Copy to clipboard button
    const copyButton = modal.querySelector('.copy-yaml-btn');
    copyButton.addEventListener('click', () => {
        copyToClipboard(yamlContent, questionId);
    });
    
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function copyToClipboard(text, questionId) {
    // THIS FUNCTION SHOULD ONLY COPY TEXT, NOTHING ELSE
    navigator.clipboard.writeText(text).then(() => {
        console.log('YAML copied to clipboard for question:', questionId);
        // That's it - no UI changes, no status messages
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Optional: Simple alert if copy fails
        alert('Failed to copy to clipboard. Please select the text and copy manually.');
    });
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
            
            if (domainId && scores[domainId.toLowerCase()]) {
                scores[domainId.toLowerCase()].sum += value * weight;
                scores[domainId.toLowerCase()].weightSum += weight;
                scores[domainId.toLowerCase()].count++;
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
