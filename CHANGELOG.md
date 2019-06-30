# CHANGELOG

## workit-cli

-   Update template (workit-camunda@2.0.0) and deps

### v2.0.0

## workit-camunda

### v2.0.0

-   Add pagination to `getWorkflows` method. BREAKING CHANGE : the return type is `IPagination<IWorkflow>` 

### v1.0.2

-   Export several classes: `ProcessHandler`, `SimpleCamundaProcessHandler`, `Instrumentation`, `SuccessStrategySimple`, `FailureStrategySimple`

### v1.0.1

-   We have some issues with lerna. This release didn't work. Commit under v1.0.1 is in fact in v1.0.2.
Sorry for that. We try to fix lerna config when publishing Typescript packages through Travis and Lerna.

### v1.0.0

-   Initial release
