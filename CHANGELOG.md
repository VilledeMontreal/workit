# CHANGELOG

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
