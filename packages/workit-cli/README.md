# WorkIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) [![Greenkeeper badge](https://badges.greenkeeper.io/VilledeMontreal/workit.svg)](https://greenkeeper.io/)

<p align="center"><img src=".repo/render1561149492572.gif?raw=true"/></p>

✨Extensible worker for Node.js that work with both Zeebe and Camunda BPM platforms powered by TypeScript ✨

## Installing

```bash
npm i workit-cli
```

This generator will help you during your development with `workit-camunda`. It provides handy tools.

### Install a fresh new project

```bash
workit init
```
### Generate tasks from your existing BPMN

```bash
workit create task --file /your/path.bpmn
```

### Generate new task

```bash
workit create task
```

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/VilledeMontreal/workit/tags).

## Maintainers

*   **Olivier Albertini** - *Initial work* - [Ville de Montréal](https://github.com/VilledeMontreal)

See also the list of [contributors](CONTRIBUTORS.md) who participated in this project.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

*   [Josh Wulf](https://github.com/jwulf) - zeebe-node inspired me during `workit-cli` development
