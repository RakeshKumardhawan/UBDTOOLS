import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStateSiteListXml,
  filterSitesForState,
  getStateDefaultCompatMode,
  getStateUbdSiteList,
  resolveUbdState,
} from '../src/utils/siteListGenerator.ts';

test('Telangana state sites.xml contains ONLY Telangana UBD URLs and zero AP or non-UBD sites', () => {
  assert.equal(resolveUbdState('Telangana'), 'Telangana');
  assert.equal(getStateDefaultCompatMode('Telangana'), 'IE5');

  const tsSites = getStateUbdSiteList('Telangana');
  assert.deepEqual(tsSites, [
    'https://ubd.telangana.gov.in/',
    'https://ubd.telangana.gov.in/login.do',
    'ubd.telangana.gov.in',
  ]);

  const xml = buildStateSiteListXml('Telangana');
  assert.match(xml, /https:\/\/ubd\.telangana\.gov\.in\//);
  assert.match(xml, /<compat-mode>IE5<\/compat-mode>/);
  assert.doesNotMatch(xml, /ap\.gov\.in/i);
  assert.doesNotMatch(xml, /pfms/i);
  assert.doesNotMatch(xml, /egramswaraj/i);
  assert.doesNotMatch(xml, /ifmis|treasury/i);
  assert.doesNotMatch(xml, /e-vedhika\.in/i);
});

test('Andhra Pradesh state sites.xml contains ONLY Andhra Pradesh UBD URLs and zero Telangana or non-UBD sites', () => {
  assert.equal(resolveUbdState('Andhra Pradesh'), 'Andhra Pradesh');
  assert.equal(resolveUbdState('ubd-portal-ap'), 'Andhra Pradesh');
  assert.equal(getStateDefaultCompatMode('Andhra Pradesh'), 'IE7');

  const apSites = getStateUbdSiteList('Andhra Pradesh');
  assert.deepEqual(apSites, [
    'http://www.ubd.ap.gov.in:8080/UBDNEW/',
    'www.ubd.ap.gov.in:8080/UBDNEW',
    'www.ubd.ap.gov.in:8080',
    'www.ubd.ap.gov.in',
    'ubd.ap.gov.in',
  ]);

  const xml = buildStateSiteListXml('Andhra Pradesh');
  assert.match(xml, /http:\/\/www\.ubd\.ap\.gov\.in:8080\/UBDNEW\//);
  assert.match(xml, /<compat-mode>IE7<\/compat-mode>/);
  assert.doesNotMatch(xml, /telangana\.gov\.in/i);
  assert.doesNotMatch(xml, /pfms/i);
  assert.doesNotMatch(xml, /egramswaraj/i);
  assert.doesNotMatch(xml, /ifmis|treasury/i);
  assert.doesNotMatch(xml, /e-vedhika\.in/i);
});

test('filterSitesForState strips cross-state domains, e-vedhika.in, PFMS, eGramSwaraj, and Treasury/IFMIS', () => {
  const mixed = [
    'https://ubd.telangana.gov.in/',
    'http://www.ubd.ap.gov.in:8080/UBDNEW/',
    'https://www.e-vedhika.in',
    'https://pfms.nic.in',
    'https://egramswaraj.gov.in',
    'https://ifmis.telangana.gov.in',
    'https://treasury.telangana.gov.in',
  ];

  assert.deepEqual(filterSitesForState('Telangana', mixed), ['https://ubd.telangana.gov.in/']);
  assert.deepEqual(filterSitesForState('Andhra Pradesh', mixed), ['http://www.ubd.ap.gov.in:8080/UBDNEW/']);
});
