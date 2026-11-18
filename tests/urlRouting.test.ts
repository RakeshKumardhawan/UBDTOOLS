import test from 'node:test';
import assert from 'node:assert/strict';
import { GITHUB_ADMIN_LIVE_LINK, resolveRouteFromLocation } from '../src/utils/urlRouting.ts';

test('GITHUB_ADMIN_LIVE_LINK points to GitHub Pages dedicated /admin/ portal', () => {
  assert.equal(GITHUB_ADMIN_LIVE_LINK, 'https://rakeshkumardhawan.github.io/UBDTOOLS/admin/');
});

test('resolves GitHub Pages subpath /UBDTOOLS/live-pc-reports to report-center', () => {
  const res = resolveRouteFromLocation('/UBDTOOLS/live-pc-reports', '', '');
  assert.equal(res.tab, 'report-center');
});

test('resolves GitHub Pages 404 redirect query /UBDTOOLS/?/live-pc-reports to report-center', () => {
  const res = resolveRouteFromLocation('/UBDTOOLS/', '?/live-pc-reports', '');
  assert.equal(res.tab, 'report-center');
});

test('resolves hash route #/live-pc-reports and query ?tab=live-pc-reports to report-center', () => {
  assert.equal(resolveRouteFromLocation('/UBDTOOLS/', '', '#/live-pc-reports').tab, 'report-center');
  assert.equal(resolveRouteFromLocation('/', '?tab=live-pc-reports', '').tab, 'report-center');
});

test('resolves root /live-pc-reports and unrelated tabs properly', () => {
  assert.equal(resolveRouteFromLocation('/live-pc-reports', '', '').tab, 'report-center');
  assert.equal(resolveRouteFromLocation('/UBDTOOLS/', '?tab=downloads', '').tab, 'downloads');
  assert.equal(resolveRouteFromLocation('/UBDTOOLS/', '', '').tab, null);
});

test('resolves ?pay=1 and /pay-checkout to dedicated pay-checkout tab', () => {
  assert.equal(resolveRouteFromLocation('/UBDTOOLS/live-pc-reports', '?pay=1&pcId=EVD-PC-01', '').tab, 'pay-checkout');
  assert.equal(resolveRouteFromLocation('/UBDTOOLS/', '?pay=1&pcId=EVD-PC-01&tab=version-fleet', '').tab, 'pay-checkout');
  assert.equal(resolveRouteFromLocation('/pay-checkout', '', '').tab, 'pay-checkout');
  assert.equal(resolveRouteFromLocation('/UBDTOOLS/', '?tab=payment', '').tab, 'pay-checkout');
});

test('resolves /admin and /UBDTOOLS/admin/* strictly to dedicated admin-portal (Reports & Payments only)', () => {
  assert.deepEqual(resolveRouteFromLocation('/UBDTOOLS/admin/', '', ''), { tab: 'admin-portal', adminSection: 'reports' });
  assert.deepEqual(resolveRouteFromLocation('/UBDTOOLS/admin', '', ''), { tab: 'admin-portal', adminSection: 'reports' });
  assert.deepEqual(resolveRouteFromLocation('/admin/', '', ''), { tab: 'admin-portal', adminSection: 'reports' });
  assert.deepEqual(resolveRouteFromLocation('/UBDTOOLS/', '?/admin/', ''), { tab: 'admin-portal', adminSection: 'reports' });
  assert.deepEqual(resolveRouteFromLocation('/UBDTOOLS/admin/', '?section=payments', ''), { tab: 'admin-portal', adminSection: 'payments' });
  assert.deepEqual(resolveRouteFromLocation('/UBDTOOLS/admin/payments', '', ''), { tab: 'admin-portal', adminSection: 'payments' });
  assert.deepEqual(resolveRouteFromLocation('/UBDTOOLS/', '?/admin/&section=payments', ''), { tab: 'admin-portal', adminSection: 'payments' });
  assert.equal(resolveRouteFromLocation('/UBDTOOLS/admin/', '?pay=1', '').tab, 'admin-portal');
  assert.equal(resolveRouteFromLocation('/UBDTOOLS/admin/ubd_monitoring', '', '').tab, 'telemetry-dashboard');
});

