const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // Clean existing data in reverse order of foreign key dependency
  await prisma.paymentEvent.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.subscriptionPlan.deleteMany({});
  await prisma.editorialActivityLog.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.articleRevision.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('[Seed] Cleared existing data.');

  // 1. Roles & Permissions
  const permissionsList = [
    { name: 'ARTICLE_CREATE', description: 'Can draft new articles' },
    { name: 'ARTICLE_EDIT_OWN', description: 'Can edit own articles' },
    { name: 'ARTICLE_EDIT_ALL', description: 'Can edit any article' },
    { name: 'ARTICLE_SUBMIT', description: 'Can submit article for review' },
    { name: 'ARTICLE_REVIEW', description: 'Can review submitted articles' },
    { name: 'ARTICLE_APPROVE', description: 'Can approve or reject articles' },
    { name: 'ARTICLE_PUBLISH', description: 'Can publish approved articles' },
    { name: 'ARTICLE_DELETE', description: 'Can delete articles' },
    { name: 'MANAGE_USERS', description: 'Can manage user accounts and roles' },
    { name: 'MANAGE_CATEGORIES', description: 'Can manage categories and tags' },
    { name: 'MANAGE_SUBSCRIPTIONS', description: 'Can manage subscription plans' },
    { name: 'VIEW_ANALYTICS', description: 'Can access newsroom analytics' },
  ];

  const permissions = {};
  for (const perm of permissionsList) {
    permissions[perm.name] = await prisma.permission.create({ data: perm });
  }

  const roleDefinitions = [
    {
      name: 'SUPER_ADMIN',
      description: 'Master Administrator with unrestricted access to newsroom, users, finances, and system settings',
      perms: Object.keys(permissions),
    },
    {
      name: 'CHIEF_EDITOR',
      description: 'Head of editorial desk with full review, approval, rejection, publishing, and category management powers',
      perms: [
        'ARTICLE_CREATE', 'ARTICLE_EDIT_OWN', 'ARTICLE_EDIT_ALL', 'ARTICLE_SUBMIT',
        'ARTICLE_REVIEW', 'ARTICLE_APPROVE', 'ARTICLE_PUBLISH', 'ARTICLE_DELETE',
        'MANAGE_CATEGORIES', 'VIEW_ANALYTICS',
      ],
    },
    {
      name: 'SECTION_EDITOR',
      description: 'Category editor responsible for reviewing and approving submissions in assigned desks',
      perms: [
        'ARTICLE_CREATE', 'ARTICLE_EDIT_OWN', 'ARTICLE_SUBMIT',
        'ARTICLE_REVIEW', 'ARTICLE_APPROVE', 'VIEW_ANALYTICS',
      ],
    },
    {
      name: 'AUTHOR',
      description: 'Staff journalist and correspondent who drafts investigations and submits them for desk review',
      perms: ['ARTICLE_CREATE', 'ARTICLE_EDIT_OWN', 'ARTICLE_SUBMIT'],
    },
    {
      name: 'SUBSCRIBER',
      description: 'Paid subscriber with tiered access to premium investigative reports and live feeds',
      perms: [],
    },
    {
      name: 'READER',
      description: 'Registered public reader with access to free news and community features',
      perms: [],
    },
  ];

  const roles = {};
  for (const r of roleDefinitions) {
    const roleRecord = await prisma.role.create({
      data: {
        name: r.name,
        description: r.description,
      },
    });
    roles[r.name] = roleRecord;

    for (const permName of r.perms) {
      if (permissions[permName]) {
        await prisma.rolePermission.create({
          data: {
            roleId: roleRecord.id,
            permissionId: permissions[permName].id,
          },
        });
      }
    }
  }

  console.log('[Seed] Created Roles and Permissions.');

  // 2. Demo Users
  const hashedPasswordAdmin = await bcrypt.hash('Admin@123', 10);
  const hashedPasswordEditor = await bcrypt.hash('Editor@123', 10);
  const hashedPasswordSection = await bcrypt.hash('Section@123', 10);
  const hashedPasswordAuthor = await bcrypt.hash('Author@123', 10);
  const hashedPasswordSubscriber = await bcrypt.hash('Subscriber@123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@news24.com',
      password: hashedPasswordAdmin,
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Executive Director of Digital Operations & Systems Architect at NEWS24.',
      roleId: roles['SUPER_ADMIN'].id,
    },
  });

  const chiefEditor = await prisma.user.create({
    data: {
      email: 'editor@news24.com',
      password: hashedPasswordEditor,
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Pulitzer-winning investigative journalist and Chief Editorial Officer at NEWS24.',
      roleId: roles['CHIEF_EDITOR'].id,
    },
  });

  const sectionEditor = await prisma.user.create({
    data: {
      email: 'section@news24.com',
      password: hashedPasswordSection,
      name: 'Amara Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      bio: 'Senior Desk Editor overseeing Global Geopolitics and Emerging Technologies.',
      roleId: roles['SECTION_EDITOR'].id,
      assignedCategory: 'Politics',
    },
  });

  const author = await prisma.user.create({
    data: {
      email: 'author@news24.com',
      password: hashedPasswordAuthor,
      name: 'David Sterling',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Senior Foreign Correspondent reporting from financial capitals and geopolitical frontiers.',
      roleId: roles['AUTHOR'].id,
    },
  });

  const goldSubscriber = await prisma.user.create({
    data: {
      email: 'subscriber@news24.com',
      password: hashedPasswordSubscriber,
      name: 'Rajesh Malhotra',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
      bio: 'Managing Partner at Apex Capital and avid NEWS24 Gold subscriber.',
      roleId: roles['SUBSCRIBER'].id,
    },
  });

  const silverSubscriber = await prisma.user.create({
    data: {
      email: 'silver.user@news24.com',
      password: hashedPasswordSubscriber,
      name: 'Samantha Grey',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      bio: 'Technology Strategy Consultant and Silver tier member.',
      roleId: roles['SUBSCRIBER'].id,
    },
  });

  const bronzeSubscriber = await prisma.user.create({
    data: {
      email: 'bronze.user@news24.com',
      password: hashedPasswordSubscriber,
      name: 'Vikram Joshi',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      bio: 'Economics researcher and Bronze subscriber.',
      roleId: roles['SUBSCRIBER'].id,
    },
  });

  console.log('[Seed] Created Demo Users.');

  // 3. Subscription Plans
  const plans = [
    {
      name: 'Free Access',
      slug: 'free',
      tier: 'FREE',
      description: 'Standard access to breaking headlines and public general reporting.',
      priceMonthly: 0,
      priceAnnual: 0,
      currency: 'INR',
      features: JSON.stringify([
        'Access to breaking news wire',
        'Standard news articles across all desks',
        'Daily newsletter digest',
        'Standard quality video reporting',
      ]),
    },
    {
      name: 'Bronze Access',
      slug: 'bronze',
      tier: 'BRONZE',
      description: 'Essential premium journalism with weekly economic briefs and analysis.',
      priceMonthly: 99,
      priceAnnual: 999,
      currency: 'INR',
      features: JSON.stringify([
        'Everything in Free Plan',
        'All Bronze-tier exclusive articles',
        'Weekly Deep Dive Intelligence Briefings',
        'Curated Politics & World analysis',
        'Ad-reduced reading experience',
      ]),
    },
    {
      name: 'Silver Access',
      slug: 'silver',
      tier: 'SILVER',
      description: 'Advanced investigative reports, tech trends, and live broadcast transcripts.',
      priceMonthly: 199,
      priceAnnual: 1999,
      currency: 'INR',
      features: JSON.stringify([
        'Everything in Bronze Plan',
        'All Silver & Bronze premium investigations',
        'Full Global Market & Business Dossiers',
        'Exclusive Section Editor Q&A sessions',
        'Full audio versions of top stories',
        'Ad-free reading interface',
      ]),
    },
    {
      name: 'Gold All-Access',
      slug: 'gold',
      tier: 'GOLD',
      description: 'Unrestricted VIP pass to every investigation, editorial archive, and live studio stream.',
      priceMonthly: 399,
      priceAnnual: 3999,
      currency: 'INR',
      features: JSON.stringify([
        'Unrestricted access to ALL articles & archives',
        'Gold-tier exclusive Investigative Leaks',
        'Live TV Studio stream & prime-time debates',
        'Direct email hotline to Chief Editors',
        'Personalized financial & geopolitical alerts',
        'VIP subscriber badge on reader comments',
      ]),
    },
  ];

  const planRecords = {};
  for (const p of plans) {
    planRecords[p.tier] = await prisma.subscriptionPlan.create({ data: p });
  }

  console.log('[Seed] Created Subscription Plans.');

  // Subscriptions & Payments for demo users
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const goldSub = await prisma.subscription.create({
    data: {
      userId: goldSubscriber.id,
      planId: planRecords['GOLD'].id,
      billingCycle: 'ANNUAL',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodStart: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: nextYear,
      razorpaySubscriptionId: 'sub_test_gold_99812736',
    },
  });

  const goldPayment = await prisma.payment.create({
    data: {
      userId: goldSubscriber.id,
      subscriptionId: goldSub.id,
      amount: 3999,
      currency: 'INR',
      status: 'SUCCESS',
      invoiceNumber: 'INV-2026-0089',
      razorpayOrderId: 'order_test_90123847',
      razorpayPaymentId: 'pay_test_88712364',
      paymentMethod: 'UPI (Axis Bank)',
    },
  });

  await prisma.paymentEvent.create({
    data: {
      paymentId: goldPayment.id,
      eventType: 'payment.captured',
      eventPayload: JSON.stringify({
        id: 'pay_test_88712364',
        amount: 399900,
        currency: 'INR',
        status: 'captured',
        method: 'upi',
      }),
    },
  });

  const silverSub = await prisma.subscription.create({
    data: {
      userId: silverSubscriber.id,
      planId: planRecords['SILVER'].id,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      currentPeriodStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: nextMonth,
      razorpaySubscriptionId: 'sub_test_silver_4412093',
    },
  });

  await prisma.payment.create({
    data: {
      userId: silverSubscriber.id,
      subscriptionId: silverSub.id,
      amount: 199,
      currency: 'INR',
      status: 'SUCCESS',
      invoiceNumber: 'INV-2026-0104',
      razorpayOrderId: 'order_test_48192038',
      razorpayPaymentId: 'pay_test_37190284',
      paymentMethod: 'VISA Credit Card',
    },
  });

  const bronzeSub = await prisma.subscription.create({
    data: {
      userId: bronzeSubscriber.id,
      planId: planRecords['BRONZE'].id,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      currentPeriodStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: nextMonth,
      razorpaySubscriptionId: 'sub_test_bronze_1190234',
    },
  });

  await prisma.payment.create({
    data: {
      userId: bronzeSubscriber.id,
      subscriptionId: bronzeSub.id,
      amount: 99,
      currency: 'INR',
      status: 'SUCCESS',
      invoiceNumber: 'INV-2026-0097',
      razorpayOrderId: 'order_test_10293847',
      razorpayPaymentId: 'pay_test_55610293',
      paymentMethod: 'Netbanking (HDFC)',
    },
  });

  console.log('[Seed] Created Subscriptions and Payments.');

  // 4. Six Categories
  const categoriesData = [
    {
      name: 'Politics',
      slug: 'politics',
      description: 'Power dynamics, parliamentary legislative battles, electoral shifts, and policy architecture.',
      color: '#e50914',
      icon: 'landmark',
      displayOrder: 1,
    },
    {
      name: 'Business',
      slug: 'business',
      description: 'Capital markets, monetary policy, corporate mergers, energy transitions, and fiscal strategy.',
      color: '#2563eb',
      icon: 'trending-up',
      displayOrder: 2,
    },
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Artificial intelligence paradigms, quantum frontiers, cybersecurity, and space tech.',
      color: '#0891b2',
      icon: 'cpu',
      displayOrder: 3,
    },
    {
      name: 'World',
      slug: 'world',
      description: 'Diplomatic summits, regional pacts, global supply chains, and multilateral conflicts.',
      color: '#059669',
      icon: 'globe',
      displayOrder: 4,
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Championship athletics, Formula 1 telemetry, cricket leagues, football, and sporting analytics.',
      color: '#ea580c',
      icon: 'trophy',
      displayOrder: 5,
    },
    {
      name: 'Opinion',
      slug: 'opinion',
      description: 'Authoritative columnists, editorial perspectives, ethical debate, and philosophical critique.',
      color: '#7c3aed',
      icon: 'feather',
      displayOrder: 6,
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }

  // Tags
  const tagsList = [
    'Geopolitics', 'AI Revolution', 'Wall Street', 'Elections 2026',
    'Green Energy', 'Cybersecurity', 'Championship', 'Monetary Policy',
    'Special Investigation', 'Exclusive', 'Diplomacy', 'Space Exploration'
  ];

  const tags = {};
  for (const tagName of tagsList) {
    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    tags[slug] = await prisma.tag.create({ data: { name: tagName, slug } });
  }

  console.log('[Seed] Created Categories and Tags.');

  // 5. 24+ Published Articles across 6 categories (including 8+ Premium)
  // Plus Pending Review & Rejected articles for Maker-Checker
  const articlesData = [
    // --- POLITICS ---
    {
      title: 'Global Coalition Unveils Historic Climate and Security Treaty at Geneva Summit',
      slug: 'global-coalition-unveils-historic-climate-security-treaty-geneva',
      subtitle: 'Delegates from 78 nations agree on binding emission caps and emergency border mitigation protocols.',
      excerpt: 'In an unprecedented midnight plenary session in Geneva, diplomatic delegations finalized the comprehensive Trans-Continental Resilience Pact, resolving three decades of contentious negotiations.',
      content: `<h2>The Breakthrough in Geneva</h2><p>Following seventy-two hours of nonstop closed-door deliberations, envoys from seventy-eight sovereign nations emerged this morning with a ratified multilateral agreement that redefines environmental obligations under international law.</p><p>Chief negotiators described the accord as the most consequential diplomatic realignment since the Kyoto Protocol. Notably, the agreement introduces legally enforceable cross-border carbon border adjustment mechanisms alongside a dedicated \$120 billion sovereign contingency fund.</p><blockquote>"We have moved beyond rhetoric and aspirational declarations into verified, institutional accountability," announced Chief Envoy Harrison Vance.</blockquote><h3>Key Pillars of the Accord</h3><ul><li>Mandatory 45% carbon reduction targets by 2032 across all signatory industrial sectors.</li><li>Standardized satellite monitoring frameworks conducted by independent space agencies.</li><li>Guaranteed transitional financing for emerging industrial economies.</li></ul><p>Markets in Frankfurt and London responded with immediate gains in green infrastructure indices, while industrial federations began evaluating the immediate compliance schedules required by early next quarter.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'The Palais des Nations plenary chamber following the historic vote in Geneva.',
      categoryId: categories['politics'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: true,
      isLeadStory: true,
      isLive: true,
      liveUpdatesCount: 14,
      readTimeMinutes: 5,
      viewsCount: 42180,
      tagSlugs: ['geopolitics', 'diplomacy', 'special-investigation'],
    },
    {
      title: 'Inside the Senate Cloakroom: The Secret Coalition Reshaping Electoral Finance Laws',
      slug: 'senate-cloakroom-coalition-reshaping-electoral-finance-laws',
      subtitle: 'Bipartisan moderates orchestrate sudden legislative revolt against algorithmic political super-PACs.',
      excerpt: 'A cross-aisle group of senators has drafted sweeping restrictions on automated micro-targeted political expenditures, threatening to upend traditional election war chests.',
      content: `<h2>The Midnight Caucus</h2><p>Behind guarded doors in Capitol Hill's quietest conference suites, an unexpected alliance of senior legislators has forged what insiders call the Fair Elections Safeguard Act.</p><p>The bill targets dark-money entities utilizing generative micro-targeting models to saturate contested districts. Penalties for non-disclosure under the draft reach upwards of eight figures per infraction.</p><h3>Battle Lines Form</h3><p>Lobbying coalitions representing digital advertising networks spent the weekend drafting emergency constitutional challenges, arguing algorithmic delivery enjoys First Amendment protections.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Capitol Hill illuminated during late-night legislative amendments.',
      categoryId: categories['politics'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'BRONZE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 6,
      viewsCount: 18450,
      tagSlugs: ['elections-2026', 'exclusive'],
    },
    {
      title: 'Supreme Court Weighs Executive Power in Landmark Artificial Intelligence Regulatory Dispute',
      slug: 'supreme-court-weighs-executive-power-ai-regulatory-dispute',
      subtitle: 'Justices question federal agencies authority to halt frontier foundational model deployments without congressional statutes.',
      excerpt: 'Oral arguments commenced today in what legal scholars deem the definitive separation-of-powers showdown of the digital era.',
      content: `<h2>Constitutional Crossroads</h2><p>The bench was intensely engaged throughout three hours of rigorous questioning regarding whether the Commerce Clause grants federal agencies unilateral jurisdiction over computational weights and server architectures.</p><p>Counsel for the administration emphasized national security hazards, while petitioners representing consortiums of AI developers warned of catastrophic economic chilling effects.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'The Supreme Court steps during morning arguments.',
      categoryId: categories['politics'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'SILVER',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 7,
      viewsCount: 12900,
      tagSlugs: ['ai-revolution', 'special-investigation'],
    },
    {
      title: 'Cabinet Reshuffle Signals New Trade Posture in Indo-Pacific Corridor',
      slug: 'cabinet-reshuffle-signals-new-trade-posture-indo-pacific',
      subtitle: 'Appointment of hardline trade strategist triggers diplomatic recalibration across Asian maritime capitals.',
      excerpt: 'The surprise promotion of Ambassador Lawrence Sterling to Secretary of Commerce presages a fortified tariff barrier aimed at securing domestic semiconductor supply chains.',
      content: `<h2>Strategic Realignment</h2><p>In a swift televised announcement from the briefing room, the head of state signaled an unapologetic re-orientation of maritime trade agreements, demanding reciprocal factory investment before access to premier shipping channels.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Government briefing podium ahead of cabinet announcements.',
      categoryId: categories['politics'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 4,
      viewsCount: 8400,
      tagSlugs: ['diplomacy', 'geopolitics'],
    },

    // --- BUSINESS ---
    {
      title: 'Central Banks Coordinate Global Liquidity Inflow to Avert Commercial Real Estate Contagion',
      slug: 'central-banks-coordinate-global-liquidity-inflow-avert-real-estate-contagion',
      subtitle: 'Federal Reserve, ECB, and Bank of Japan synchronize overnight swap lines amid sudden debt renegotiation bottlenecks.',
      excerpt: 'Faced with impending maturity cliffs on over \$1.4 trillion in urban office towers, international monetary authorities orchestrated a synchronized liquidity guarantee at dawn today.',
      content: `<h2>A Coordinated Intervention</h2><p>In an early morning joint communiquÃ©, the chairpersons of the world's leading central banks declared immediate expansion of currency swap lines and temporary collateral leniency for regional financial institutions holding distressed commercial paper.</p><p>The move staved off what futures markets predicted would be a devastating wave of loan defaults across Frankfurt, New York, and Tokyo financial districts.</p><h3>The Underlying Debt Spiral</h3><p>Urban occupancy rates have stabilized at approximately 68% of pre-pandemic benchmarks, leaving dozens of prime corporate skyscrapers underwater relative to high-interest construction bonds issued prior to monetary tightening.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Trading floor monitors flashing green following central bank announcements.',
      categoryId: categories['business'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: true,
      isLeadStory: false,
      isLive: false,
      readTimeMinutes: 5,
      viewsCount: 31200,
      tagSlugs: ['wall-street', 'monetary-policy'],
    },
    {
      title: 'The Sovereign Wealth Pivot: Why Gulf Funds Are Quietly Cornering European Clean Grids',
      slug: 'sovereign-wealth-pivot-gulf-funds-cornering-european-clean-grids',
      subtitle: 'Exclusive financial audit reveals over \$85 billion deployed into offshore wind and HVDC transmission infrastructure.',
      excerpt: 'A confidential NEWS24 investigation into regulatory filings shows sovereign wealth vehicles acquiring controlling stakes in crucial continental energy arteries.',
      content: `<h2>The Silent Energy Acquisition</h2><p>While venture capital focused attention on software algorithms, sovereign capital from Riyadh, Abu Dhabi, and Doha systematically built majority stakes in the high-voltage direct current (HVDC) interconnectors binding the North Sea wind farms to mainland Europe.</p><p>Our forensic review of 42 holding companies registered across Luxembourg and Dublin reveals coordinated procurement that now influences electricity pricing for 140 million households.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Modern financial high-rises reflecting morning light.',
      categoryId: categories['business'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'GOLD',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 8,
      viewsCount: 22100,
      tagSlugs: ['exclusive', 'special-investigation', 'green-energy'],
    },
    {
      title: 'Semiconductor Foundry Titans Announce \$40 Billion Joint Manufacturing Foundry in Dresden',
      slug: 'semiconductor-foundry-titans-40-billion-joint-foundry-dresden',
      subtitle: 'European Silicon Valley expands as 2-nanometer extreme ultraviolet lithography lines break ground.',
      excerpt: 'In a massive boost to European technological sovereignty, Taiwanese and American chip architects confirmed the continent largest single industrial investment to date.',
      content: `<h2>Dresden New Silicon Era</h2><p>State officials stood alongside multinational executives today to break ground on a cutting-edge fabrication facility engineered to output 2nm automotive and industrial computing chips by late 2028.</p><p>Subsidies approved under the European Chips Directive provided the vital anchor for the consortium capital expenditure.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Automated cleanroom robotic wafer handlers.',
      categoryId: categories['business'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'BRONZE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 5,
      viewsCount: 15400,
      tagSlugs: ['ai-revolution', 'wall-street'],
    },
    {
      title: 'Aviation Megamerger Collapses Under Antitrust Scrutiny and Consumer Backlash',
      slug: 'aviation-megamerger-collapses-under-antitrust-scrutiny',
      subtitle: 'A \$32 billion proposed tie-up dissolves after competition regulators threaten structural divestiture orders.',
      excerpt: 'The ambition to establish the hemisphere largest combined carrier dissolved as corporate boards conceded compliance remedies would destroy intended shareholder synergies.',
      content: `<h2>The Dissolution</h2><p>Following nine months of fierce litigation across three federal circuits, board members voted overwhelmingly to terminate merger protocols and distribute a \$650 million breakup penalty.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Commercial jetliners lined along tarmac gates.',
      categoryId: categories['business'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 4,
      viewsCount: 9700,
      tagSlugs: ['wall-street'],
    },

    // --- TECHNOLOGY ---
    {
      title: 'Autonomous AI Agents Achieve Zero-Shot Reasoning in Biochemical Synthesis Trials',
      slug: 'autonomous-ai-agents-achieve-zero-shot-reasoning-biochemical-synthesis',
      subtitle: 'Laboratory robots directed by multimodal reasoning engines formulate three novel non-toxic polymer catalysts in 48 hours.',
      excerpt: 'In a watershed demonstration published in Nature today, researchers observed self-correcting neural algorithms synthesize advanced materials without human laboratory intervention.',
      content: `<h2>From Software to Physical Matter</h2><p>For decades, computational pharmacology relied on guided simulation. Yesterday, a team of biochemists and computer scientists in Zurich witnessed neural agents independently adjust temperature, pressure, and chemical reagents across 300 micro-reactors.</p><p>The resultant compounds possess thermal stability surpassing standard aeronautical resins while biodegrading under marine sunlight within twelve months.</p><h3>Safety Protocols and Dual-Use Fears</h3><p>While the pharmaceutical implications are revolutionary, biological security councils convened emergency working groups to evaluate safeguarding measures against malicious chemical formulation.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Microfluidic synthesis reactor guided by neural interface models.',
      categoryId: categories['technology'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'SILVER',
      isBreaking: true,
      isLeadStory: false,
      isLive: false,
      readTimeMinutes: 6,
      viewsCount: 29800,
      tagSlugs: ['ai-revolution', 'special-investigation'],
    },
    {
      title: 'The Quantum Decryption Threshold: Inside the Intelligence Community Race for Post-RSA Cryptography',
      slug: 'quantum-decryption-threshold-intelligence-race-post-rsa-cryptography',
      subtitle: 'Leaked directives reveal government agencies ordering immediate deprecation of legacy public-key standards.',
      excerpt: 'Classified briefings confirm mathematical progress toward fault-tolerant Shor algorithm execution has arrived five years ahead of standard academic forecasts.',
      content: `<h2>The Cryptographic Sunset</h2><p>Every encrypted bank transaction, secure military channel, and healthcare record secured by classical RSA-2048 encryption is rapidly approaching obsolescence. A confidential memo obtained by NEWS24 outlines emergency deployment schedules for lattice-based algorithms.</p><p>Financial institutions that fail to complete migration by the third quarter of 2027 face severe capital adequacy penalties from insurance underwriters.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Cryogenic quantum dilution refrigerator inside advanced research facility.',
      categoryId: categories['technology'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'GOLD',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 9,
      viewsCount: 38700,
      tagSlugs: ['exclusive', 'cybersecurity', 'ai-revolution'],
    },
    {
      title: 'Commercial Fusion Reactor Delivers Sustained Net-Energy Output for 120 Consecutive Minutes',
      slug: 'commercial-fusion-reactor-sustained-net-energy-output-120-minutes',
      subtitle: 'High-temperature superconducting magnets maintain plasma equilibrium in record-breaking pilot trial.',
      excerpt: 'A private fusion venture headquartered in Oxfordshire confirmed continuous plasma containment yielding a Q-factor of 1.48, proving magnetic confinement viability for municipal power grids.',
      content: `<h2>The Star in the Laboratory</h2><p>Engineers celebrated in the control room as the tokamak plasma temperature sustained 150 million degrees Celsius for two continuous hours without thermal quenching or wall degradation.</p><p>The breakthrough relies on rare-earth barium copper oxide (REBCO) magnet tapes capable of producing magnetic fields exceeding 20 Tesla in compact geometries.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Glowing vacuum chamber of the magnetic confinement prototype.',
      categoryId: categories['technology'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'BRONZE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 5,
      viewsCount: 24100,
      tagSlugs: ['green-energy', 'space-exploration'],
    },
    {
      title: 'Next-Generation Neural Interfaces Receive Clinical Clearance for Paralysis Restoration',
      slug: 'neural-interfaces-clinical-clearance-paralysis-restoration',
      subtitle: 'Wireless cortical implants enable quadriplegic patients to control robotic exoskeletons with sub-millisecond latency.',
      excerpt: 'Health authorities granted historic clinical approval for an endovascular neural recording array inserted through the jugular vein without open craniotomy.',
      content: `<h2>Reconnecting Mind and Movement</h2><p>Clinical trial participants demonstrated the ability to type 68 words per minute and maneuver precision robotic armatures solely through intended thought patterns, heralding a new era of neuro-prosthetics.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'High-density microelectrode array sensor wafer.',
      categoryId: categories['technology'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 5,
      viewsCount: 16500,
      tagSlugs: ['ai-revolution'],
    },

    // --- WORLD ---
    {
      title: 'Strait of Hormuz Emergency Protocol: Naval Coalition Intercepts Hostile Drone Swarm',
      slug: 'strait-of-hormuz-emergency-protocol-naval-coalition-intercepts-drone-swarm',
      subtitle: 'Commercial tanker convoys resume under guided missile frigate escort as regional tensions flare.',
      excerpt: 'A multi-national naval task force deployed electronic warfare jamming and directed energy defenses to neutralize thirty-six unmanned maritime strike craft in the Persian Gulf.',
      content: `<h2>Flashpoint in the Narrows</h2><p>At 03:40 local time, radar installations detected coordinated surface and aerial drones approaching a convoy of crude carriers transiting through international shipping lanes.</p><p>Within minutes, allied warships activated layered counter-UAS batteries, neutralizing the inbound threats without damage to merchant crews or commercial hulls.</p><h3>Crude Oil Market Volatility</h3><p>Brent crude spiked 4.8% during early Asian trading before retreating as shipping authorities established protected transit corridors with continuous airborne surveillance.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Naval frigate conducting night operations in strategic waterways.',
      categoryId: categories['world'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: true,
      isLeadStory: false,
      isLive: true,
      liveUpdatesCount: 8,
      readTimeMinutes: 5,
      viewsCount: 47200,
      tagSlugs: ['geopolitics', 'diplomacy'],
    },
    {
      title: 'The Arctic Sea Route Rush: Russia and China Launch Nuclear Icebreaker Flotilla',
      slug: 'arctic-sea-route-rush-nuclear-icebreaker-flotilla',
      subtitle: 'Melting polar ice opens the Northern Sea Route for year-round container freight, bypassing Suez canal entirely.',
      excerpt: 'A joint maritime authority deployed three 60-megawatt nuclear icebreakers to escort commercial bulk carriers across the frozen Siberian coastline, slashing transit times to Rotterdam by twelve days.',
      content: `<h2>The New Polar Silk Road</h2><p>As summer polar ice recedes to historic minimums, navigation along the Northeast Passage has evolved from an occasional scientific novelty into an active, high-volume commercial artery.</p><p>Nordic defense ministries raised concerns regarding military radar tracking stations established concurrently along Arctic archipelagoes.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Polar icebreaker carving navigable leads through pack ice.',
      categoryId: categories['world'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'BRONZE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 6,
      viewsCount: 19800,
      tagSlugs: ['geopolitics', 'diplomacy'],
    },
    {
      title: 'Classified Cable: How Illicit Rare Earth Mining in Central Africa Funds Unsanctioned Militias',
      slug: 'classified-cable-illicit-rare-earth-mining-central-africa-funds-militias',
      subtitle: 'NEWS24 on-the-ground investigation uncovers smuggling networks feeding global battery supply chains.',
      excerpt: 'Despite international traceability certifications, tons of coltan, lithium, and neodymium continue to slip across porous borders via shadow logistics companies registered in tax havens.',
      content: `<h2>The Mineral Shadow Economy</h2><p>In the remote river valleys of the eastern Great Lakes region, thousands of artisanal diggers operate under the watchful gaze of armed rebel factions claiming allegiance to forgotten peace accords.</p><p>Our field correspondents tracked a single shipment of high-grade tantalum across three land borders, revealing falsified customs documents and corporate intermediaries that shield multinational consumer brands from legal culpability.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Artisanal mineral extraction site in remote mountain river valley.',
      categoryId: categories['world'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'GOLD',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 10,
      viewsCount: 31000,
      tagSlugs: ['exclusive', 'special-investigation', 'geopolitics'],
    },
    {
      title: 'South American Trade Bloc Expands Currency Union to Bypass US Dollar Reserve Pegs',
      slug: 'south-american-trade-bloc-currency-union-bypass-dollar',
      subtitle: 'Mercosur and Andean nations formalize digital clearinghouse for bilateral commodity settlements.',
      excerpt: 'Finance ministers meeting in Montevideo ratified the creation of the Sur Digital Unit, a tokenized trade ledger backed by sovereign grain and copper reserves.',
      content: `<h2>Monetary Decentralization</h2><p>By establishing a regional multilateral payment network, member states anticipate eliminating \$4.2 billion in annual transaction friction costs related to New York correspondent banking fees.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Central bank headquarters during international trade assembly.',
      categoryId: categories['world'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 4,
      viewsCount: 11200,
      tagSlugs: ['monetary-policy', 'geopolitics'],
    },

    // --- SPORTS ---
    {
      title: 'Monaco Grand Prix Thriller: Rookie Prodigy Stuns World Champion on Rain-Soaked Final Lap',
      slug: 'monaco-grand-prix-thriller-rookie-prodigy-stuns-champion-rain',
      subtitle: 'A brazen dry-tire gamble through the Swimming Pool chicane secures history in the most chaotic race of the decade.',
      excerpt: 'Nineteen-year-old sensation Matteo Rossi executed an unthinkable overtake around the outside of Casino Square as torrential rain triggered absolute pandemonium in the principality.',
      content: `<h2>Pure Racing Theater</h2><p>With three laps remaining and downpours flooding Rascasse corner, race leaders dove into the pit lane for intermediate wet tires. Rossi and his race engineers defied conventional wisdom, leaving their slick tires bolted to the chassis.</p><p>Sliding through standing water with millimeters to spare against the Armco barriers, the teenager held off furious attacks to become the youngest winner in Formula 1 history.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Formula 1 cars navigating tight hairpin turns in changing weather.',
      categoryId: categories['sports'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 4,
      viewsCount: 52100,
      tagSlugs: ['championship'],
    },
    {
      title: 'The Biometric Revolution in European Football: How Neural Tracking Is Eliminating Hamstring Injuries',
      slug: 'biometric-revolution-european-football-neural-tracking-injuries',
      subtitle: 'Premier League and Champions League powerhouses deploy real-time micro-wearables to predict muscle fatigue.',
      excerpt: 'A confidential sports science consortium has reduced soft-tissue tear occurrences by 74% using predictive AI models analyzing micro-vibrations in athlete tendon tissue during match play.',
      content: `<h2>The Science of Longevity</h2><p>Modern footballers cover upwards of 13 kilometers per match at high intensity. Until recently, substitution decisions were made by intuitive coaching observation. Today, sideline analytics benches monitor muscle oxygenation telemetry transmitted in real time.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Under floodlights at a premier European football stadium.',
      categoryId: categories['sports'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'SILVER',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 5,
      viewsCount: 14700,
      tagSlugs: ['ai-revolution', 'championship'],
    },
    {
      title: 'World Cricket Championship: Record-Breaking Double Century in Dramatic Melbourne Final',
      slug: 'world-cricket-championship-record-double-century-melbourne-final',
      subtitle: 'A masterclass innings under the lights at the MCG leads an improbable fourth-innings chase of 412 runs.',
      excerpt: 'Over 92,000 roaring spectators witnessed batting perfection as the tournament underdogs chased down the highest fourth-innings target in one-day cricket history.',
      content: `<h2>Mastery Under Pressure</h2><p>Needing fourteen runs off the final six deliveries with nine wickets down, captain Rohit Sharma produced two imperious upper-cuts over the third man boundary, securing immortal status in cricket folklore.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'The historic Melbourne Cricket Ground during a sold-out final.',
      categoryId: categories['sports'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 5,
      viewsCount: 68300,
      tagSlugs: ['championship'],
    },
    {
      title: 'Olympic Committee Approves High-Altitude Mixed Martial Arts and Extreme Drone Racing for 2028',
      slug: 'olympic-committee-approves-mma-extreme-drone-racing-2028',
      subtitle: 'The international sporting body undertakes its most radical youth-oriented program expansion in modern history.',
      excerpt: 'Seeking to engage digital-native audiences, IOC delegates voted overwhelmingly to introduce FPV drone aerobatics and unified martial arts onto the premier summer podium.',
      content: `<h2>Evolution of the Games</h2><p>Broadcasting rights for the newly included disciplines have already ignited fierce bidding wars between traditional network broadcasters and interactive streaming platforms.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'High performance athletes training in competitive athletic arena.',
      categoryId: categories['sports'].id,
      authorId: author.id,
      status: 'PUBLISHED',
      accessTier: 'BRONZE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 4,
      viewsCount: 17800,
      tagSlugs: ['championship'],
    },

    // --- OPINION ---
    {
      title: 'The Illusion of Infinite Compute: Why the Physical Limits of Silicon Will Humiliate Technocrats',
      slug: 'illusion-of-infinite-compute-silicon-limits-humiliate-technocrats',
      subtitle: 'Silicon Valley investors are modeling AI exponential growth while ignoring thermodynamics, copper shortages, and water scarcity.',
      excerpt: 'We have allowed ourselves to believe that code transcends physics. But server farms drink rivers and eat electrical grids, and nature will collect its bill far sooner than Wall Street expects.',
      content: `<h2>The Church of Computational Inevitability</h2><p>Every decade or so, our ruling financial class convinces itself that human intelligence is simply an arithmetic problem awaiting more wattage. The current generative mania differs only in its carbon footprint.</p><p>When a single query consumes enough distilled water to hydrate an infant for an afternoon, our technological trajectory is not innovationâ€”it is resource extraction disguised as progress.</p><blockquote>"We cannot algorithmically hallucinate our way out of the Second Law of Thermodynamics."</blockquote><h3>The Coming Gridlock</h3><p>By 2028, data center electricity demand in the United States alone will match the aggregate consumption of twenty-two individual states. Unless our engineering ethos pivots toward radical computational frugality, the reckoning will be swift and unforgiving.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Orbital view of illuminated continent nightscapes.',
      categoryId: categories['opinion'].id,
      authorId: chiefEditor.id,
      status: 'PUBLISHED',
      accessTier: 'FREE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 7,
      viewsCount: 39500,
      tagSlugs: ['ai-revolution', 'green-energy'],
    },
    {
      title: 'The Death of the Institutional Center: Why Democracies Are Fracturing into Algorithmic Feuds',
      slug: 'death-of-institutional-center-democracies-fracturing-algorithmic-feuds',
      subtitle: 'When engagement algorithms replace civil society, consensus becomes impossible and governance turns into continuous warfare.',
      excerpt: 'We no longer share a town square; we inhabit custom-built psychological funhouses engineered to maximize outrage for advertising revenue.',
      content: `<h2>The Architectures of Mutual Contempt</h2><p>Democracy requires a baseline consensus of reality. You and I may vigorously disagree on tax rates or zoning regulations, but we must agree that the bridge exists, that the river is rising, and that the ballot box was counted honestly.</p><p>Today, engagement metrics have optimized out the middle ground. Nuance is penalised; hostility is rewarded with dopamine and reach.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Silhouettes of demonstrators gathered before government monuments.',
      categoryId: categories['opinion'].id,
      authorId: chiefEditor.id,
      status: 'PUBLISHED',
      accessTier: 'BRONZE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 6,
      viewsCount: 28400,
      tagSlugs: ['elections-2026'],
    },
    {
      title: 'The Great De-Dollarization Myth: Why Washington Currency Remains the Unshakable Global Anchor',
      slug: 'great-de-dollarization-myth-why-dollar-remains-unshakable-anchor',
      subtitle: 'Pundits prophesy the demise of the greenback, yet foreign reserves and debt contracts still flee to US Treasury bonds.',
      excerpt: 'A currency reserve is not merely an accounting ledger; it is an expression of legal transparency, deep capital markets, and naval enforcement. No rival bloc comes close.',
      content: `<h2>The Fallacy of Alternative Reserves</h2><p>Every conference of non-aligned nations issues stirring proclamations about trading in local denominations. Yet when those same regimes seek safety for their sovereign endowments, they purchase United States dollar-denominated assets.</p><p>To displace the dollar, a challenger must offer open capital accounts, independent judicial review, and the willingness to absorb global trade deficitsâ€”commitments no authoritarian rival will ever stomach.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Financial currency notes and securities.',
      categoryId: categories['opinion'].id,
      authorId: chiefEditor.id,
      status: 'PUBLISHED',
      accessTier: 'SILVER',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 6,
      viewsCount: 21900,
      tagSlugs: ['wall-street', 'monetary-policy'],
    },
    {
      title: 'In Defense of Slow Journalism: Reclaiming the Newsroom from the Dopamine Mill',
      slug: 'defense-of-slow-journalism-reclaiming-newsroom-dopamine-mill',
      subtitle: 'Why NEWS24 chooses rigorous investigation over instantaneous push notifications.',
      excerpt: 'The obsession with breaking a story two minutes before the competition has destroyed the civic credibility of the press. The remedy is patient, forensic, fearless verification.',
      content: `<h2>The Tyranny of the Speed Cycle</h2><p>In the modern news industry, being first has eclipsed being correct. Retractions are whispered on weekend mornings while sensational falsehoods spread across four million timelines.</p><p>True journalism is not stenography of celebrity tweets or corporate press releases. It is the arduous excavation of truths powerful institutions desperately strive to conceal.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Vintage printing press typeset with modern digital layout.',
      categoryId: categories['opinion'].id,
      authorId: chiefEditor.id,
      status: 'PUBLISHED',
      accessTier: 'GOLD',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 8,
      viewsCount: 35600,
      tagSlugs: ['exclusive', 'special-investigation'],
    },

    // --- WORKFLOW SAMPLE ARTICLES (Maker-Checker Demo) ---
    // 1) Article currently pending approval in review queue:
    {
      title: 'Investigative Dossier: Offshore Tax Arbitrage in Island Free Trade Zones',
      slug: 'investigative-dossier-offshore-tax-arbitrage-island-free-trade-zones',
      subtitle: 'Leaked commercial banking ledgers expose systematic withholding evasion by luxury conglomerates.',
      excerpt: 'A six-month cross-border investigative project tracking \$14 billion in uncollected corporate dividends funnelled through shell corporations in the Caribbean.',
      content: `<h2>The Island Funnel</h2><p>Confidential banking records obtained through whistleblowers reveal an intricate architecture of intellectual property holding companies established solely to strip taxable earnings from domestic manufacturing hubs.</p><p>Internal correspondence shows accounting partners explicitly coaching clients on how to fabricate research and development expenditures to evade audit thresholds.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Financial documents under forensic ledger examination.',
      categoryId: categories['business'].id,
      authorId: author.id,
      status: 'PENDING_REVIEW',
      accessTier: 'GOLD',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 7,
      viewsCount: 0,
      tagSlugs: ['exclusive', 'special-investigation', 'wall-street'],
    },
    // 2) Article rejected with required reason, demonstrating maker-checker history:
    {
      title: 'Unverified Rumors Regarding Secret High-Level Diplomatic Talks in Vienna',
      slug: 'unverified-rumors-secret-high-level-diplomatic-talks-vienna',
      subtitle: 'Sources claim preliminary truce framework discussed at private lakeside villa.',
      excerpt: 'Anonymous social media chatter suggests bilateral emissaries met in secret to discuss territorial concessions.',
      content: `<h2>Rumors and Speculation</h2><p>Online forums have been buzzing with unverified assertions that a senior delegation arrived in Vienna on an unmarked charter aircraft yesterday evening.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Evening skyline along the Danube canal in Vienna.',
      categoryId: categories['world'].id,
      authorId: author.id,
      status: 'REJECTED',
      accessTier: 'FREE',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 3,
      viewsCount: 0,
      tagSlugs: ['diplomacy'],
    },
    // 3) Article in draft status:
    {
      title: 'Draft: The Emerging Space Economy and Asteroid Prospecting Rights',
      slug: 'draft-emerging-space-economy-asteroid-prospecting-rights',
      subtitle: 'Commercial aerospace ventures lobby United Nations committee for orbital property claims.',
      excerpt: 'As robotic orbital probes prepare for inaugural touch-and-go sampling missions on metallic asteroids, legal experts are drafting space resource treaties.',
      content: `<h2>The New Gold Rush</h2><p>Draft working copy in progress. Detailed legal citations to be appended following interview with Outer Space Affairs Directorate.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Artist rendering of orbital mineral analysis satellite.',
      categoryId: categories['technology'].id,
      authorId: author.id,
      status: 'DRAFT',
      accessTier: 'SILVER',
      isBreaking: false,
      isLeadStory: false,
      readTimeMinutes: 4,
      viewsCount: 0,
      tagSlugs: ['space-exploration'],
    },
  ];

  console.log(`[Seed] Inserting ${articlesData.length} articles...`);

  const createdArticles = [];
  for (const art of articlesData) {
    const { tagSlugs, ...artFields } = art;
    const publishedAtDate = art.status === 'PUBLISHED' ? new Date(now.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) : null;

    const createdArticle = await prisma.article.create({
      data: {
        ...artFields,
        publishedAt: publishedAtDate,
      },
    });

    createdArticles.push(createdArticle);

    // Link Tags
    if (tagSlugs && tagSlugs.length > 0) {
      for (const tSlug of tagSlugs) {
        if (tags[tSlug]) {
          await prisma.articleTag.create({
            data: {
              articleId: createdArticle.id,
              tagId: tags[tSlug].id,
            },
          });
        }
      }
    }

    // If published, record an initial approval record and activity log
    if (art.status === 'PUBLISHED') {
      await prisma.approval.create({
        data: {
          articleId: createdArticle.id,
          reviewerId: chiefEditor.id,
          action: 'PUBLISHED',
          comment: 'Approved and certified for immediate global broadcast.',
          previousStatus: 'APPROVED',
          newStatus: 'PUBLISHED',
          createdAt: publishedAtDate || now,
        },
      });

      await prisma.editorialActivityLog.create({
        data: {
          userId: chiefEditor.id,
          action: 'ARTICLE_PUBLISHED',
          entityType: 'ARTICLE',
          entityId: createdArticle.id,
          metadata: JSON.stringify({ title: createdArticle.title, tier: createdArticle.accessTier }),
          createdAt: publishedAtDate || now,
        },
      });
    }

    // If Pending Review, record submission approval
    if (art.status === 'PENDING_REVIEW') {
      await prisma.approval.create({
        data: {
          articleId: createdArticle.id,
          reviewerId: author.id,
          action: 'SUBMITTED',
          comment: 'Submitted by investigative desk for Chief Editor review and fact-check.',
          previousStatus: 'DRAFT',
          newStatus: 'PENDING_REVIEW',
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
      });

      await prisma.editorialActivityLog.create({
        data: {
          userId: author.id,
          action: 'ARTICLE_SUBMITTED',
          entityType: 'ARTICLE',
          entityId: createdArticle.id,
          metadata: JSON.stringify({ title: createdArticle.title }),
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
      });
    }

    // If Rejected, record rejection approval history with mandatory reason
    if (art.status === 'REJECTED') {
      await prisma.approval.create({
        data: {
          articleId: createdArticle.id,
          reviewerId: chiefEditor.id,
          action: 'REJECTED',
          comment: 'REJECTION REASON: Article relies entirely on unsubstantiated anonymous social media claims with zero verified on-the-record diplomatic corroboration. Please re-interview accredited sources and resubmit with primary documentation.',
          previousStatus: 'PENDING_REVIEW',
          newStatus: 'REJECTED',
          createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
      });

      await prisma.editorialActivityLog.create({
        data: {
          userId: chiefEditor.id,
          action: 'ARTICLE_REJECTED',
          entityType: 'ARTICLE',
          entityId: createdArticle.id,
          metadata: JSON.stringify({ title: createdArticle.title, reason: 'Lacks corroborated sources' }),
          createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
      });
    }
  }

  // 6. Sample Newsletter Subscribers
  const sampleEmails = [
    'reader.alpha@worldbrief.org',
    'analyst.chen@geopolitics-monitor.com',
    'marina.kovacs@diplomacy-review.eu',
    'tariq.al-mansoor@globalcapital.ae',
    'claire.dupont@sorbonne-policy.fr',
  ];

  for (const em of sampleEmails) {
    await prisma.newsletterSubscriber.create({
      data: { email: em },
    });
  }

  console.log('[Seed] Database seed completed successfully!');
  console.log('[Seed] Demo Credentials:');
  console.log(' - Super Admin: admin@news24.com / Admin@123');
  console.log(' - Chief Editor: editor@news24.com / Editor@123');
  console.log(' - Section Editor: section@news24.com / Section@123');
  console.log(' - Author/Journalist: author@news24.com / Author@123');
  console.log(' - Subscriber (Gold): subscriber@news24.com / Subscriber@123');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

