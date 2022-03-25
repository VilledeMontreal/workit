# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.2](https://github.com/VilledeMontreal/workit/compare/v5.0.1...v5.0.2) (2022-03-25)

**Note:** Version bump only for package root





## [5.0.1](https://github.com/VilledeMontreal/workit/compare/v5.0.0...v5.0.1) (2022-02-18)
#### :books: (Refine Doc)
* [#225](https://github.com/VilledeMontreal/workit/pull/225) ci: update deps and adjust types

## [5.0.0](https://github.com/VilledeMontreal/workit/compare/v4.2.9...v5.0.0) (2021-11-26)

### Features :boom: Breaking Change

* **opentelemetry:** update sdk to 1.0.0 ([#224](https://github.com/VilledeMontreal/workit/issues/224)) ([e65ee4a](https://github.com/VilledeMontreal/workit/commit/e65ee4a6dbc67b8f22ac67e09122b28c04756034))


## [4.2.9](https://github.com/VilledeMontreal/workit/compare/v4.2.5...v4.2.9) (2021-07-27)

### Bug Fixes

* prettier on workit-cli package ([#223](https://github.com/VilledeMontreal/workit/issues/223)) ([383de6d](https://github.com/VilledeMontreal/workit/commit/383de6d3890c43ca84cb54e8c20b2680447c7839))

#### :rocket: (Enhancement) (from tag v4.2.7)
* publish under @villedemontreal scope

### Features (from tag v4.2.5)

* add plugin system to workit ([#216](https://github.com/VilledeMontreal/workit/issues/216)) ([3d28cab](https://github.com/VilledeMontreal/workit/commit/3d28cab7265948f479228e3142cd341c57b6531a) (from alpha 4.2.3-alpha.0)
* update dependencies


## [4.2.3-alpha.0](https://github.com/VilledeMontreal/workit/compare/v4.2.2...v4.2.3-alpha.0) (2020-11-27)


### Features

* add plugin system to workit ([#216](https://github.com/VilledeMontreal/workit/issues/216)) ([3d28cab](https://github.com/VilledeMontreal/workit/commit/3d28cab7265948f479228e3142cd341c57b6531a))





## [4.2.2](https://github.com/VilledeMontreal/workit/compare/v4.2.1...v4.2.2) (2020-09-23)

**Note:** Version bump only for package root






## 4.2.1 (2020-09-23)

#### :bug: (Bug Fix)
* [#213](https://github.com/VilledeMontreal/workit/pull/213) fix: retryTimeoutInMs → retryTimeout ([@sylvain-bouchard](https://github.com/sylvain-bouchard))

#### Committers: 1
- Sylvain Bouchard ([@sylvain-bouchard](https://github.com/sylvain-bouchard))

## 4.2.0 (2020-09-15)

#### :rocket: (Enhancement)
* [#212](https://github.com/VilledeMontreal/workit/pull/212) Use custom retry timeout upon failure
* [#178](https://github.com/VilledeMontreal/workit/pull/178) fix: move from tslint to eslint

#### :books: (Refine Doc)
* [#172](https://github.com/VilledeMontreal/workit/pull/172) docs(examples): add camunda-cloud

#### Committers: 2
- Olivier Albertini ([@OlivierAlbertini](https://github.com/OlivierAlbertini))
- Sylvain Bouchard ([@sylvain-bouchard](https://github.com/sylvain-bouchard))

## 4.1.0 (2020-03-12)

#### :rocket: (Enhancement)
* `workit-types`, `workit-zeebe-client`
  * [#161](https://github.com/VilledeMontreal/workit/pull/161) feat(zeebe): upgrade to 0.22.1
* `workit-bpm-client`, `workit-camunda`, `workit-core`, `workit-types`, `workit-zeebe-client`
  * [#158](https://github.com/VilledeMontreal/workit/pull/158) fix(opentelemetry): upgrade to 0.4.0 

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
