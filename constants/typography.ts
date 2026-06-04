/**
 * Typography tokens aligned with sewa-eats (Expo) StyleSheet values.
 * iOS uses SF Pro via system font; web mirrors with the same size/weight/tracking.
 */

export const FontFamily = {
  sans:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  serif: 'ui-serif, "New York", "Iowan Old Style", "Apple Garamond", Georgia, "Times New Roman", serif',
  rounded:
    '"SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Hiragino Maru Gothic ProN", Meiryo, sans-serif',
  mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

/** Tailwind-compatible class names (defined in app/typography.css) */
export const TypeClass = {
  heroTitle: 'type-hero-title',
  heroSubtitle: 'type-hero-subtitle',
  onboardHeadline: 'type-onboard-headline',
  onboardSubtext: 'type-onboard-subtext',
  onboardBadge: 'type-onboard-badge',
  onboardSkip: 'type-onboard-skip',
  onboardCta: 'type-onboard-cta',
  onboardCardTitle: 'type-onboard-card-title',
  onboardRule: 'type-onboard-rule',
  onboardCheck: 'type-onboard-check',
  screenTitle: 'type-screen-title',
  screenSubtitle: 'type-screen-subtitle',
  sectionTitle: 'type-section-title',
  sectionTitleSm: 'type-section-title-sm',
  label: 'type-label',
  labelSm: 'type-label-sm',
  body: 'type-body',
  bodyMd: 'type-body-md',
  bodySm: 'type-body-sm',
  caption: 'type-caption',
  captionXs: 'type-caption-xs',
  micro: 'type-micro',
  btn: 'type-btn',
  btnSm: 'type-btn-sm',
  mealName: 'type-meal-name',
  mealDesc: 'type-meal-desc',
  mealServings: 'type-meal-servings',
  profileSection: 'type-profile-section',
  profileName: 'type-profile-name',
  profileEmail: 'type-profile-email',
  metaLabel: 'type-meta-label',
  metaValue: 'type-meta-value',
  statusTitle: 'type-status-title',
  statusSubtitle: 'type-status-subtitle',
  progressTitle: 'type-progress-title',
  progressStep: 'type-progress-step',
  detailLabel: 'type-detail-label',
  detailValue: 'type-detail-value',
  roleTitle: 'type-role-title',
  roleSubtitle: 'type-role-subtitle',
  roleLabel: 'type-role-label',
  signInEyebrow: 'type-signin-eyebrow',
  signInTitle: 'type-signin-title',
  signInSubtitle: 'type-signin-subtitle',
  authBtn: 'type-auth-btn',
  quoteMark: 'type-quote-mark',
  onboardStepNum: 'type-onboard-step-num',
  onboardStepTitle: 'type-onboard-step-title',
  onboardStepDesc: 'type-onboard-step-desc',
  onboardPill: 'type-onboard-pill',
  onboardEmphasis: 'type-onboard-emphasis',
} as const;
