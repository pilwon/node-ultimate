```sh
                                 _      _    _____   _   _       ____   _____   _____
                                / \ /\ / \  /__ __\ / \ / \__/| /  _ \ /__ __\ /  __/
                                | | || | |    / \   | | | |\/|| | / \ |  / \   |  \
                                | \_/| | |_/\ | |   | | | |  || | |-| |  | |   |  /_
                                \____/ \____/ \_/   \_/ \_/  \| \_/ \ |  \_/   \____\

```

`ultimate` is a dependency library for [ultimate-seed](https://github.com/pilwon/ultimate-seed).

## Installation

    $ npm install ultimate

## Usage

```js
var ultimate = require('ultimate');

// ultimate.fs.glob
ultimate.fs.glob(pattern='**/*', function(err, files));
files = ultimate.fs.globSync(pattern='**/*');

// ultimate.require
modules = ultimate.require(dir='.', isRecursive=true);
```

## License

  `ultimate` is released under the MIT License.
