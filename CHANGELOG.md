# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 4.1.0 (2020-03-12)


### Bug Fixes

* **opentelemetry:** upgrade to 0.4.0 ([#158](https://github.com/VilledeMontreal/workit/issues/158)) ([4fca936](https://github.com/VilledeMontreal/workit/commit/4fca93608cb8ecb0242f7d8fe406b14bec0dc80b)), closes [#113](https://github.com/VilledeMontreal/workit/issues/113) [#157](https://github.com/VilledeMontreal/workit/issues/157)
* correct url in getting-started readme ([#116](https://github.com/VilledeMontreal/workit/issues/116)) ([7c4897c](https://github.com/VilledeMontreal/workit/commit/7c4897c6ec888ccf2ea132ce3440e0a0e19c37a7)), closes [#117](https://github.com/VilledeMontreal/workit/issues/117)
* remove camunda-xx-client-js in workit-camunda ([#121](https://github.com/VilledeMontreal/workit/issues/121)) ([7d85f5c](https://github.com/VilledeMontreal/workit/commit/7d85f5cf59b91c5aef6ecd50d7a114866029c390)), closes [#120](https://github.com/VilledeMontreal/workit/issues/120)
* **package:** update camunda-external-task-client-js to version 1.2.0 ([a2911b2](https://github.com/VilledeMontreal/workit/commit/a2911b2c4015fb2edc213960677deab9df9be04f))
* **package:** update config to version 3.2.0 ([0889dee](https://github.com/VilledeMontreal/workit/commit/0889dee045a89b54aa3244b9a163297304e11a4d))
* **package:** update form-data to version 2.5.0 ([13a332a](https://github.com/VilledeMontreal/workit/commit/13a332aaf7ef550379701b8e10d9f8c129dfe939))
* **package:** update opentracing to version 0.14.4 ([845f55e](https://github.com/VilledeMontreal/workit/commit/845f55e69722e3bdf179f5c4e053f1a9b705e0bc))
* **package:** update workit-camunda to version 3.1.0 ([36bd15c](https://github.com/VilledeMontreal/workit/commit/36bd15c2dfd04509595db82baba10fe4f4593ba6))
* **worker-cli:** remove maxTasks in template ([0541f64](https://github.com/VilledeMontreal/workit/commit/0541f64b91085f2f1a05b9f8e7e556b911690831))
* remove opentracing refs ([e5a32cc](https://github.com/VilledeMontreal/workit/commit/e5a32ccb2e001a92bcfa152a71360a3e4106dd56))
* **workit-camunda:** fix semver for zeebe-node ([d8ae65b](https://github.com/VilledeMontreal/workit/commit/d8ae65b9710ef6d7ba309ff4c9d0f5b586a1ee0b))
* **workit-camunda:** regression from zeebe-node 2.3.0 ([07561c1](https://github.com/VilledeMontreal/workit/commit/07561c1ddcc566db5b3ab4fdce641cf18f8fa913))
* **zeebe:** docker-compose volumes for dev-config ([5187e0a](https://github.com/VilledeMontreal/workit/commit/5187e0a68844bff3e313a744db23be5974dc54d5))
* remove console.log ([2467f23](https://github.com/VilledeMontreal/workit/commit/2467f2347f302443c1917470d76958f3b5753890))


### Features

* **zeebe:** upgrade to 0.22.1 ([#161](https://github.com/VilledeMontreal/workit/issues/161)) ([662d36f](https://github.com/VilledeMontreal/workit/commit/662d36f68c864c6f2570f6ff2e4f711eb7d4245b)), closes [#82](https://github.com/VilledeMontreal/workit/issues/82) [#85](https://github.com/VilledeMontreal/workit/issues/85)
* add automatic tracing ([27913ba](https://github.com/VilledeMontreal/workit/commit/27913bada60ae2b07e38843ec2085db95a5b7646))
* add subscription options for task filtering ([#141](https://github.com/VilledeMontreal/workit/issues/141)) ([a3d6f97](https://github.com/VilledeMontreal/workit/commit/a3d6f9769723575ab7122070283a546cf4070e7a))
* export Interceptors class to ease custom process handler impl. ([#143](https://github.com/VilledeMontreal/workit/issues/143)) ([b95d882](https://github.com/VilledeMontreal/workit/commit/b95d882581a33a5b8df0b5a64c3c616aa6dd7b09)), closes [#144](https://github.com/VilledeMontreal/workit/issues/144)
* **opentelemetry:** make it compatible with 0.3.3 ([#129](https://github.com/VilledeMontreal/workit/issues/129)) ([2edf7e3](https://github.com/VilledeMontreal/workit/commit/2edf7e38a2bd5ad56d775c27e220a90c230f57f4))
* improve tsconfig ([#106](https://github.com/VilledeMontreal/workit/issues/106)) ([77fb10c](https://github.com/VilledeMontreal/workit/commit/77fb10cee7abe9340d88d301a4066636f7898887)), closes [#105](https://github.com/VilledeMontreal/workit/issues/105)
* **opentelemetry:** switch to opentelemetry ([#110](https://github.com/VilledeMontreal/workit/issues/110)) ([c00356a](https://github.com/VilledeMontreal/workit/commit/c00356aa4d792cfc310825d526f40f7eccb33844))
* init packages with lerna ([426250c](https://github.com/VilledeMontreal/workit/commit/426250cfd57d6103837661ddcb3e6b87d1af5bb0))
* splitting workit-camunda ([8825eae](https://github.com/VilledeMontreal/workit/commit/8825eaef9b66f86f3c21de4bc8ba093c75779fb4)), closes [#99](https://github.com/VilledeMontreal/workit/issues/99)
* **worker-cli:** improve init template ([352d03e](https://github.com/VilledeMontreal/workit/commit/352d03ee907266da443e5bf49b14e8392c97afcf)), closes [#43](https://github.com/VilledeMontreal/workit/issues/43)
* **worker-cli:** update deps and init template ([71d4106](https://github.com/VilledeMontreal/workit/commit/71d41063e9fbb8edf12b8aff712c56c254fa9b6d))
* **workit-camunda:** update to zeebe 0.19.0 ([9a5826b](https://github.com/VilledeMontreal/workit/commit/9a5826b654f0d9654a1b5019ad23e278b0254e1d))
* **zeebe:** add 0.20.0 compatibility ([e85d4c1](https://github.com/VilledeMontreal/workit/commit/e85d4c10c70cfffdbdc5feddef00601031f68e84))
* add pagination to getWorkflows method ([22c0c86](https://github.com/VilledeMontreal/workit/commit/22c0c86801a38af9a306fe6236d57ec68c872ec7))
* improve generic types ([15c4011](https://github.com/VilledeMontreal/workit/commit/15c401129afef1253db9b4d282f52725e2b833fa))
* **zeebe:** update to 2.3.0 ([00eb30d](https://github.com/VilledeMontreal/workit/commit/00eb30dbbe6dd0020477f618e4d05c5826c5f4bc))





## 4.0.4 (2020-02-05)

#### :rocket: (Enhancement)

*    [#141](https://github.com/VilledeMontreal/workit/pull/141) Add subscription options for task filtering through 'camunda-external-task-client-js' ([@sylvain-bouchard](https://github.com/sylvain-bouchard))

#### :wrench: Core

*    [#143](https://github.com/VilledeMontreal/workit/pull/143) Export 'Interceptors' class to ease custom process handler implementation ([@sylvain-bouchard](https://github.com/sylvain-bouchard))

## workit-camunda@4.0.2 (2019-12-31)

#### :boom: Breaking Change
*   [#89](https://github.com/VilledeMontreal/workit/pull/89) refactor(workit): add workit-types package
    - rename IPropertiesBase => IWorkflowPropsBase
    - rename Properties => IWorkflowProps
    - Now in `IMessage`, `properties` is not of type IWorkflowProps<TProps> but just it's just a generic so you need to tell `IMessage<MyCustomBody, IWorkflowProps<MyCustomProps>>` instead of `IMessage<MyCustomBody, MyCustomProps>`. The reason is that IMessage is a generic interface and `IWorkflowProps` is for Camunda usage. Workit can be used with rabbitmq, aws sqs etc.. If we develop clients like we did with Zeebe and Camunda BPM.
*   [#110](https://github.com/VilledeMontreal/workit/pull/110) feat(opentelemetry): switch to opentelemetry
    - Replace Opencensus to OpenTelemetry

#### :bug: (Bug Fix)
    - Remove Opencensus deps

#### :books: (Refine Doc)
    - Move samples folder to examples folder at root level
    - Add getting started folder

## workit-cli@0.3.1 (2019-09-14)

### :sparkles: (Feature)
*   [#43](https://github.com/VilledeMontreal/workit/issues/43) feat(worker-cli): improve init template

## workit-camunda@3.2.0 (2019-09-14)

#### :bug: (Bug Fix)
*   [#83](https://github.com/VilledeMontreal/workit/pull/83) fix(workit-camunda): froze zeebe-node to 0.20.1

## workit-camunda@3.1.0 (2019-08-21)

Note: Increase the coverage. Add circleci for integration tests.

#### :books: (Refine Doc)
*   [#58](https://github.com/VilledeMontreal/workit/pull/58) docs: improving getting started documentation ([@poolfoot](https://github.com/poolfoot))

#### :sparkles: (Feature)
*   [#60](https://github.com/VilledeMontreal/workit/pull/60) feat: add automatic tracing. **BREAKING CHANGE** We removed opentracing for using opencensus.

## workit-camunda@2.2.0 (2019-07-17)

### :sparkles: (Feature)
*   [#55](https://github.com/VilledeMontreal/workit/pull/55) feat(zeebe): add 0.20.0 compatibility

## workit-camunda@2.1.0 (2019-07-16)

### :books: (Refine Doc)
*   [#45](https://github.com/VilledeMontreal/workit/pull/45) docs(readme): #35 add version matrix ([@jperron-ca](https://github.com/jperron-ca))

### :sparkles: (Feature)
*   [#41](https://github.com/VilledeMontreal/workit/pull/41) feat(workit-camunda): update to zeebe 0.19.0

## workit-camunda@2.0.1 (2019-07-04)

### :bug: (Bug Fix)

*   [#42](https://github.com/VilledeMontreal/workit/pull/42) fix(workit-camunda): regression from zeebe-node 2.3.0

### :books: (Refine Doc)
*   [#33](https://github.com/VilledeMontreal/workit/pull/33) docs(readme): minor spelling fix ([@jwulf](https://github.com/jwulf))

## workit-cli@0.0.11 (2019-06-30)

### :wrench: Core
*   [#29](https://github.com/VilledeMontreal/workit/pull/29) feat(worker-cli): update deps and init template

## workit-cli@0.0.10 (2019-06-30)

:rocket: (Enhancement)
*   [#26](https://github.com/VilledeMontreal/workit/pull/26) fix: remove console.log

### :books: (Refine Doc)
*   [#18](https://github.com/VilledeMontreal/workit/pull/18) [#19](https://github.com/VilledeMontreal/workit/pull/19) docs: add readme translation and fix broken link
*   [#21](https://github.com/VilledeMontreal/workit/pull/21) [#16](https://github.com/VilledeMontreal/workit/pull/16) docs: typos and add traductions
*   [#11](https://github.com/VilledeMontreal/workit/pull/11) chore(markdown): add linter for *.md files

## workit-camunda@2.0.0 (2019-06-30)

### :books: (Refine Doc)
*   [#18](https://github.com/VilledeMontreal/workit/pull/18) [#19](https://github.com/VilledeMontreal/workit/pull/19) docs: add readme translation and fix broken link
*   [#21](https://github.com/VilledeMontreal/workit/pull/21) [#16](https://github.com/VilledeMontreal/workit/pull/16) docs: typos and add traductions
*   [#11](https://github.com/VilledeMontreal/workit/pull/11) chore(markdown): add linter for *.md files

### :boom: Breaking Change
*   Add pagination to `getWorkflows` method. *BREAKING CHANGE* : the return type is `IPagination<IWorkflow>`
