
/**
 * 
 * @param {String} name - The name of the set, in the format "[year]-[name]".
 * @param {Number} number - The packet number of the set.
 * 
 * @return {Array<JSON>} An array containing the tossups.
 */
 async function getQuestions(name, number) {
    return await fetch(`/getpacket?directory=${encodeURI(name)}&packetNumber=${encodeURI(number)}`)
        .then(response => response.json())
        .then(data => {
            return data['tossups'];
        });
}

function Question() {
    const [questionText, setQuestionText] = React.setState('');

    let numTossups = powers + tens + negs + dead;
    let points = 15 * powers + 10 * tens - 5 * negs;
    let celerity = numTossups != 0 ? totalCelerity / numTossups : 0;
    celerity = Math.round(1000 * celerity) / 1000;
    let includePlural = (numTossups == 1) ? '' : 's';

    return (
        <div>
            <p id="statline">
                {powers}/{tens}/{negs} with {numTossups} tossup{includePlural} seen ({points} pts) (celerity: {celerity})
            </p>
            <p class="question-info" id="question-info">
                {packetName} Packet ${packetNumber} Question ${currentQuestionNumber + 1}
            </p>
            <p id="question">{questionText}</p>
            <p id="answer"></p>
            <p id="info-text">Press space to buzz</p>
            <div class="toggle-correct"><button id="toggle-correct">I was wrong</button></div>
        </div>
        
    );
}

ReactDOM.render(<Question />, document.getElementById('question-text'));