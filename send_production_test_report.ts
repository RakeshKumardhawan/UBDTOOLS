
async function sendTestReports() {
  const prodUrl = 'https://www.e-vedhika.in/admin/exe_ubd_live.php';
  
  console.log(`🚀 Sending production test reports to: ${prodUrl}`);

  // 1. Success Report (Telangana)
  const successReport = {
    pcName: 'TS-GP-KHAMMAM-PROD',
    userName: 'Srinivas_Rao_Sec',
    officeLocation: 'Khammam Urban Grama Panchayat, Telangana',
    state: 'Telangana',
    status: 'SUCCESS',
    verification: '17/17 Passed (51/51 Registry Keys)',
    healthScore: 100,
    dscStatus: 'ProxKey Connected',
    edgeIeMode: 'IE5 Quirks Active',
    remarks: 'E-Vedhika v1.0.8 Production Test: 17/17 Steps Verified successfully!'
  };

  // 2. Failure Report (Andhra Pradesh - to test fair evaluation)
  const failReport = {
    pcName: 'AP-GP-VIZAG-PROD',
    userName: 'Venkatesh_Operator',
    officeLocation: 'Bheemunipatnam Mandal Office, Visakhapatnam, AP',
    state: 'Andhra Pradesh',
    status: 'FAIL',
    verification: '12/17 Passed',
    healthScore: 65,
    dscStatus: 'Token Disconnected',
    edgeIeMode: 'FAIL (Registry Policy Drift)',
    remarks: 'E-Vedhika v1.0.8 Production Test: Edge IE Mode Policy verification FAILED.'
  };

  try {
    console.log('Sending Success Report...');
    const res1 = await fetch(prodUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(successReport)
    });
    const data1 = await res1.json();
    console.log('Success Report Result:', data1);

    console.log('Sending Failure Report...');
    const res2 = await fetch(prodUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(failReport)
    });
    const data2 = await res2.json();
    console.log('Failure Report Result:', data2);

    console.log('✅ Production test reports dispatched!');
  } catch (err) {
    console.error('❌ Failed to send production test reports:', err.message);
  }
}

sendTestReports();
