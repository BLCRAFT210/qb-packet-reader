// Constants and functions useful for quizbowl.

const SET_LIST = [];

const CATEGORIES = ['Literature', 'History', 'Science', 'Fine Arts', 'Religion', 'Mythology', 'Philosophy', 'Social Science', 'Current Events', 'Geography', 'Other Academic', 'Trash'];
const SUBCATEGORIES = {
    'Literature': ['American Literature', 'British Literature', 'Classical Literature', 'European Literature', 'World Literature', 'Other Literature'],
    'History': ['American History', 'Ancient History', 'European History', 'World History', 'Other History'],
    'Science': ['Biology', 'Chemistry', 'Physics', 'Math', 'Other Science'],
    'Fine Arts': ['Visual Fine Arts', 'Auditory Fine Arts', 'Other Fine Arts'],
    'Religion': ['Religion'],
    'Mythology': ['Mythology'],
    'Philosophy': ['Philosophy'],
    'Social Science': ['Social Science'],
    'Current Events': ['Current Events'],
    'Geography': ['Geography'],
    'Other Academic': ['Other Academic'],
    'Trash': ['Trash'],
};
const SUBCATEGORIES_FLATTENED = ['American Literature', 'British Literature', 'Classical Literature', 'European Literature', 'World Literature', 'Other Literature', 'American History', 'Ancient History', 'European History', 'World History', 'Other History', 'Biology', 'Chemistry', 'Physics', 'Math', 'Other Science', 'Visual Fine Arts', 'Auditory Fine Arts', 'Other Fine Arts', 'Religion', 'Mythology', 'Philosophy', 'Social Science', 'Current Events', 'Geography', 'Other Academic', 'Trash'];


function arrayToRange(array) {
    if (array.length === 0) return '';

    array = [...new Set(array)];
    array = array.sort((a, b) => a - b);

    let string = '';
    let lastRangeStart = array[0];
    let lastRangeEnd = array[0];

    for (let i = 1; i < array.length; i++) {
        if (array[i] - lastRangeEnd === 1) {
            lastRangeEnd = array[i];
        } else {
            if (lastRangeStart === lastRangeEnd) {
                string = `${string}, ${lastRangeStart}`;
            } else {
                string = `${string}, ${lastRangeStart}-${lastRangeEnd}`;
            }
            lastRangeStart = array[i];
            lastRangeEnd = array[i];
        }
    }

    if (lastRangeStart === lastRangeEnd) {
        string = `${string}, ${lastRangeStart}`;
    } else {
        string = `${string}, ${lastRangeStart}-${lastRangeEnd}`;
    }

    return string.slice(2);
}


const createTossupCard = (function () {
    let questionCounter = 0;

    return function (tossup, setName) {
        if (!tossup || Object.keys(tossup).length === 0) return;

        questionCounter++;
        const { question, answer, category, subcategory, packetNumber, questionNumber, _id } = tossup;

        // append a card containing the question to the history element
        const card = document.createElement('div');
        card.className = 'card my-2';
        card.innerHTML = `
            <div class="card-header" data-bs-toggle="collapse" data-bs-target="#question-${questionCounter}" aria-expanded="true">
                ${answer}
            </div>
            <div class="card-container collapse" id="question-${questionCounter}">
                <div class="card-body">
                    <p class="card-text">
                        ${question}
                        <a href="#" id="report-question-${_id}" data-bs-toggle="modal" data-bs-target="#report-question-modal">Report Question</a>
                    </p>
                </div>
                <div class="card-footer">
                    <small class="text-muted">${setName} / ${category} / ${subcategory}</small>
                    <small class="text-muted float-end">Packet ${packetNumber} / Question ${questionNumber}</small>
                </div>
            </div>
        `;

        document.getElementById('room-history').prepend(card);

        document.getElementById('report-question-' + _id).addEventListener('click', function (e) {
            document.getElementById('report-question-id').value = _id;
        });
    };
})();


/**
 * @param {String} setName
 * @returns {Number} The number of packets in the set.
 */
async function getNumPackets(setName) {
    if (setName === undefined) return 0;
    if (setName === '') return 0;

    return fetch(`/api/num-packets?setName=${encodeURIComponent(setName)}`)
        .then(response => response.json())
        .then(data => {
            return parseInt(data);
        });
}


/**
 * @param {JSON} question
 * @param {Array<String>} validCategories
 * @param {Array<String>} validSubcategories
 * @returns {boolean} Whether or not the question is part of the valid category and subcategory combination.
 */
function isValidCategory(question, validCategories, validSubcategories) {
    if (validCategories.length === 0 && validSubcategories.length === 0) return true;

    return validCategories.includes(question.category) && validSubcategories.includes(question.subcategory);
}


/**
 * Updates the category modal to show the given categories and subcategories.
 * @param {Array<String>} validCategories
 * @param {Array<String>} validSubcategories
 * @returns {void}
 */
function loadCategoryModal(validCategories, validSubcategories) {
    document.querySelectorAll('#categories input').forEach(element => element.checked = false);
    document.querySelectorAll('#subcategories input').forEach(element => element.checked = false);
    document.querySelectorAll('#subcategories label').forEach(element => element.classList.add('d-none'));

    if (validSubcategories.length === 0) {
        const subcategoryInfoText = document.createElement('div');
        subcategoryInfoText.className = 'text-muted text-center';
        subcategoryInfoText.innerHTML = 'You must select categories before you can select subcategories.';
        subcategoryInfoText.id = 'subcategory-info-text';
        document.getElementById('subcategories').appendChild(subcategoryInfoText);
    } else if (document.getElementById('subcategory-info-text')) {
        document.getElementById('subcategory-info-text').remove();
    }

    validCategories.forEach(category => {
        document.getElementById(category).checked = true;
        SUBCATEGORIES[category].forEach(subcategory => {
            document.querySelector(`[for="${subcategory}"]`).classList.remove('d-none');
        });
    });

    validSubcategories.forEach(subcategory => {
        document.getElementById(subcategory).checked = true;
    });
}


function rangeToArray(string, max = 0) {
    if (string.length === 0) {
        string = `1-${max}`;
    }

    if (string.endsWith('-')) {
        string = string + max;
    }

    const tokens = string.split(',');
    const ranges = [];
    for (let i = 0; i < tokens.length; i++) {
        const range = tokens[i].trim().split('-');
        if (range.length === 1) {
            ranges.push([parseInt(range[0]), parseInt(range[0])]);
        } else {
            ranges.push([parseInt(range[0]), parseInt(range[1])]);
        }
    }

    const array = [];
    for (let i = 0; i < ranges.length; i++) {
        for (let j = ranges[i][0]; j <= ranges[i][1]; j++) {
            array.push(j);
        }
    }

    return array;
}


function reportQuestion(_id, reason = '', description = '') {
    fetch('/api/report-question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _id: _id,
            reason: reason,
            description: description
        })
    }).then(response => {
        if (response.status === 200) {
            alert('Question has been reported.');
        } else {
            alert('There was an error reporting the question.');
        }
    }).catch(error => {
        alert('There was an error reporting the question.');
    });
}


/**
 * Adds the given category if it is not in the list of valid categories.
 * Otherwise, the category is removed.
 * @param {String} category
 * @param {Array<String>} validCategories
 * @param {Array<String>} validSubcategories
 * @returns `[validCategories, validSubcategories]`
 */
function updateCategory(category, validCategories, validSubcategories) {
    if (validCategories.includes(category)) {
        validCategories = validCategories.filter(a => a !== category);
        validSubcategories = validSubcategories.filter(a => !SUBCATEGORIES[category].includes(a));
    } else {
        validCategories.push(category);
        validSubcategories = validSubcategories.concat(SUBCATEGORIES[category]);
    }

    return [validCategories, validSubcategories];
}


/**
 * Adds the given subcategory if it is not in the list of valid subcategories.
 * Otherwise, the subcategory is removed.
 * @param {String} subcategory
 * @param {Array<String>} validSubcategories
 * @returns `validSubcategories`
 */
function updateSubcategory(subcategory, validSubcategories) {
    if (validSubcategories.includes(subcategory)) {
        validSubcategories = validSubcategories.filter(a => a !== subcategory);
    } else {
        validSubcategories.push(subcategory);
    }

    return validSubcategories;
}