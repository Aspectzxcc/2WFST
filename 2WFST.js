// two way fst class
class TwoWayFST {
  constructor() {
    this.inputTape = [];
    this.outputTape = [];
    this.headPos = 0;
    this.currentState = 'q0';
    this.stepCount = 0;
    this.states = {
      q0: {
        transitions: {
          '⊢': { nextState: 'q1', write: null, move: 1 },
        },
      },
      q1: {
        transitions: {
          'A': { nextState: 'q1', write: 'A', move: 1 },
          'B': { nextState: 'q1', write: 'B', move: 1 },
          '⊣': { nextState: 'q2', write: null, move: -1 },
        },
      },
      q2: {
        transitions: {
          'A': { nextState: 'q2', write: null, move: -1 },
          'B': { nextState: 'q2', write: null, move: -1 },
          '⊢': { nextState: 'q3', write: null, move: 1 },
        },
      },
      q3: {
        transitions: {
          'A': { nextState: 'q3', write: 'A', move: 1 },
          'B': { nextState: 'q3', write: 'B', move: 1 },
          '⊣': { nextState: 'q4', write: null, move: 0 },
        },
      },
      q4: {},
    };
  }

  initFST(input) {
    this.inputTape = input ? ['⊢', ...input.split(''), '⊣'] : ['⊢', '⊣'];
    this.outputTape = [];
    this.headPos = 0;
    this.currentState = 'q0';
    this.stepCount = 0;
  }

  // simulate a step of the FST
  step() {
    const currentState = this.currentState;
    const currentSymbol = this.inputTape[this.headPos];
    const transition = this.states[this.currentState].transitions[currentSymbol];
    this.stepCount++;

    if (this.currentState === 'q4') {
      this.headPos = 0;
      this.currentState = 'q0';
      return 'End of the automata.';
    }

    if (!transition) {
        return 'No transition defined for current state and input symbol.';
    }

    // Move head and transition to the next state
    this.headPos += transition.move;
    const nextState = transition.nextState;
    const write = transition.write === null ? 'ε' : transition.write;
    const move = transition.move;
    this.currentState = nextState;

    // Update output tape if the transition writes a symbol
    this.outputTape.push(write === 'ε' ? null : write);

    const transitionLog = `${this.stepCount}. (${currentState}) ► (${currentSymbol}, ${move}, ${write}) ► (${nextState})`;

    return transitionLog;
  }
}

// node network setup
const nodes = new vis.DataSet([
  { id: 'q0', label: 'q0', x: -100, y: 50, color: { background: 'yellow', border: 'black' } },
  { id: 'q1', label: 'q1', x: 200, y: 50 },
  { id: 'q2', label: 'q2', x: -100, y: 250 },
  { id: 'q3', label: 'q3', x: 200, y: 250 },
  { id: 'q4_outer', label: '', x: 200, y: 450, shape: 'dot', size: 40, color: { background: 'green', border: 'black' } },
  { id: 'q4', label: 'q4', x: 200, y: 450, color: { background: 'lightgreen', border: 'black' } },
]);

// smooth for curve edges
const edges = new vis.DataSet([
  { from: 'q0', to: 'q1', label: '⊢, 1, ε', smooth: { type: 'curvedCW', roundness: 0.4 } }, 
  { from: 'q1', to: 'q1', label: 'A|B, 1, A|B', selfReferenceSize: 40 }, 
  { from: 'q1', to: 'q2', label: '⊣, -1, ε', smooth: { type: 'curvedCCW', roundness: 0.4 } }, 
  { from: 'q2', to: 'q2', label: 'A|B, -1, ε', selfReferenceSize: 60 }, 
  { from: 'q2', to: 'q3', label: '⊢, 1, ε', smooth: { type: 'curvedCW', roundness: 0.4 } }, 
  { from: 'q3', to: 'q4', label: '⊣, 0, ε' }, 
  { from: 'q3', to: 'q3', label: 'A|B, 1, A|B', selfReferenceSize: 40 } 
]);

const container = document.getElementById('network');

const data = {
  nodes: nodes,
  edges: edges
};

const options = {
    physics: false,
    nodes: {
      font: {
        size: 30 
      },
      color: {
        background: 'white',
        border: 'black'
      }
    },
    edges: {
        arrows: 'to',
        font: {
            size: 20,
        }
    },
    interaction: {
        dragView: false, 
        zoomView: false, 
      }
};

function highlightCurrentState(currentState) {
  // Get the node corresponding to the current state ID
  const currentNode = nodes.get(currentState);

  // Deselect all nodes in the network
  const selectedNodes = network.getSelectedNodes();
  if (selectedNodes.length > 0) {
      network.unselectAll();
  }

  // Select and highlight the current state node
  if (currentNode) {
      network.selectNodes([currentState]); // Select the current state node
  }

  // Update the input display to highlight the current input being read
  const inputDisplayText = fst.inputTape
    .map((symbol, index) => {
      if (index === fst.headPos) {
        return `<span style="background-color: yellow">${symbol}</span>`;
      } else {
        return symbol;
      }
    })
    .join('');
  inputDisplay.innerHTML = 'Input: ' + inputDisplayText;
}

const network = new vis.Network(container, data, options);
const fst = new TwoWayFST();

// input box
const inputBox = document.getElementById('stateDiagramInput');

// button elements
const submitButton = document.getElementById('submitButton');
const stepButton = document.getElementById('stepButton');
const resetButton = document.getElementById('resetButton');

// input display
const inputDisplay = document.getElementById('inputDisplay');

// output displays
const outputDisplay = document.getElementById('output');
const stepOutputDisplay = document.getElementById('stepOutput');

submitButton.addEventListener('click', function() {
  const inputText = document.getElementById('stateDiagramInput').value;

  // clear the step output
  stepOutputDisplay.innerText = '';
  
  // show step and reset button
  stepButton.style.display = 'inline';
  resetButton.style.display = 'inline';

  // hide submit button and input box
  inputBox.style.display = 'none';
  submitButton.style.display = 'none';

  // display the input
  inputDisplay.innerText = 'Input: ' + ['⊢', ...inputText.split(''), '⊣'].join('');

  fst.initFST(inputText);

  highlightCurrentState(fst.currentState);
});

stepButton.addEventListener('click', function() {
  const inputText = document.getElementById('stateDiagramInput').value;
  const stepOutput = fst.step(inputText);

  // append the step output and output tape
  stepOutputDisplay.innerText += stepOutput + '\n';
  outputDisplay.innerText = 'Output: ' + fst.outputTape.join('');

  highlightCurrentState(fst.currentState);

  if (fst.currentState === 'q4') {
    stepButton.style.display = 'none';
  }

  // if no transition is defined, hide step button
  if (stepOutput.includes('No transition defined')) {
    stepButton.style.display = 'none';
  }
});

resetButton.addEventListener('click', function() {
  if (confirm("Are you sure you want to reset the simulation?")) {
    // Clear input, output, and step output displays
    inputBox.value = '';
    inputDisplay.innerText = '';
    outputDisplay.innerText = '';
    stepOutputDisplay.innerText = '';

    // Hide reset and step button
    resetButton.style.display = 'none';
    stepButton.style.display = 'none';

    // Show input box and submit button
    inputBox.style.display = 'inline';
    submitButton.style.display = 'inline';

    // Reset the simulation
    network.unselectAll();
  }
});