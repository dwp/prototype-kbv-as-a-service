// 
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/routes
// 

const govukPrototypeKit = require('govuk-prototype-kit');
const { compact } = require('lodash');
const getKbvJourney = require('./data/get-kbv-journey');
const router = govukPrototypeKit.requests.setupRouter();
const gdsMapping = require('./data/map-gds-code-to-question');

// Add your routes here

const showQuestion = (req, res, current) => {
  if (current === 1 && !req.session.data.journey) {
    req.session.data.journey = getKbvJourney({ hasChild: false, hasPartner: false, awards: 'PIP' });
  }
  req.session.data.loading = current === 1;
  req.session.data.current = current;

  if (req.session.data.journey && current <= req.session.data.journey.length) {
    res.redirect(`/${req.session.data.journey[current - 1]}`);
  } else {
    // hand back to GDS prototype
    req.session.data.journey = [];
    req.session.data.current = 0;
    res.status(301).redirect(req.session.data.redirect);
  }
};

router.get('/question/:id', (req, res) => {
  const current = parseInt(req.params.id);
  showQuestion(req, res, current);
});

router.get('/journey', (req, res) => {
  req.session.data.journey = getKbvJourney({
    hasChild: req.session.data['has-child'] === 'true',
    hasPartner: req.session.data['has-partner'] === 'true',
    awards: req.session.data.awards });
  // showQuestion(req, res, 1);
  res.redirect('/please-wait');
});

router.get('/gds-journey', (req, res) => {
  req.session.data = {
    version: req.session.data.version,
    dwp_sequence: req.session.data.dwp_sequence,
  }; // clear out old data
  req.session.data.journey = compact(req.session.data['dwp_sequence']
    .split(',')
    .map((code) => gdsMapping[code]));

  req.session.data.redirect = `https://gds-identity${req.session.data['version'] === 'build' ? '' : '-ur-test'}.herokuapp.com/pyi/v19/dwp-kbv-fail`;

  res.redirect('/please-wait');
});

module.exports = router
