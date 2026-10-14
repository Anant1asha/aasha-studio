const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Import compiled dist/index.js
const { QuestionSchemaValidator, MathInsulator } = require('../dist/index.js');

test('QuestionSchemaValidator: accepts valid 4-tier hinted questions without spoilers', () => {
  const validQuestion = {
    id: "Q1",
    q: "What is the result when adding 15 and 27?",
    opts: [
      { t: "42", c: true },
      { t: "32", c: false, m: "The student added ones without regrouping 10 ones as a ten." },
      { t: "41", c: false, m: "The student made a counting discrepancy in the ones column." },
      { t: "52", c: false, m: "The student carried an extra ten by mistake." }
    ],
    hints: {
      h1: "Look closely at the ones place digits.",
      h2: "Remember when the sum of digits exceeds 9, regroup 10 ones as 1 ten.",
      h3: "Combine 5 and 7 first to determine what is carried over.",
      h4: "Add the tens column after including the regrouped ten."
    }
  };

  const errors = QuestionSchemaValidator.validateQuestion(validQuestion);
  assert.equal(errors.length, 0, `Expected 0 validation errors, got: ${errors.map(e => e.message).join('; ')}`);
});

test('QuestionSchemaValidator: rejects spoilers in misconception explanation', () => {
  const spoilerQuestion = {
    id: "Q2",
    q: "What is 10 minus 4?",
    opts: [
      { t: "6", c: true },
      { t: "5", c: false, m: "This is wrong because subtracting 4 yields 6." }, // 'yields 6' leaks answer
      { t: "4", c: false, m: "The student confused subtraction with halving." },
      { t: "7", c: false, m: "The student subtracted 3 instead of 4." }
    ],
    hints: {
      h1: "Count backwards from 10.",
      h2: "Think about number bonds of ten.",
      h3: "Take away 4 units from ten units.",
      h4: "Review the single digit subtraction step."
    }
  };

  const errors = QuestionSchemaValidator.validateQuestion(spoilerQuestion);
  assert.ok(errors.length > 0, 'Expected question with spoiler to fail validation');
  assert.ok(errors.some(e => e.ruleId.includes('SPOILER') || e.message.toLowerCase().includes('reveal') || e.message.toLowerCase().includes('spoiler')));
});

test('MathInsulator: protects LaTeX expressions and variables from distortion', () => {
  const input = "Calculate the value of \\( \\frac{a}{b} \\) when $a = 10$ and $b = 2$.";
  const { maskedText, tokenMap } = MathInsulator.tokenize(input);

  assert.ok(maskedText.includes('__AASHA_MATH_'), 'Expected math placeholders in masked text');
  assert.ok(tokenMap.size >= 2, 'Expected at least 2 protected math tokens');

  const restored = MathInsulator.restore(maskedText, tokenMap);
  assert.equal(restored, input, 'Restored text must match original input exactly');
});
