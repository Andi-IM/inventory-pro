# 1.0.0 (2026-06-08)


### Bug Fixes

* **ci:** add prisma generate and resolve implicit any types in authorization ([dc8e1f7](https://github.com/Andi-IM/inventory-pro/commit/dc8e1f76209df6b520735f3e2ba595fda8e03562))
* **ci:** increase NEON_AUTH_COOKIE_SECRET length for build ([c1806e4](https://github.com/Andi-IM/inventory-pro/commit/c1806e453fbaa128a7a1d70b1b94387834e98b9e))
* **ci:** provide dummy DATABASE_URL for tests and build steps ([b904c25](https://github.com/Andi-IM/inventory-pro/commit/b904c2572582428b678b06a42e3ceac14bdd510e))
* **ci:** provide dummy NEON_AUTH environment variables for build ([48b81e6](https://github.com/Andi-IM/inventory-pro/commit/48b81e63d2addac11a7c7f02469aa6359f0e0aa0))
* **types:** add missing orQueries and taskId to SearchTasksFilter ([66a250d](https://github.com/Andi-IM/inventory-pro/commit/66a250d30f5badc27e0c7b70ffc5bbd6c7ffda2e))
* **types:** establish full TypeScript compliance for production code ([7c40b55](https://github.com/Andi-IM/inventory-pro/commit/7c40b550c8515ecafd516acc87571e254595e5b4))


### Features

* add CI/CD pipeline workflow for building, testing, and semantic release ([d41f735](https://github.com/Andi-IM/inventory-pro/commit/d41f735f4d50c0ffba5011b24fae2899541ab20d))
* add GitHub Actions CI/CD pipeline for building, testing, and automated releases ([42e0fae](https://github.com/Andi-IM/inventory-pro/commit/42e0faec97a951870a3d3ffb5fdebb2966c73706))
* **admin:** flatten admin features and update ADR verification results ([7b1e4ce](https://github.com/Andi-IM/inventory-pro/commit/7b1e4ce74e6b7128882099a32d6c4c2bd208bb84))
* adopt conventional commits and automated semantic versioning (ADR 0008) ([0b398d0](https://github.com/Andi-IM/inventory-pro/commit/0b398d0481ee8d9f7099466fbf2838b65e394a5e))
* **auth:** implement Redis caching for feature flags ([45217f0](https://github.com/Andi-IM/inventory-pro/commit/45217f07c2d658cb6691c09cbf3fd88975737f0c))
* bootstrap Next.js app with authentication via Neon Auth and Camunda integration documentation ([f9a438c](https://github.com/Andi-IM/inventory-pro/commit/f9a438cc01fc0eab1cc5721d18655af4ad0b9205))
* implement authentication pages with sign-in and sign-up flows, add E2E tests, and update documentation. ([92d6ab1](https://github.com/Andi-IM/inventory-pro/commit/92d6ab1d289d5e85bac3ff5dda1834e327e73a5c))
* implement Camunda 7 REST client with TypeScript and configure Vitest for testing ([0ca58e4](https://github.com/Andi-IM/inventory-pro/commit/0ca58e43fbfb5cf110e9286fcd9b8abd2b73888c))
* implement dynamic role-based authorization and runtime feature flag management ([78428a6](https://github.com/Andi-IM/inventory-pro/commit/78428a6ad22f22924f0f1d3d3881497bdbb56624))
* implement Neon Auth authentication with custom sign-in/up flows and architectural documentation ([a3d5ed6](https://github.com/Andi-IM/inventory-pro/commit/a3d5ed622591432773c0ad3874133a924461480a))
* implement Supabase authentication provider and CI/CD workflow pipeline ([9c273c0](https://github.com/Andi-IM/inventory-pro/commit/9c273c0708665af5dbad523e4b907332cdff605f))
* initialize project with Next.js App Router, Bootstrap integration, and BPMN skill framework. ([314ee53](https://github.com/Andi-IM/inventory-pro/commit/314ee5392b8d3c56c5253aecce18ef4cbc3deaff))
* integrate Playwright for E2E testing with configuration and initial auth test suite ([b21f276](https://github.com/Andi-IM/inventory-pro/commit/b21f276f0ef3c53f51bce7d65185a5ee96ddb449))
* **roles:** replace datalist with SearchableCombobox client component ([83e7e55](https://github.com/Andi-IM/inventory-pro/commit/83e7e55d015b6deb9027473107b0651f61a0e6dc))
* **roles:** searchable combobox for role and permission inputs ([51ff9df](https://github.com/Andi-IM/inventory-pro/commit/51ff9dfee9dbe9b7fca7f765d544ddb507d39bd1))
* **security:** implement identity-bound workflow integration (ADR 0007) ([a5ef7bb](https://github.com/Andi-IM/inventory-pro/commit/a5ef7bba8369cfb553b3eb9e13df900e7251eb5e))
* **tools:** implement tool management module per ADR 0009 ([308589d](https://github.com/Andi-IM/inventory-pro/commit/308589d313f26e1ecbdb0fbbd914cdca08067afa))
* **tools:** migrate tools to prisma and simplify home navigation ([d2a4144](https://github.com/Andi-IM/inventory-pro/commit/d2a414499d9b079c6c486c02ba933bae39cfc831))
* **users:** dynamic role dropdown from DB via getAvailableRoles() ([bc18cb9](https://github.com/Andi-IM/inventory-pro/commit/bc18cb9e5796be9ff9e33e324abb5e2ac7613975))


### Performance Improvements

* **auth:** cache getUserRole in Redis to eliminate DB queries ([16023e5](https://github.com/Andi-IM/inventory-pro/commit/16023e5def2a6114366790df19810cd7726bfa0e))
* **auth:** eliminate query waterfall in DashboardLayout ([57d652e](https://github.com/Andi-IM/inventory-pro/commit/57d652e867d088ac0ce2de805f495db2eeb1e061))
* **auth:** implement stateless JWT authorization cookie ([92db575](https://github.com/Andi-IM/inventory-pro/commit/92db575ac222adf6dd60e41fdb9dc0e601d048d1))
* **cache:** implement Next.js unstable_cache for database queries ([8ef4913](https://github.com/Andi-IM/inventory-pro/commit/8ef49135988f2a47c81fac78483334d7e0502c0d))
