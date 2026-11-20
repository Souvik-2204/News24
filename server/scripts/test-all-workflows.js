const http = require('http');

function apiRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('     NEWS24 - AUTOMATED WORKFLOW VERIFICATION       ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await apiRequest('/api/health');
    assert(health.status === 200 && health.body.status === 'ONLINE', '1. System Health Check');

    // 2. Public News Wire (Featured, Categories, Ticker)
    const featured = await apiRequest('/api/news/featured');
    assert(featured.status === 200 && featured.body.leadStory, '2. Public Lead Story Broadcast');

    const ticker = await apiRequest('/api/news/ticker');
    assert(ticker.status === 200 && ticker.body.ticker.length > 0, '3. TV Marquee Ticker Feed');

    const categories = await apiRequest('/api/news/categories');
    assert(categories.status === 200 && categories.body.categories.length === 6, '4. Six Mandatory News Desks');

    // 3. Authentication & Demo Personas
    const adminLogin = await apiRequest('/api/auth/demo-login/admin', 'POST');
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'SUPER_ADMIN', '5. Super Admin Demo Login');
    const adminToken = adminLogin.body.token;

    const editorLogin = await apiRequest('/api/auth/demo-login/editor', 'POST');
    assert(editorLogin.status === 200 && editorLogin.body.user.role === 'CHIEF_EDITOR', '6. Chief Editor Demo Login');
    const editorToken = editorLogin.body.token;

    const authorLogin = await apiRequest('/api/auth/demo-login/author', 'POST');
    assert(authorLogin.status === 200 && authorLogin.body.user.role === 'AUTHOR', '7. Author / Journalist Demo Login');
    const authorToken = authorLogin.body.token;

    const subscriberLogin = await apiRequest('/api/auth/demo-login/gold', 'POST');
    assert(subscriberLogin.status === 200 && subscriberLogin.body.user.subscriptionTier === 'GOLD', '8. Gold Subscriber Login');
    const goldToken = subscriberLogin.body.token;

    // 4. Backend Subscription & Tier Protection
    // Test a Gold tier article unauthenticated vs gold subscriber
    const goldArticleSlug = 'sovereign-wealth-pivot-gulf-funds-cornering-european-clean-grids';
    const unauthView = await apiRequest(`/api/news/article/${goldArticleSlug}`);
    assert(
      unauthView.status === 200 && unauthView.body.article.isLocked === true && unauthView.body.article.content === null,
      '9. Backend Tier Protection: Gold article content hidden from guest'
    );

    const goldView = await apiRequest(`/api/news/article/${goldArticleSlug}`, 'GET', null, goldToken);
    assert(
      goldView.status === 200 && goldView.body.article.isLocked === false && goldView.body.article.content !== null,
      '10. Backend Tier Access: Gold article unlocked for Gold Subscriber'
    );

    // 5. Maker-Checker Workflow Verification
    // A) Author creates a new article
    const newArtRes = await apiRequest('/api/cms/articles', 'POST', {
      title: 'Automated Test Investigation on Computational Ethics',
      excerpt: 'Investigating neural network oversight mechanisms across border security agencies.',
      content: '<p>Comprehensive draft investigation text for maker-checker testing.</p>',
      categoryId: categories.body.categories[0].id,
      accessTier: 'BRONZE',
      submitImmediately: false,
    }, authorToken);
    assert(newArtRes.status === 201 && newArtRes.body.article.status === 'DRAFT', '11. Maker-Checker Step 1: Author drafts article');
    const testArticleId = newArtRes.body.article.id;

    // B) Author submits article for review
    const submitRes = await apiRequest(`/api/workflow/${testArticleId}/submit`, 'POST', {
      comment: 'Submitted for editorial scrutiny.',
    }, authorToken);
    assert(submitRes.status === 200 && submitRes.body.article.status === 'PENDING_REVIEW', '12. Maker-Checker Step 2: Article submitted to Review Queue');

    // C) Rule: Author CANNOT approve own article!
    const selfApprove = await apiRequest(`/api/workflow/${testArticleId}/approve`, 'POST', {
      comment: 'Trying to self-approve my own work.',
    }, authorToken);
    assert(selfApprove.status === 403, '13. Maker-Checker Rule: Author self-approval strictly rejected (403)');

    // D) Rejection requires mandatory reason
    const emptyReject = await apiRequest(`/api/workflow/${testArticleId}/reject`, 'POST', {
      comment: '',
    }, editorToken);
    assert(emptyReject.status === 400, '14. Maker-Checker Rule: Rejection without reason rejected (400)');

    // E) Chief Editor approves article
    const chiefApprove = await apiRequest(`/api/workflow/${testArticleId}/approve`, 'POST', {
      comment: 'Verified with accredited diplomatic cables. Approved.',
      immediatePublish: true,
    }, editorToken);
    assert(chiefApprove.status === 200 && chiefApprove.body.article.status === 'PUBLISHED', '15. Maker-Checker Step 3: Chief Editor approved & published');

    // F) Audit history verification
    const historyRes = await apiRequest(`/api/workflow/${testArticleId}/history`, 'GET', null, editorToken);
    assert(historyRes.status === 200 && historyRes.body.approvals.length >= 2, '16. Complete Audit Log & Approval History Recorded');

    // 6. Subscriptions & Razorpay
    const plansRes = await apiRequest('/api/subscriptions/plans');
    assert(plansRes.status === 200 && plansRes.body.plans.length === 4, '17. Configured Plans (Free, Bronze, Silver, Gold)');

    const orderRes = await apiRequest('/api/subscriptions/create-order', 'POST', {
      planId: plansRes.body.plans.find(p => p.tier === 'SILVER').id,
      billingCycle: 'ANNUAL',
    }, authorToken);
    assert(orderRes.status === 200 && orderRes.body.orderId, '18. Razorpay Order Generation');

    const verifyRes = await apiRequest('/api/subscriptions/verify-payment', 'POST', {
      planId: plansRes.body.plans.find(p => p.tier === 'SILVER').id,
      billingCycle: 'ANNUAL',
      razorpayOrderId: orderRes.body.orderId,
      razorpayPaymentId: 'pay_test_workflow_automated',
      razorpaySignature: 'simulated_signature_valid',
    }, authorToken);
    assert(verifyRes.status === 200 && verifyRes.body.invoiceNumber, '19. Razorpay Payment Verification & Activation');

    // 7. Admin Analytics
    const analytics = await apiRequest('/api/admin/analytics', 'GET', null, adminToken);
    assert(analytics.status === 200 && analytics.body.counts.totalArticles > 20, '20. Newsroom Command Center Analytics & KPIs');

    console.log('\n====================================================');
    console.log(`  WORKFLOW TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution exception:', err);
    process.exit(1);
  }
}

runTests();
