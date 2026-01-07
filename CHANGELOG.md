# Changelog

All notable changes to @wazapin/wa-sdk will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-01-06

### Added

- **Media URL in Webhooks (v23.0+):** Added optional `url` field to `WebhookMedia` interface for direct media download URLs
- **Voice Transcription (v23.0+):** Added `voice` and `text` fields to audio messages for automatic voice-to-text transcription
- **`played` Status (v20.0+):** Extended `WebhookStatus.status` union to include `'played'` for media playback tracking
- **Auto-Fallback Helper:** New `getMediaUrl()` function in `messaging` module for automatic URL optimization

### Performance

- **100-200ms faster** media rendering for v23.0+ users (eliminates API roundtrip)
- **Reduced API costs** - one less API call per media message (v23.0+)
- **Better UX** - immediate media availability, realtime experience

### Migration

**No breaking changes** - all enhancements are additive and backward compatible.

```typescript
// Before v2.2.0
const url = await client.media.getUrl(media.id);

// After v2.2.0 (auto-optimized)
import { getMediaUrl } from '@wazapin/wa-sdk';
const url = await getMediaUrl(media, client);
```

### Documentation

- Added Phase 2 features section to README
- Added E2E scenario tests for real-world usage patterns
- Added integration tests for auto-fallback logic

---

## [2.1.0] - 2026-01-06

### Added

#### 🔔 Enhanced Webhook Events
- **Message Reactions** - Parse emoji reactions to messages with full event data
- **Session End Events** - Detect when 24-hour messaging window expires
- **Cart Update Events** - Track shopping cart modifications (add, remove, update, clear)
- **Commerce Checkout Events** - Monitor checkout initiation and status changes
- **Account Update Events** - Handle AD_ACCOUNT_LINKED and PAYMENT_METHOD_SETUP events
- Complete type safety with discriminated unions for all webhook event types

#### 📞 Phone Number Management
- **Block/Unblock API** - Block spam numbers and manage blocked list
  - `blockPhoneNumber()` - Prevent numbers from contacting your business
  - `unblockPhoneNumber()` - Remove numbers from block list
- **Calling Settings API** - Configure voice calling features per phone number
  - `getCallingSettings()` - Retrieve current calling configuration
  - `updateCallingSettings()` - Enable/disable calling and set webhook URL
- **Compliance Info API** - Access regional regulatory requirements
  - `getComplianceInfo()` - Get WABA-level compliance data
  - `getPhoneComplianceInfo()` - Get phone-level compliance information

#### 🔄 Flow Management
- **Flow Deprecation** - Complete flow lifecycle management
  - `flows.deprecate()` - Mark flows as deprecated while allowing existing sessions to complete
  - Includes deprecation timestamp for audit trail

### Testing
- Added 34 comprehensive test cases for all new features
- 100% test coverage for new webhook event parsers
- Full integration tests for phone management APIs
- TDD approach followed for all implementations

### Documentation
- Updated README with examples for all 5 new features
- Complete JSDoc comments for all new methods
- Added webhook event handling examples
- Phone management usage patterns documented

### Technical
- Zero breaking changes (minor version bump from 2.0.0)
- Full TypeScript type safety for all new APIs
- Consistent with existing SDK patterns and architecture
- Follows Graph API v24.0 specifications

### Migration
No migration required - all changes are additive with no breaking changes.
New features are available immediately after upgrade.

---

## [2.0.0] - 2026-01-06

### 🚀 Added

- **Pricing Analytics API** - Track message costs with volume tier information
  - `getPricingAnalytics()` method with full parameter support
  - Volume tier tracking (format: "0:1000" or "1000:MAX")
  - Support for all pricing dimensions and filters
- **Template Analytics API** - Monitor individual template performance
  - `getTemplateAnalytics()` method for tracking sent/delivered/read/clicked metrics
  - Click tracking for URL buttons and quick-reply buttons
  - Cost metrics per template (amount spent, cost per delivery, cost per click)
  - Max 90-day lookback window
- **Template Group Analytics API** - Aggregated metrics for template groups
  - `getTemplateGroupAnalytics()` method with timezone support
  - Aggregated sent/delivered/read/clicked metrics
  - Support for up to 10 template groups per query

### 💥 BREAKING CHANGES

- **Removed:** `getConversationAnalytics()` legacy method using query parameters
  - **Migration:** Use renamed `getConversationAnalytics()` (formerly `getConversationAnalyticsV2`) with `granularity` parameter
- **Removed:** `getAnalytics()` alias method
  - **Migration:** Use `getConversationAnalytics()` directly
- **Renamed:** `getConversationAnalyticsV2()` → `getConversationAnalytics()`
  - **Migration:** Simple find-replace, functionality unchanged
- **Renamed:** `getMessageAnalytics()` → `getMessagingAnalytics()`
  - **Migration:** Rename method call and add required `granularity` parameter
- **Required Parameter:** All analytics methods now require `granularity` parameter
  - **Migration:** Add `granularity: 'DAILY' | 'HALF_HOUR' | 'MONTHLY'` to all analytics calls
- **Validation:** Added lookback window validation
  - Messaging/conversation/pricing: Max 1 year lookback (enforced from Dec 1, 2025)
  - Template/template group: Max 90 days lookback
  - **Migration:** Ensure date ranges comply with new limits

### 🔧 Changed

- Analytics module now 100% Graph API compliant
- Improved error messages for validation failures
- Better handling of cost metrics for Solution Partner billing
- Clearer error messages for EU/UK/Japan regional limitations
- All analytics responses use consistent typing with strict nullability

### 📖 Documentation

- Added comprehensive analytics examples to README
- Added migration guide (`docs/MIGRATION_V2.md`)
- Documented all analytics limitations and regional restrictions
- Added inline JSDoc for all new methods with examples

### 🧪 Testing

- Comprehensive unit test coverage for all 5 analytics endpoints
- Validation testing for parameter limits
- Error case testing for regional limitations

### 📦 Dependencies

No changes to dependencies

### Migration Guide

See [`docs/MIGRATION_V2.md`](./docs/MIGRATION_V2.md) for complete migration instructions.

**Quick Summary:**
```typescript
// v1.x
await client.analytics.getMessageAnalytics({ start, end });
await client.analytics.getConversationAnalyticsV2({ start, end, granularity: 'DAILY' });

// v2.0
await client.analytics.getMessagingAnalytics({ start, end, granularity: 'DAY' });
await client.analytics.getConversationAnalytics({ start, end, granularity: 'DAILY' });
```

---

## [Unreleased]

### Added

- **WhatsApp Flows API** - Complete implementation for creating and managing interactive flows
  - `flows.create()` - Create new flows with categories and endpoints
  - `flows.list()` - List all flows for a WABA
  - `flows.get()` - Get flow details with health status and validation
  - `flows.update()` - Update flow metadata and endpoints
  - `flows.delete()` - Delete draft flows
  - `flows.publish()` - Publish flows (makes them immutable)
  - `flows.deprecate()` - Deprecate published flows
  - `flows.uploadJSON()` - Upload Flow JSON definitions with validation
  - `flows.listAssets()` - List and get Flow JSON download URLs
  - `flows.getPreview()` - Get preview URLs for testing flows
  - `flows.migrate()` - Migrate flows between WABAs
  - `flows.getAnalytics()` - Get flow performance metrics (5 types)
  - `flows.send()` - Send flow messages to users (draft/published)
- **Flow Analytics Metrics**
  - `ENDPOINT_REQUEST_COUNT` - Track endpoint call volume
  - `ENDPOINT_REQUEST_ERROR` - Monitor endpoint errors
  - `ENDPOINT_REQUEST_ERROR_RATE` - Calculate error rates
  - `ENDPOINT_REQUEST_LATENCY_SECONDS_CEIL` - Monitor latency
  - `ENDPOINT_AVAILABILITY` - Check endpoint health
- **HTTP Client Enhancements**
  - Added `postMultipart()` method for form-data file uploads
  - Added query parameters support to `get()` method
  - Support for FormData uploads (Flow JSON files)
- **New TypeScript Interfaces** - 30+ Flow-related types
  - `FlowDetails`, `CreateFlowParams`, `UpdateFlowParams`
  - `FlowValidationError`, `FlowHealthStatus`, `FlowPreview`
  - `MigrateFlowsParams`, `FlowMigrationResult`
  - `FlowAnalyticsParams`, `FlowAnalyticsResponse`
  - `SendFlowParams`, `FlowActionPayload`
- **Comprehensive Testing** - 26 new tests for Flows API
  - Flow CRUD operations (create, read, update, delete)
  - Flow lifecycle (publish, deprecate, clone, migrate)
  - Flow assets (upload JSON, list assets, get preview)
  - Flow analytics (all 5 metric types)
  - Flow messaging (send draft/published flows)
  - Total: 491 tests passing (100% success rate)

### Documentation

- Added complete "WhatsApp Flows Management" section in README
  - Flow creation and publishing workflows
  - Flow management examples (update, deprecate, delete)
  - Clone and migration guide
  - Analytics monitoring with all metric types
  - Asset management (upload JSON, get download URLs)
- Added "Flow Messages" section in messaging docs
  - Send published flows by ID
  - Send draft flows by name for testing
  - Flow action payloads and navigation
  - Flow tokens for session management

### Technical

- Zero breaking changes - fully backward compatible
- Complete JSDoc documentation with examples
- TypeScript build successful with no errors

### Previous Additions

- **Embedded Signup API** - Complete implementation for WhatsApp Business onboarding
  - `embeddedSignup.debugToken()` - Debug OAuth token to get shared WABA IDs
  - `embeddedSignup.listSharedWABAs()` - List client WABAs shared via embedded signup
  - `embeddedSignup.listOwnedWABAs()` - List owned/client WABAs with filtering and sorting
  - `embeddedSignup.getWABAInfo()` - Get detailed WABA information with field selection
  - `embeddedSignup.getAssignedUsers()` - List users assigned to a WABA
  - `embeddedSignup.addSystemUser()` - Add system user with MANAGE/DEVELOP permissions
  - `embeddedSignup.listSystemUsers()` - Get business system users
  - `embeddedSignup.getExtendedCredits()` - Get credit lines for billing
  - `embeddedSignup.attachCreditLine()` - Share credit line with client WABA
  - `embeddedSignup.verifyCreditSharing()` - Verify credit sharing was successful
  - `embeddedSignup.getCreditSharingRecord()` - Get credit sharing record details
  - `embeddedSignup.revokeCreditSharing()` - Remove credit line access
  - `embeddedSignup.subscribeToWABA()` - Subscribe app to WABA webhooks
  - `embeddedSignup.listSubscriptions()` - List all webhook subscriptions
  - `embeddedSignup.unsubscribeFromWABA()` - Remove webhook subscription
  - `embeddedSignup.overrideCallbackURL()` - Set alternate webhook URL per WABA
  - `embeddedSignup.listPhoneNumbers()` - List phone numbers with filtering
  - `embeddedSignup.getPhoneNumberCertificate()` - Get display name certificates
  - `embeddedSignup.listMessageTemplates()` - Get pre-approved templates
  - `embeddedSignup.getTemplateNamespace()` - Get template namespace
- **New TypeScript Interfaces** - Complete type safety for embedded signup
  - `DebugTokenResponse`, `WABAInfo`, `FilterWABAOptions`
  - `SystemUser`, `AssignedUser`, `AddSystemUserParams`
  - `AttachCreditLineParams`, `AllocationConfigResponse`, `CreditSharingRecord`
  - `OverrideCallbackParams`, `WABASubscription`, `PhoneNumberCertificate`
- **Comprehensive Tests** - 21 unit tests covering all embedded signup functionality
  - WABA management (debug token, list, filter, get info)
  - System users (list, add, get assigned)
  - Credit line management (get, attach, verify, revoke)
  - Webhook subscriptions (subscribe, list, unsubscribe, override)
  - Phone numbers and templates (list, certificates, namespace)

### Technical

- All 439 tests passing (418 existing + 21 new)
- Zero breaking changes - fully backward compatible
- Complete JSDoc documentation with examples
- TypeScript build successful with no errors

## [1.1.0] - 2025-11-22

### Added

- **Business Accounts API** - New `businessAccounts` namespace for managing business accounts and billing
  - `getBusinessAccount()` - Get business account details with custom fields
  - `listExtendedCredits()` - List credit lines for WhatsApp billing
  - `getCreditBalance()` - Convenience method to check available credit
- **Enhanced Analytics API** - Advanced conversation analytics with multi-dimensional breakdowns
  - `getConversationAnalytics()` - Detailed conversation analytics with dimensions support
  - Support for conversation types: `free_tier`, `marketing`, `utility`, `service`, `authentication`, etc.
  - Support for conversation directions: `business_initiated`, `user_initiated`
  - Multi-dimensional grouping (up to 2 dimensions): type, direction, country, phone
  - Cost and conversation count metrics
- **New Type Definitions**
  - `BusinessAccount`, `ExtendedCredit` types for business management
  - `ConversationType`, `ConversationDirection`, `ConversationDimension` for analytics
  - `ConversationAnalyticsParams`, `ConversationAnalyticsResponse` for detailed analytics
- **Configuration Options**
  - Added optional `wabaId` field to `WhatsAppClientConfig` for templates and analytics
  - Added optional `businessAccountId` field for business account operations
  - Added optional `appId` field for future resumable upload support
- **Documentation**
  - Added `IMPLEMENTATION-SUMMARY.md` with detailed usage guide and examples
  - Added comprehensive JSDoc comments with usage examples
  - Added 10 new unit tests for Business Accounts API (total: 418 tests)

### Changed

- Upgraded `analytics.getConversationAnalytics()` with enhanced features including dimensions support and multi-dimensional breakdowns

### Technical

- All 418 tests passing with zero failures
- Zero breaking changes - fully backward compatible
- TypeScript build successful with no errors

### Changed

- **License changed from MIT to Apache 2.0 with additional conditions** (2025-11-22)
  - Added LOGO and copyright protection for frontend components
  - Added usage notification requirement for all projects
  - Contact hello@wazapin.com for licensing inquiries

### Added

#### SDK Branding & Developer Experience (2025-11-22)

- **HTTP Headers Branding** - Automatic SDK identification in all API requests
  - User-Agent header: RFC 9110 compliant format `wazapin-wa/1.0.0 (Node/v18.17.0; linux; x64)`
  - Custom SDK version header: `Wazapin-SDK-Version: 1.0.0`
  - Auto-detect SDK version from package.json
  - Auto-detect platform info (Node version, OS, architecture)
  - Helps Meta track SDK usage for better support and analytics
- **Structured Logger** - Production-ready logging with branded format
  - Branded log format: `[wazapin-wa] [LEVEL] Message`
  - Log levels: debug, info, warn, error (default: info)
  - Optional timestamps: `[2025-11-22T10:19:49.423Z] [wazapin-wa] [INFO] Message`
  - Automatic sensitive data redaction (tokens, passwords, secrets, API keys)
  - Custom handler support for integration with external logging systems
  - Zero performance impact when disabled
  - 41 comprehensive tests (version utilities + logger)

#### P0 Critical Features (2025-11-22)

- **Business Profile Management** - Full business profile management
  - Get business profile information (all fields or specific)
  - Update business profile (about, address, description, email, websites, vertical, profile picture)
  - 17 business categories/verticals supported
  - Character limits validation (about 139, address 256, description 512, email 128)
  - 16 comprehensive tests
- **Interactive CTA URL Button Messages** - Send messages with call-to-action URL buttons
  - Send interactive CTA messages with clean URL presentation
  - Support for text, image, video, and document headers
  - Optional footer text
  - Character limits validation (header 60, body 1024, button 20, footer 60)
  - 12 comprehensive tests
- **Conversational Components** - Configure in-chat interaction features
  - Enable/disable welcome message notifications
  - Configure ice breakers/prompts (max 4, 80 chars each)
  - Configure slash commands (max 30, name 32 chars, desc 256 chars)
  - Get current configuration
  - Full validation with character limits
  - 16 comprehensive tests

#### Account Management

- Messaging Limits feature (2025-11-22)
- Account namespace to WhatsAppClient
- Support for all messaging limit tiers (TIER_250, TIER_2000, TIER_10K, TIER_100K, TIER_UNLIMITED)

#### Documentation

- Comprehensive documentation reorganization (2025-11-22)
- `docs/` folder with focused documentation (CONTRIBUTING.md, API_VERIFICATION.md, PROJECT_STATUS.md)

#### Webhooks

- Unsupported messages webhook support (2025-11-21)
  - `unsupported` message type for messages not supported by Cloud API
  - `errors` field in `WebhookMessage` for error code 131051 and other errors
  - `unsupported.type` field to indicate unsupported message type (edit/poll/button/etc)
  - `identityKeyHash` optional field in `WebhookContact` for identity change check

### Documentation

- Reorganized documentation from 11 files to 5 core files (61% reduction)
- Updated API verification to 24 pages verified (100% success rate)
- Improved documentation navigation and clarity

### Tests

- **Total**: 408 tests (up from 367)
- **New Tests**: 41 tests for SDK branding
  - Version utilities: 16 tests
  - Logger: 25 tests
- **Previous**: 44 tests for P0 features
  - Business Profile: 16 tests
  - Interactive CTA: 12 tests
  - Conversational Components: 16 tests
- **Coverage**: Maintained high coverage
- **All tests passing**: ✅

### Verified

- 27 WhatsApp API documentation pages verified with 100% compliance (2025-11-22)
- All implemented features match Meta's official API specifications via Firecrawl verification
- Business Profile API verified
- Interactive CTA URL Messages API verified
- Conversational Components API verified

## [1.0.0] - 2025-11-21

### Added

- Initial SDK release
- Core messaging features:
  - Text messages with preview URL support
  - Media messages (image, video, audio, document, sticker)
  - Interactive messages (buttons, lists)
  - Template messages with all parameter types
  - Location messages
  - Contact messages (full vCard support)
  - Reaction messages
  - Mark as read
- Media operations:
  - Upload media (Buffer and Blob support)
  - Download media with metadata
  - File size validation per media type
- Webhook operations:
  - Parse webhook payloads
  - Verify webhook signatures (HMAC SHA256)
- HTTP Client with retry logic and exponential backoff
- Zod-based validation with three modes (off, relaxed, strict)
- TypeScript types for all operations
- Comprehensive error handling (5 error types)
- 171 tests with 88% coverage
- Complete documentation (README, guides)
- ESM module support for Node.js, Deno, Bun, and browsers

### Verified

- 18 Meta WhatsApp API documentation pages verified
- 100% API compliance for all implemented features

## [0.1.0] - 2025-11-15

### Added

- Project initialization
- Basic project structure
- TypeScript configuration
- ESLint setup
- Vitest testing framework

---

## Upgrade Guide

### Upgrading to 1.0.0

No breaking changes from initial release.

---

## Links

- [GitHub Repository](https://github.com/wazapin/wa-sdk)
- [Documentation](./README.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [API Verification](./docs/API_VERIFICATION.md)
- [Project Status](./docs/PROJECT_STATUS.md)
