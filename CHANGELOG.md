# CHANGELOG

## Unreleased workit-camunda@4.0.0 (2019-10-10)

#### :boom: Breaking Change
*   [#89](https://github.com/VilledeMontreal/workit/pull/89) refactor(workit): add workit-types package
    - rename IPropertiesBase => IWorkflowPropsBase
    - rename Properties => IWorkflowProps
    - Now in `IMessage`, `properties` is not of type IWorkflowProps<TProps> but just it's just a generic so you need to tell `IMessage<MyCustomBody, IWorkflowProps<MyCustomProps>>` instead of `IMessage<MyCustomBody, MyCustomProps>`. The reason is that IMessage is a generic interface and `IWorkflowProps` is for Camunda usage. Workit can be used with rabbitmq, aws sqs etc.. If we develop clients like we did with Zeebe and Camunda BPM.


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
