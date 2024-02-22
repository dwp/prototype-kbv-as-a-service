/**
 * @typedef {{ hasChild: boolean, hasPartner: boolean, awards: 'both' | 'PIP' | 'ESA' }} options
 * @param {options} param0
 * @returns {string[]}
 */
const getKbvJourney = ({ hasChild, hasPartner, awards }) => {
  if (hasChild && hasPartner && awards === 'both') {
    return [
      'esa-questions/last-payment-amount',
      'pip-questions/claim-start-date',
      'cis-questions/partner-nino.html'
    ];
  } else if (hasChild && hasPartner && awards === 'PIP') {
    return [
      'pip-questions/claim-start-date',
      'cis-questions/child-dob.html',
      'pip-questions/sort-code'
    ];
  } else if (hasChild && hasPartner && awards === 'ESA') {
    return [
      'cis-questions/child-name.html',
      'esa-questions/claim-start-date',
      'cis-questions/partner-nino.html'
    ];
  } else if (!hasChild && hasPartner && awards === 'both') {
    return [
      'pip-questions/payment-day',
      'pip-questions/pip-components',
      'esa-questions/last-payment-amount'
    ];
  } else if (!hasChild && hasPartner && awards === 'PIP') {
    return [
      'pip-questions/account-number',
      'pip-questions/sort-code',
      'cis-questions/partner-nino.html'
    ];
  } else if (!hasChild && hasPartner && awards === 'ESA') {
    return [
      'cis-questions/partner-dob.html',
      'esa-questions/payment-day',
      'esa-questions/account-number'
    ];
  } else if (hasChild && !hasPartner && awards === 'both') {
    return [
      'pip-questions/payment-day',
      'pip-questions/pip-components',
      'esa-questions/last-payment-amount'
    ];
  } else if (hasChild && !hasPartner && awards === 'PIP') {
    return [
      'cis-questions/phone-number-mobile.html',
      'pip-questions/sort-code',
      'pip-questions/claim-start-date'
    ];
  } else if (hasChild && !hasPartner && awards === 'ESA') {
    return [
      'esa-questions/payment-day',
      'cis-questions/child-dob.html',
      'esa-questions/last-payment-amount'
    ];
  } else if (!hasChild && !hasPartner && awards === 'both') {
    return [
      'esa-questions/account-number',
      'pip-questions/pip-components',
      'cis-questions/phone-number-mobile.html'
    ];
  } else if (!hasChild && !hasPartner && awards === 'PIP') {
    return [
      'cis-questions/phone-number-mobile.html',
      'pip-questions/last-payment-date',
      'pip-questions/payment-amount'
    ];
  } else if (!hasChild && !hasPartner && awards === 'ESA') {
    return [
      'cis-questions/phone-number-mobile.html',
      'esa-questions/last-payment-date',
      'esa-questions/payment-amount'
    ];
  }
  throw new Error(`not satisfiable when awards === ${awards}`);
};

module.exports = getKbvJourney;
