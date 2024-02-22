const fs = require('fs');
const { shuffle, take, uniq, partition } = require('lodash');
const path = require('path');

const ifHasChild = [
  'cis-questions/child-dob.html',
  'cis-questions/child-name.html',
];

const ifHasPartner = [
  'cis-questions/partner-dob.html',
  'cis-questions/partner-nino.html',
];

const multipleChoice = [
  'pip-questions/pip-componnents.html',
  'pip-questions/payment-day.html',
  'esa-questions/payment-day.html',
];

const lowQuality = [
  'cis-questions/phone-number-mobile.html',
];

const getQuality = (question) => {
  if (lowQuality.includes(question)) {
    return 'L';
  }
  return 'M';
};

const getQuestionType = (question) => {
  if (multipleChoice.includes(question)) {
    'MC';
  }
  return 'FT';
};

const fulfillsConfig1 = (questions) => {
  const [lowQualityQs, mediumQualityQs] = partition(questions, (q) => getQuality(q) === 'L');
  if (lowQualityQs.length > 0) {
    return false;
  }

  const freeTextQs = mediumQualityQs.filter((q) => getQuestionType(q) === 'FT');

  return freeTextQs.length !== 0;
};

const fulfillsConfig2 = (questions) => {
  const [lowQualityQs, mediumQualityQs] = partition(questions, (q) => getQuality(q) === 'L');
  const mediumMultipleChoiceQs = mediumQualityQs.filter((q) => getQuestionType(q) === 'MC');
  if (mediumMultipleChoiceQs < 2) {
    return false;
  }

  return lowQualityQs.length === 1 || mediumMultipleChoiceQs.length === 3;
};


const createKbvJourney = (hasChild, hasPartner, claimingPip, claimingEsa) => {
  if (!claimingEsa && !claimingPip) {
    throw new Error('must claim ESA and/or PIP');
  }

  const allCisQuestions = fs.readdirSync(path.join('app', 'views', 'cis-questions'))
    .filter(fileName => fileName !== 'index.html' && fileName !== 'phone-number-landline.html')
    .map(fileName => `cis-questions/${fileName}`)
    .filter(fileName => hasPartner || !ifHasPartner.includes(fileName))
    .filter(fileName => hasChild || !ifHasChild.includes(fileName));

  const allPipQuestions = claimingPip ?
    fs.readdirSync(path.join('app', 'views', 'pip-questions'))
      .filter(fileName => fileName !== 'index.html')
      .map(fileName => `pip-questions/${fileName}`)
    : [];

  const allEsaQuestions = claimingEsa ?
    fs.readdirSync(path.join('app', 'views', 'esa-questions'))
      .filter(fileName => fileName !== 'index.html')
      .map(fileName => `esa-questions/${fileName}`)
    : [];

  const allQuestions = shuffle([
    ...allCisQuestions,
    ...allPipQuestions,
    ...allEsaQuestions,
  ]);

  let fromAtLeastTwoSources = false;
  let fulfillsConfig = false;
  let questionSet = [];
  const maxAttempts = 1000;

  for (let attempts = 0; attempts < maxAttempts && !fromAtLeastTwoSources && !fulfillsConfig; attempts++) {
    questionSet = take(allQuestions, 3);
    const sources = uniq(questionSet.map(fileName => fileName.split('/')[0]));
    fromAtLeastTwoSources = sources.length > 1;
    fulfillsConfig = fulfillsConfig1(questionSet) || fulfillsConfig2(questionSet);
  }

  if (!fromAtLeastTwoSources) {
    throw new Error(`no questionSet found after ${maxAttempts} attempts`);
  }

  return questionSet;
};

const partnerChoices = [true, false];
const childChoices = [true, false];
const awardChoices = [[true, true], [true, false], [false, true]];

partnerChoices.forEach(partnerChoice => {
  childChoices.forEach(childChoice => {
    awardChoices.forEach(([pipChoice, esaChoice]) => {
      try {
        const questions = createKbvJourney(childChoice, partnerChoice, pipChoice, esaChoice);
        console.log('SUCCESS:');
        console.log(questions);
        console.log('has partner?', partnerChoice);
        console.log('has child?', childChoice);
        console.log('has PIP?', pipChoice);
        console.log('has ESA?', esaChoice);
      } catch (err) {
        console.log('*********** ERROR ***********');
        console.log('couldnt satisfy the confing when');
        console.log('has partner?', partnerChoice);
        console.log('has child?', childChoice);
        console.log('has PIP?', pipChoice);
        console.log('has ESA?', esaChoice);
        console.log('*****************************');
      }
    });
  });
});
